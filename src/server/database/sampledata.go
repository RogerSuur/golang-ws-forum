package database

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
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
	// if we os.Open returns an error then handle it
	if err != nil {
		fmt.Println(err)
	}

	// defer the closing of our jsonFile so that we can parse it later on
	defer jsonFile.Close()

	byteValue, _ := ioutil.ReadAll(jsonFile)

	// we initialize our Users array
	var posts Data

	// we unmarshal our byteArray which contains our
	// jsonFile's content into 'users' which we defined above
	json.Unmarshal(byteValue, &posts)

	statement, err := db.Prepare("INSERT OR IGNORE INTO posts (post_author, title, content, timestamp, categories, comments) VALUES (?,?,?,?,?,?)")
	if err != nil {
		log.Fatal(err.Error())
	}

	for _, v := range posts.Status.Post {
		statement.Exec(arr[rand.Intn(3)*2], v.Title, v.Content, v.Timestamp, v.Categories, v.Comments)
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
	// if we os.Open returns an error then handle it
	if err != nil {
		fmt.Println(err)
	}

	// defer the closing of our jsonFile so that we can parse it later on
	defer jsonFile.Close()

	byteValue, _ := ioutil.ReadAll(jsonFile)

	// we initialize our Users array
	var posts Data

	// we unmarshal our byteArray which contains our
	// jsonFile's content into 'users' which we defined above
	json.Unmarshal(byteValue, &posts)

	statement, err := db.Prepare("INSERT OR IGNORE INTO messages (content, timestamp, from_id, to_id) VALUES (?,?,?,?)")
	if err != nil {
		log.Fatal(err.Error())
	}

	for _, v := range posts.Status.Message {
		user := rand.Intn(3) * 2
		statement.Exec(v.Content, v.Timestamp, arr[user], arr[user+2])
	}
}
