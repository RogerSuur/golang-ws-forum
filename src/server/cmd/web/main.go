package main

import (
	"log"
	"net/http"

	//"01.kood.tech/git/jrms/real-time-forum/src/server/database"
	"01.kood.tech/git/jrms/real-time-forum/src/server/handlers"
)

func main() {
	mux := routes() // redirects a request to a handler.

	// http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("./src/webapp"))))
	// http.HandleFunc("/ws", handlers.WsEndPoint)
	// _ = http.ListenAndServe(":8080", nil)

	// database.DatabaseGod()
	go handlers.ListenToWsChannel()
	log.Println("Starting web server on port 8080")
	server := &http.Server{
		Addr:    "localhost:8080",
		Handler: mux,
	}
	server.ListenAndServe()
}
