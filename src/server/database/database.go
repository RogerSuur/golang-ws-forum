package database

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
)

type Online struct {
	Username string `json:"name"`
	Unread   bool   `json:"unread"`
}

type Offline struct {
	Username string `json:"name"`
	Unread   bool   `json:"unread"`
}

type Status struct {
	Online  []Online  `json:"online"`
	Offline []Offline `json:"offline"`
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
			// fmt.Println(v, i)
			for _, k := range users.Status.Online {
				//	fmt.Println(k)
				if k.Username == v {
					//		fmt.Println(k.Username, " == ", v)
					userExists = true
					break
				}
			}
			if !userExists {
				//	fmt.Println("!userExists:", v, i)
				users.Status.Online = append(users.Status.Online, Online{
					Username: v,
					Unread:   false,
				})
			}
		}
	} else {
		for i, v := range users.Status.Online {
			userExists := false
			// fmt.Println(v, i)
			for _, k := range usersList {
				//	fmt.Println(k)
				if v.Username == k {
					//		fmt.Println(k.Username, " == ", v)
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

	// fmt.Println("list of users.Status.Online:", users.Status.Online)
	// fmt.Println("database.go UpdateOnlineUsers:", usersList)

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
