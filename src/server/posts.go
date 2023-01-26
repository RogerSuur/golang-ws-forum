package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"01.kood.tech/git/jrms/real-time-forum/src/server/database"
)

func getPostsHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := database.Statements["getPosts"].Query()
	if err != nil {
		log.Println(err.Error())
		w.WriteHeader(500)
		return
	}
	var posts Data

	for rows.Next() {
		var post Post
		err = rows.Scan(&post.PostID, &post.User, &post.Title, &post.Timestamp, &post.Comments, &post.Content, &post.Category)

		posts.Status.Post = append(posts.Status.Post, post)

		if err != nil {
			log.Println(err.Error())
			w.WriteHeader(500)
			return
		}
	}

	jsonResponse, _ := json.Marshal(posts)
	w.Write(jsonResponse)
}

func getCommentsHandler(w http.ResponseWriter, r *http.Request) {
	var d struct {
		PostID string `json:"postID"`
	}
	// Use json.NewDecoder to read the request body and unmarshal it into the data struct
	err := json.NewDecoder(r.Body).Decode(&d)
	if err != nil {
		log.Println("Error with decoding JSON", err.Error())
		w.WriteHeader(400)
		return
	}

	rows, err := database.Statements["getComments"].Query(d.PostID)
	if err != nil {
		log.Println(err.Error())
		w.WriteHeader(500)
		return
	}

	var comments Data
	var comment Comment

	comment, err = getCommentParent(d.PostID)
	comments.Status.Comment = append(comments.Status.Comment, comment)
	for rows.Next() {

		err = rows.Scan(&comment.CommentID, &comment.Author, &comment.Timestamp, &comment.Content)

		comments.Status.Comment = append(comments.Status.Comment, comment)

		if err != nil {
			log.Println(err.Error())
			w.WriteHeader(500)
			return
		}
	}

	jsonResponse, _ := json.Marshal(comments)
	w.Write(jsonResponse)
}

func getMessagesHandler(w http.ResponseWriter, r *http.Request) {
	// Get id-s or usernames from r.body
	var d struct {
		Sender   string `json:"sender"`
		Receiver string `json:"receiver"`
	}

	// Use json.NewDecoder to read the request body and unmarshal it into the data struct
	err := json.NewDecoder(r.Body).Decode(&d)
	if err != nil {
		log.Println("Error with decoding JSON", err.Error())
		w.WriteHeader(400)
		return
	}

	// GET id-s
	ID1, err := getID(d.Sender)
	if err != nil {
		log.Println("Error with getting IDs", err.Error())
		w.WriteHeader(500)
		return
	}

	ID2, err := getID(d.Receiver)
	if err != nil {
		log.Println("Error with getting IDs", err.Error())
		w.WriteHeader(500)
		return
	}

	// then
	messages, err := getMessagesQuery(ID1, ID2)
	if err != nil {
		log.Println("Error with messages query", err.Error())
		w.WriteHeader(500)
		return
	}

	w.Write(messages)
}

func getMessagesQuery(ID1 string, ID2 string) ([]byte, error) {
	rows, err := database.Statements["getMessages"].Query(ID1, ID2, ID2, ID1)
	if err != nil {
		log.Println("Erron in reading rows", err.Error())
		return nil, err
	}
	var messages Data

	for rows.Next() {
		var message Message
		err = rows.Scan(&message.MessageID, &message.Sender, &message.Receiver, &message.Content, &message.Timestamp)

		message.Receiver, _ = getUsername(message.Receiver)
		message.Sender, _ = getUsername(message.Sender)

		messages.Status.Message = append(messages.Status.Message, message)

		if err != nil {
			log.Println("Error in building the message struct", err.Error())
			return nil, err
		}
	}
	// fmt.Println("Last message retrieved: ", messages.Status.Message[len(messages.Status.Message)-1])
	jsonResponse, err := json.Marshal(messages)
	if err != nil {
		log.Println("Error with generating JSON response", err.Error())
		return nil, err
	}
	return jsonResponse, nil
}

