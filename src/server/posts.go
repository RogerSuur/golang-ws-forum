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
		w.WriteHeader(400)
		return
	}
	var users Data

	for rows.Next() {
		var username Offline
		err = rows.Scan(&username.Username)
		users.Status.Offline = append(users.Status.Offline, Offline{
			Username: username.Username,
			Unread:   false,
		})

		if err != nil {
			log.Println(err.Error())
			w.WriteHeader(400)
			return
		}
	}

	// empty online struct to avoid null.length() problems on client side.
	users.Status.Online = []Online{}

	jsonResponse, _ := json.Marshal(users)
	w.Write(jsonResponse)
}
