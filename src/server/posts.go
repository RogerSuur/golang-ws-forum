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
		return
	}
	var posts Data

	for rows.Next() {
		var post Post
		err = rows.Scan(&post.PostID, &post.User, &post.Title, &post.Timestamp, &post.Comments, &post.Content, &post.Categories)

		posts.Status.Post = append(posts.Status.Post, post)

		if err != nil {
			log.Println(err.Error())
			return
		}
	}

	jsonResponse, _ := json.Marshal(posts)
	w.Write(jsonResponse)
}

func addPostHandler(w http.ResponseWriter, r *http.Request) {
	var post Post
	decoder := json.NewDecoder(r.Body)
	// decoder.DisallowUnknownFields()
	err := decoder.Decode(&post)
	if err != nil {
		log.Println(err.Error())
		w.WriteHeader(400)
		return
	}

	post.User, _ = getID("Jack")
	dt := time.Now()
	post.Timestamp = dt.Format("01/02/2006 15:04")
	post.Categories = "Lorem"
	post.Comments = 0

	_, err = database.Statements["addPost"].Exec(post.User, post.Title, post.Content, post.Timestamp, post.Categories, post.Comments)
	if err != nil {
		log.Println(err.Error())
		return
	}
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
	// fmt.Println(ID)
	return ID, nil
}
