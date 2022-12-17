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
		err = rows.Scan(&post.PostID, &post.User, &post.Title, &post.Timestamp, &post.Comments, &post.Content, &post.Categories)

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

func addPostHandler(w http.ResponseWriter, r *http.Request) {
	var user string = r.Header.Get("X-Username")
	var post Post
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&post)
	if err != nil {
		log.Println(err.Error())
		w.WriteHeader(400)
		return
	}
	fmt.Println(post)

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
