package main

import (
	"log"
	"net/http"

	"01.kood.tech/git/jrms/real-time-forum/src/server/handlers"
)

func main() {
	// mux := routes()

	http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("./src/webapp"))))
	// http.Handle("/src/webapp/", http.StripPrefix("/src/webapp/", http.FileServer(http.Dir("webapp"))))

	// mux.HandleFunc("/src/server/", handlers.Home)
	http.HandleFunc("/ws", handlers.WsEndPoint)

	go handlers.ListenToWsChannel()
	log.Println("Starting web server on port 8080")
	_ = http.ListenAndServe(":8080", nil)
}
