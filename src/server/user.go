package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"01.kood.tech/git/jrms/real-time-forum/src/server/database"
)

type signupData struct {
	Username  string `json:"username-register"`
	Email     string `json:"email-register"`
	Password  string `json:"password-register"`
	FirstName string `json:"first-name-register"`
	LastName  string `json:"last-name-register"`
	Age       string `json:"age-register"`
	Gender    string `json:"gender-register"`
}

type signinData struct {
	Username string `json:"username_login"`
	Email    string `json:"email_login"`
	Password string `json:"password_login"`
}

type Online struct {
	Username string `json:"name"`
	Unread   bool   `json:"unread"`
}

type Offline struct {
	Username string `json:"name"`
	Unread   bool   `json:"unread"`
}

type Post struct {
	User       string `json:"user"`
	PostID     string `json:"postID"`
	Title      string `json:"title"`
	Content    string `json:"content"`
	Timestamp  string `json:"timestamp"`
	Comments   int    `json:"comments"`
	Categories string `json:"categories"`
}

type Message struct {
	Sender    string `json:"from"`
	Receiver  string `json:"to"`
	Content   string `json:"content"`
	Timestamp string `json:"timestamp"`
}

type Status struct {
	Post    []Post    `json:"posts"`
	Online  []Online  `json:"online"`
	Offline []Offline `json:"offline"`
	Message []Message `json:"messages"`
}

type Data struct {
	Status Status `json:"data"`
}

func SignUpHandler(w http.ResponseWriter, r *http.Request) {
	// some good error handling, dont know what it does really
	// w.Header().Set("Content-Type", "application/json")
	// defer func() {
	// 	if err := recover(); err != nil {
	// 		log.Println(err)
	// 		w.WriteHeader(500)
	// 		jsonResponse, _ := json.Marshal(map[string]string{
	// 			"message": "internal server error",
	// 		})
	// 		w.Write(jsonResponse)
	// 	}
	// }()

	var data signupData
	decoder := json.NewDecoder(r.Body)
	// decoder.DisallowUnknownFields()
	err := decoder.Decode(&data)
	if err != nil {
		log.Println(err.Error())
		w.WriteHeader(400)
		return
	}

	hash, err := database.HashPassword(data.Password)
	if err != nil {
		log.Println(err.Error())
		w.WriteHeader(400)
		return
	}

	_, err = database.Statements["addUser"].Exec(data.Username, data.Email, hash, data.FirstName, data.LastName, data.Age, data.Gender)
	if err != nil {
		log.Println(err.Error())
		jsonResponse := map[string]string{
			"message":     "",
			"requirement": "",
		}
		w.WriteHeader(409)
		if strings.Contains(err.Error(), "users.username") {
			jsonResponse["message"] = "username-register"
			jsonResponse["requirement"] = "Username already taken"
		}
		if strings.Contains(err.Error(), "users.email") {
			jsonResponse["message"] = "email-register"
			jsonResponse["requirement"] = "Email already taken"
		}
		b, _ := json.Marshal(jsonResponse)
		w.Write(b)
		return

	} else {
		fmt.Printf("Added %s to the database", data.Username)
	}
}

func login(w http.ResponseWriter, r *http.Request) {
	var data signinData
	decoder := json.NewDecoder(r.Body)
	// decoder.DisallowUnknownFields()
	err := decoder.Decode(&data)
	if err != nil {
		log.Println(err.Error())
		w.WriteHeader(400)
		return
	}

	var hashpass signinData

	rows, err := database.Statements["getUser"].Query(data.Username, data.Email)
	if err != nil {
		log.Println(err.Error())
		jsonResponse, _ := json.Marshal(map[string]string{
			"message":     "username_login",
			"requirement": "invalid credentials",
		})
		w.Write(jsonResponse)
		return
	}

	for rows.Next() {
		err = rows.Scan(&hashpass.Username, &hashpass.Password)
		if err != nil {
			log.Fatal(err)
		}
	}
	defer rows.Close()
	fmt.Println(data.Password, hashpass.Password)
	fmt.Println("logindata:", data)
	fmt.Println("hashpass:", hashpass)

	isCorrect := database.CheckPasswordHash(data.Password, hashpass.Password)
	fmt.Println("Password:", isCorrect)
	if !isCorrect {
		w.WriteHeader(409)
		jsonResponse, _ := json.Marshal(map[string]string{
			"message":     "password_login",
			"requirement": "Wrong password",
		})
		w.Write(jsonResponse)
		return
	}

	//*
	// Create user sessions
	//*

	fmt.Println("User logged in", hashpass.Username)
	// What to do if user logs in
}

func getUsersHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := database.Statements["getUsers"].Query()
	if err != nil {
		log.Println(err.Error())
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
		// fmt.Printf("%s\n", name)
		// users = append(users, name)
	}
	users.Status.Online = []Online{} // Needed to keep JSon going stupid

	b, _ := json.Marshal(users)
	w.Write(b)
}
