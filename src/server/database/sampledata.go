package database

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math/rand"
	"os"
)

var (
	m   = make(map[string]string)
	arr = []string{}
)

func sampledata(db *sql.DB) {
	insertSampleUsers(db)
	insertSamplePosts(db)
	insertSampleMessages(db)
}

func insertSamplePosts(db *sql.DB) {
	jsonFile, err := os.Open("./src/webapp/static/postsData.json")
	if err != nil {
		fmt.Println(err)
	}

	defer jsonFile.Close()

	byteValue, _ := io.ReadAll(jsonFile)

	var posts Data

	json.Unmarshal(byteValue, &posts)

	statement, err := db.Prepare("INSERT OR IGNORE INTO posts (post_author, title, content, timestamp, categories, comments) VALUES (?,?,?,?,?,?)")
	if err != nil {
		log.Fatal(err.Error())
	}

	for _, v := range posts.Status.Post {
		statement.Exec(rand.Intn(6)+1, v.Title, v.Content, v.Timestamp, v.Categories, v.Comments)
	}

	if err != nil {
		log.Fatal(err.Error())
	}
	fmt.Println("Sampleposts inserted successfully!")
}

func insertSampleUsers(db *sql.DB) {
	statement, err := db.Prepare("INSERT OR IGNORE INTO users (username, email, password, first_name, last_name, age, gender) VALUES (?,?,?,?,?,?,?)")
	if err != nil {
		log.Fatal(err.Error())
	}

	m = map[string]string{
		"Mark":   "Mark@gmail.com",
		"Kate":   "Kate@gmail.com",
		"John":   "John@gmail.com",
		"Susan":  "Susan@gmail.com",
		"Vic666": "Vic666@gmail.com",
		"Mike":   "Mike@gmail.com",
		"Jack":   "Jack@gmail.com",
	}

	count := 0
	for k, v := range m {
		arr = append(arr, k, v)
		hash, err := HashPassword("1234")
		if err != nil {
			log.Fatal(err.Error())
		}
		statement.Exec(arr[count], arr[count+1], hash, "", "", "", "")
		count += 2
	}

	if err != nil {
		log.Fatal(err.Error())
	}
	fmt.Println("Sampleusers inserted successfully!")
}

func insertSampleMessages(db *sql.DB) {
	jsonFile, err := os.Open("./src/webapp/static/messagesData.json")
	if err != nil {
		fmt.Println(err)
	}

	defer jsonFile.Close()

	byteValue, _ := io.ReadAll(jsonFile)

	var posts Data

	json.Unmarshal(byteValue, &posts)

	statement, err := db.Prepare("INSERT OR IGNORE INTO messages (content, timestamp, from_id, to_id) VALUES (?,?,?,?)")
	if err != nil {
		log.Fatal(err.Error())
	}

	for _, v := range posts.Status.Message {
		ranInt := rand.Intn(7)
		ranInt2 := rand.Intn(7)
		if ranInt == ranInt2 {
			ranInt += 1
			if ranInt > 6 {
				ranInt = 0
			}
		}

		statement.Exec(v.Content, v.Timestamp, ranInt+1, ranInt2+1)

	}
}