func addPostHandler(w http.ResponseWriter, r *http.Request) {
	// var user string = r.Header.Get("X-Username")
	var post Post
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&post)
	if err != nil {
		log.Println("Decoder error:", err.Error())
		w.WriteHeader(400)
		return
	}

	post.User, _ = getID(post.User)
	// currentTime := time.Now().UTC()
	// post.Timestamp = currentTime.Format(time.RFC3339)
	// post.Category = "Lorem"
	// post.Comments = 0
	// fmt.Printf("Empty %+v\n", post)
	_, err = database.Statements["addPost"].Exec(post.User, post.Title, post.Content, post.Timestamp, post.Category, post.Comments)
	if err != nil {
		log.Println("Error with adding post", err.Error())
		w.WriteHeader(500)
		return
	}

	b, _ := json.Marshal("ok")
	w.Write(b)
}

func addMessageHandler(w http.ResponseWriter, r *http.Request) {
	var message Message
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&message)
	if err != nil {
		log.Println("Decoder error:", err.Error())
		w.WriteHeader(400)
		return
	}

	dt := time.Now()
	message.Timestamp = dt.Format("2006/1/2 15:04:05")
	// fmt.Println("Adding message:", message)

	message.Sender, _ = getID(message.Sender)
	message.Receiver, _ = getID(message.Receiver)

	_, err = database.Statements["addMessage"].Exec(message.Content, message.Timestamp, message.Sender, message.Receiver)
	if err != nil {
		log.Println("Error with adding message", err.Error())
		w.WriteHeader(500)
		return
	}

	b, _ := json.Marshal("ok")
	w.Write(b)
}

func addCommentsHandler(w http.ResponseWriter, r *http.Request) {
	// var user string = r.Header.Get("X-Username")
	var comment Comment
	decoder := json.NewDecoder(r.Body)
	// fmt.Printf("Empty %+v\n", comment)
	err := decoder.Decode(&comment)
	if err != nil {
		log.Println("Decoder error:", err.Error())
		w.WriteHeader(400)
		return
	}
	// fmt.Printf("Filled %+v\n", comment)
	// currentTime := time.Now().UTC()
	// formattedTime := currentTime.Format(time.RFC3339)
	// comment.Timestamp = formattedTime

	comment.Author, _ = getID(comment.Author)
	fmt.Println("Adding comment:", comment)
	_, err = database.Statements["addComment"].Exec(comment.Content, comment.Timestamp, comment.Author, comment.PostID)
	if err != nil {
		log.Println("Error with adding message", err.Error())
		w.WriteHeader(500)
		return
	}

	b, _ := json.Marshal("ok")
	w.Write(b)
}

func getPostID(name string) (string, error) { // This func seems to be unused?
	rows, err := database.Statements["getPostID"].Query(name)
	if err != nil {
		log.Println("Error getting postID", err.Error())
		return "0", err
	}
	defer rows.Close()
	postID := ""
	rows.Next()
	rows.Scan(&postID)
	rows.Close()
	return postID, nil
}

func getCommentParent(postID string) (Comment, error) { // This func seems to be unused?
	var parentPost Comment
	rows, err := database.Statements["getCommentParent"].Query(postID)
	if err != nil {
		log.Println("Error getting postID", err.Error())
		return parentPost, err
	}
	defer rows.Close()
	rows.Next()
	rows.Scan(&parentPost.PostID, &parentPost.Author, &parentPost.Timestamp, &parentPost.Content)
	rows.Close()
	return parentPost, nil
}

func getID(name string) (string, error) {
	rows, err := database.Statements["getID"].Query(name)
	if err != nil {
		log.Println("Error getting ID", err.Error())
		return "0", err
	}
	defer rows.Close()
	ID := ""
	rows.Next()
	rows.Scan(&ID)
	rows.Close()
	return ID, nil
}

func getUsername(ID string) (string, error) {
	rows, err := database.Statements["getUsername"].Query(ID)
	if err != nil {
		log.Println("Error getting username", err.Error())
		return "0", err
	}
	defer rows.Close()
	username := ""
	rows.Next()
	rows.Scan(&username)
	rows.Close()
	return username, nil
}
