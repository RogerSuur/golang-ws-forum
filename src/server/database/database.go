package database

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"time"

	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
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

type Post struct {
	User       string `json:"user"`
	PostID     string `json:"postID"`
	Title      string `json:"title"`
	Content    string `json:"content"`
	Timestamp  string `json:"timestamp"`
	Comments   int    `json:"comments"`
	Categories string `json:"categories"`
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

var Statements = map[string]*sql.Stmt{}

func DatabaseGod() {
	// At one point we need to close the db with defer db.Close(), but where?
	if _, err := os.Stat("forum.db"); err != nil {
		file, err := os.Create("forum.db")
		if err != nil {
			log.Fatal(err)
		}
		file.Close()
	}
	createTable()
}

func createTable() {
	db, err := sql.Open("sqlite3", "./forum.db")
	if err != nil {
		log.Fatal(err)
	}
	_, err = db.Exec(` CREATE TABLE IF NOT EXISTS users  (
		user_id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE NOT NULL,
			username TEXT UNIQUE NOT NULL,
			email TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			first_name TEXT,
			last_name TEXT,
			age INTEGER,
			gender TEXT
	);
	CREATE TABLE IF NOT EXISTS posts (
		post_id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE NOT NULL,
		post_author INTEGER NOT NULL,
		title VARCHAR NOT NULL,
		content VARCHAR NOT NULL,
		timestamp VARCHAR NOT NULL,
		categories VARCHAR,
		comments INT,
		FOREIGN KEY (post_author) REFERENCES users (user_id)
	);
	CREATE TABLE IF NOT EXISTS messages (
		message_id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE NOT NULL,
		content VARCHAR NOT NULL,
		timestamp VARCHAR NOT NULL,
		from_id INTEGER NOT NULL REFERENCES users (user_id),
		to_id INTEGER NOT NULL REFERENCES users (user_id)
	);
	CREATE TABLE IF NOT EXISTS comments (
		comment_id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE NOT NULL,
		content VARCHAR NOT NULL,
		user_id INTEGER NOT NULL REFERENCES users (id),
		post_id INTEGER NOT NULL REFERENCES posts
	)
	;
	`)
	if err != nil {
		log.Fatal(err.Error())
	}
	fmt.Println("Database created successfully!")

	//sampledata(db)
	for key, query := range map[string]string{
		"addUser": `INSERT INTO users (username, email, password, first_name, last_name, age, gender) VALUES (?, ?, ?, ?, ?, ?, ?);`,
	} {
		Statements[key], _ = db.Prepare(query)
		if err != nil {
			log.Fatal(err.Error())
		}
	}
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// func CheckPasswordHash(password, hash string) bool {
// 	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
// 	return err == nil
// }

// remove or add users to jsonfile
func UpdateOnlineUsers(usersList []string) {
	jsonFile, err := os.Open("./src/webapp/static/usersData.json")
	if err != nil {
		fmt.Println(err)
	}

	defer jsonFile.Close()
	byteValue, _ := io.ReadAll(jsonFile)

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

	err = os.WriteFile("./src/webapp/static/usersData.json", result, 0o644)
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

	byteValue, _ := io.ReadAll(jsonFile)

	var users Data

	json.Unmarshal(byteValue, &users)

	dt := time.Now()

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

	err = os.WriteFile("./src/webapp/static/messagesData.json", result, 0o644)
	if err != nil {
		panic(err)
	}
}
