package main

import (
	"encoding/json"
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
		err = rows.Scan(&post.PostID, &post.User, &post.Title, &post.Timestamp, &post.Comments, &post.Content, &post.Categories)

		posts.Status.Post = append(posts.Status.Post, post)

		if err != nil {
			log.Println(err.Error())
			w.WriteHeader(500)
			return
		}
	}

	// fmt.Println(posts)
	jsonResponse, _ := json.Marshal(posts)
	w.Write(jsonResponse)
}

func getCommentsHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := database.Statements["getComments"].Query()
	if err != nil {
		log.Println(err.Error())
		w.WriteHeader(500)
		return
	}
	var comments Data

	for rows.Next() {
		var comment Comment
		err = rows.Scan(&comment.CommentID, &comment.Author, &comment.PostID, &comment.Timestamp, &comment.Content)

		comments.Status.Comment = append(comments.Status.Comment, comment)

		if err != nil {
			log.Println(err.Error())
			w.WriteHeader(500)
			return
		}
	}

	// fmt.Println(comments)
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
		log.Println(err.Error())
		w.WriteHeader(400)
		return
	}

	// GET id-s
	ID1, err := getID(d.Sender)
	if err != nil {
		log.Println(err.Error())
		w.WriteHeader(500)
		return
	}

	ID2, err := getID(d.Receiver)
	if err != nil {
		log.Println(err.Error())
		w.WriteHeader(500)
		return
	}

	// then
	messages, err := getMessagesQuery(ID1, ID2)
	if err != nil {
		log.Println(err.Error())
		w.WriteHeader(500)
		return
	}

	w.Write(messages)
}

func getMessagesQuery(ID1 string, ID2 string) ([]byte, error) {
	rows, err := database.Statements["getMessages"].Query(ID1, ID2, ID2, ID1)
	if err != nil {
		log.Println(err.Error())
		return nil, err
	}
	var messages Data

	for rows.Next() {
		var message Message
		// TODO: ID needs to be replaced with username
		err = rows.Scan(&message.MessageID, &message.Sender, &message.Receiver, &message.Content, &message.Timestamp)

		message.Receiver, _ = getUsername(message.Receiver)
		message.Sender, _ = getUsername(message.Sender)

		messages.Status.Message = append(messages.Status.Message, message)

		if err != nil {
			log.Println(err.Error())
			return nil, err
		}
	}

	jsonResponse, err := json.Marshal(messages)
	if err != nil {
		log.Println(err.Error())
		return nil, err
	}
	return jsonResponse, nil
}

func addPostHandler(w http.ResponseWriter, r *http.Request) {
	var user string = r.Header.Get("X-Username")
	var post Post
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&post)
	if err != nil {
		log.Println("Decoder error:", err.Error())
		w.WriteHeader(400)
		return
	}

	post.User, _ = getID(user)
	dt := time.Now()
	post.Timestamp = dt.Format("01/02/2006 15:04")
	post.Categories = "Lorem"
	post.Comments = 0

	_, err = database.Statements["addPost"].Exec(post.User, post.Title, post.Content, post.Timestamp, post.Categories, post.Comments)
	if err != nil {
		log.Println(err.Error())
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

	message.Sender, _ = getID(message.Sender)
	message.Receiver, _ = getID(message.Receiver)

	_, err = database.Statements["addMessage"].Exec(message.Content, message.Timestamp, message.Sender, message.Receiver)
	if err != nil {
		log.Println(err.Error())
		w.WriteHeader(500)
		return
	}

	b, _ := json.Marshal("ok")
	w.Write(b)
}

func getID(name string) (string, error) {
	rows, err := database.Statements["getID"].Query(name)
	if err != nil {
		log.Println(err.Error())
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
		log.Println(err.Error())
		return "0", err
	}
	defer rows.Close()
	username := ""
	rows.Next()
	rows.Scan(&username)
	rows.Close()
	return username, nil
}
