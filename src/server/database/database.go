package database

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"time"
)

type Online struct {
	Username string `json:"name"`
	Unread   bool   `json:"unread"`
}

type Offline struct {
	Username string `json:"name"`
	Unread   bool   `json:"unread"`
}

type Message struct {
	From      string `json:"from"`
	To        string `json:"to"`
	Content   string `json:"content"`
	Timestamp string `json:"timestamp"`
}

type Status struct {
	Online  []Online  `json:"online"`
	Offline []Offline `json:"offline"`
	Message []Message `json:"messages"`
}

type Data struct {
	Status Status `json:"data"`
}

// remove or add users to jsonfile
func UpdateOnlineUsers(usersList []string) {
	// Open our jsonFile
	jsonFile, err := os.Open("./src/webapp/static/usersData.json")
	if err != nil {
		fmt.Println(err)
	}

	// defer the closing of our jsonFile so that we can parse it later on
	defer jsonFile.Close()

	// read our opened jsonFile as a byte array.
	byteValue, _ := ioutil.ReadAll(jsonFile)

	// we initialize our Users array
	var users Data

	json.Unmarshal(byteValue, &users)

	// check wether to add or delete users from the "database"
	if len(usersList) > len(users.Status.Online) {
		for _, v := range usersList {
			userExists := false
			for _, k := range users.Status.Online {
				if k.Username == v {
					userExists = true
					break
				}
			}
			if !userExists {
				users.Status.Online = append(users.Status.Online, Online{
					Username: v,
					Unread:   false,
				})
			}
		}
	} else {
		for i, v := range users.Status.Online {
			userExists := false
			for _, k := range usersList {
				if v.Username == k {
					userExists = true
					break
				}
			}
			if !userExists {
				//	remove it from database
				users.Status.Online = users.Status.Online[:i]
			}
		}
	}

	// Preparing the data to be marshalled and written.
	result, e := json.MarshalIndent(users, "", "\t")
	if e != nil {
		fmt.Println("error", err)
	}

	err = ioutil.WriteFile("./src/webapp/static/usersData.json", result, 0o644)
	if err != nil {
		panic(err)
	}
}

func UpdateMessagesData(sender string, receiver string, message string) {
	jsonFile, err := os.Open("./src/webapp/static/messagesData.json")
	if err != nil {
		fmt.Println(err)
	}

	defer jsonFile.Close()

	byteValue, _ := ioutil.ReadAll(jsonFile)

	// we initialize our Users array
	var users Data

	json.Unmarshal(byteValue, &users)

	dt := time.Now()
	// dt.Format("01/02/2006 15:04")

	users.Status.Message = append(users.Status.Message, Message{
		From:      sender,
		To:        receiver,
		Content:   message,
		Timestamp: dt.Format("01/02/2006 15:04"),
	})

	// Preparing the data to be marshalled and written.
	result, e := json.MarshalIndent(users, "", "\t")
	if e != nil {
		fmt.Println("error", err)
	}

	err = ioutil.WriteFile("./src/webapp/static/messagesData.json", result, 0o644)
	if err != nil {
		panic(err)
	}
}
