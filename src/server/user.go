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

	fmt.Println(data)

	// need to hash the passwords

	_, err = database.Statements["addUser"].Exec(data.Username, data.Email, data.Password, data.FirstName, data.LastName, data.Age, data.Gender)
	if err != nil {
		log.Println(err.Error())
		// pole vaja map-i, lihtsalt response kirja username-register?
		// vb hiljem lisada see reqiurement
		jsonResponse := map[string]string{
			"message":     "",
			"requirement": "",
		}
		w.WriteHeader(409)
		if strings.Contains(err.Error(), "users.username") {
			jsonResponse["message"] = "username-register"
			jsonResponse["requirement"] = "username already taken"
			b, _ := json.Marshal(jsonResponse)
			w.Write(b)
		}
		if strings.Contains(err.Error(), "users.email") {
			jsonResponse, _ := json.Marshal(map[string]string{
				"message":     "email-register",
				"requirement": "Email already taken",
			})
			w.Write(jsonResponse)
		}

		return

	} else {
		b, _ := json.Marshal("")
		w.Write(b)
		fmt.Printf("Added %s to the database", data.Username)
	}
}
