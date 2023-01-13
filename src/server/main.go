package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"01.kood.tech/git/jrms/real-time-forum/src/server/database"
	"01.kood.tech/git/jrms/real-time-forum/src/server/handlers"
)

func main() {
	mux := routes() // redirects a request to a handler.

	// http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("./src/webapp"))))
	// http.HandleFunc("/ws", handlers.WsEndPoint)
	// _ = http.ListenAndServe(":8080", nil)
	generateNew := false
	args := os.Args[1:]

	if len(args) > 0 {
		if args[0] == "-new" {
			generateNew = true
		} else {
			fmt.Println("Error: Incorrect argument.\n\nUsage: go run src/server/*.go -new")
			os.Exit(0)
		}
	}

	database.DatabaseGod(generateNew)
	go handlers.ListenToWsChannel()
	log.Println("Starting web server on port 8080")
	server := &http.Server{
		Addr:    "localhost:8080",
		Handler: mux,
	}
	server.ListenAndServe()
}
