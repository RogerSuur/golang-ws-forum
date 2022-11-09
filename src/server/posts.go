package main

import (
	"encoding/json"
	"log"
	"net/http"

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
