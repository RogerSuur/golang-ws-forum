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
	MessageID string `json:"message_id"`
	Sender    string `json:"sender"`
	Receiver  string `json:"receiver"`
	Content   string `json:"content"`
	Timestamp string `json:"timestamp"`
}

type Post struct {
	User      string `json:"user"`
	PostID    string `json:"postID"`
	Title     string `json:"title"`
	Content   string `json:"content"`
	Timestamp string `json:"timestamp"`
	Comments  int    `json:"comments"`
	Category  string `json:"category"`
}

type Comment struct {
	PostID    string `json:"postID"`
	Content   string `json:"content"`
	CommentID string `json:"commentID"`
	Timestamp string `json:"timestamp"`
	Author    string `json:"user"`
}

type Status struct {
	Comment []Comment `json:"comments"`
	Post    []Post    `json:"posts"`
	Online  []Online  `json:"online"`
	Offline []Offline `json:"offline"`
	Message []Message `json:"messages"`
}

type Data struct {
	Status Status `json:"data"`
}

var Statements = map[string]*sql.Stmt{}

func DatabaseGod(generateNew bool) {
	// At one point we need to close the db with defer db.Close(), but where?

	if generateNew {
		if _, err := os.Stat("forum.db"); err == nil {
			fmt.Println("Removing old database file...")
			e := os.Remove("forum.db")
			if e != nil {
				log.Fatal("Error removing database file", e)
			}
		}
		fmt.Println("Creating new database file...")
		_, e := os.Create("forum.db")
		if e != nil {
			log.Fatal(e)
		}
	} else {
		if _, err := os.Stat("forum.db"); err != nil {
			file, err := os.Create("forum.db")
			if err != nil {
				log.Fatal("Database file missing", err)
			}
			file.Close()
		}
	}

	createTable(generateNew)
}

func createTable(generateNew bool) {
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
		category VARCHAR,
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
		timestamp VARCHAR NOT NULL,
		user_id INTEGER NOT NULL REFERENCES users (user_id),
		post_id INTEGER NOT NULL REFERENCES posts
	);
	CREATE TABLE IF NOT EXISTS sessions (
		uuid VARCHAR NOT NULL,
		user_id INTEGER NOT NULL REFERENCES users (id)
	)
	`)

	if err != nil {
		log.Fatal(err.Error())
	}

	if generateNew {
		sampledata(db)
		fmt.Println("Database created successfully!")
	} else {
		fmt.Println("Database opened successfully!")
	}

	//
	for key, query := range map[string]string{
		"addUser":          `INSERT INTO users (username, email, password, first_name, last_name, age, gender) VALUES (?, ?, ?, ?, ?, ?, ?);`,
		"addPost":          `INSERT INTO posts (post_author, title, content, timestamp, category, comments) VALUES (?, ?, ?, ?, ?, ?);`,
		"addMessage":       `INSERT INTO messages (content, timestamp, from_id, to_id) VALUES (?, ?, ?, ?)`,
		"addComment":       `INSERT INTO comments (content, timestamp, user_id, post_id) VALUES (?,?,?,?)`,
		"addSession":       `INSERT INTO sessions (uuid, user_id) VALUES (?,?)`,
		"getUsers":         `SELECT username from users`,
		"deleteSession":    `DELETE FROM sessions WHERE sessions.uuid = ?`,
		"getPosts":         `SELECT post_id, username,title,timestamp, comments, content, category FROM posts LEFT JOIN users AS u2 ON posts.post_author = u2.user_id ORDER BY posts.post_id DESC`,
		"getMessages":      `SELECT message_id, from_id, to_id, content, timestamp FROM messages WHERE (from_id = ? AND to_id = ?) OR (from_id = ? AND to_id = ?) ORDER BY message_id ASC`,
		"getComments":      `SELECT comment_id, username, timestamp, content FROM comments LEFT JOIN users AS u2 ON comments.user_id = u2.user_id WHERE comments.post_id = ? ORDER BY comments.comment_id ASC`,
		"getCommentParent": `SELECT post_id, username, timestamp, content FROM posts LEFT JOIN users AS u2 ON posts.post_author = u2.user_id WHERE post_id = ?`,
		"getID":            `SELECT user_id FROM users WHERE username = ?`,
		"getPostID":        `SELECT post_id FROM posts WHERE title =?`,
		"getUsername":      `SELECT username FROM users WHERE user_id = ?`,
		"getUser":          `SELECT user_id, username, password FROM users WHERE username = ? OR email = ? LIMIT 1`,
		"getUserByUUID":    `SELECT users.username FROM sessions LEFT JOIN users ON users.user_id = sessions.user_id WHERE uuid = ?`,
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

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// remove or add users to jsonfile
func UpdateOnlineUsers(usersList []string) {
	jsonFile, err := os.Open("./src/webapp/static/usersData.json")
	if err != nil {
		fmt.Println("File opening error", err)
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
		fmt.Println("Marshalling error", err)
	}

	err = os.WriteFile("./src/webapp/static/usersData.json", result, 0o644)
	if err != nil {
		panic(err)
	}
}

func UpdateMessagesData(sender string, receiver string, message string) {
	jsonFile, err := os.Open("./src/webapp/static/messagesData.json")
	if err != nil {
		fmt.Println("File opening error", err)
	}

	defer jsonFile.Close()

	byteValue, _ := io.ReadAll(jsonFile)

	var users Data

	json.Unmarshal(byteValue, &users)

	dt := time.Now()

	users.Status.Message = append(users.Status.Message, Message{
		Sender:    sender,
		Receiver:  receiver,
		Content:   message,
		Timestamp: dt.Format("01/02/2006 15:04"),
	})

	// Preparing the data to be marshalled and written.
	result, e := json.MarshalIndent(users, "", "\t")
	if e != nil {
		fmt.Println("Marshalling error", err)
	}

	err = os.WriteFile("./src/webapp/static/messagesData.json", result, 0o644)
	if err != nil {
		panic(err)
	}
}
