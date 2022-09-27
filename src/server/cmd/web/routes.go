package main

import (
	"net/http"

	"01.kood.tech/git/jrms/real-time-forum/src/server/handlers"
)

func routes() http.Handler {
	mux := http.NewServeMux()
	// mux.HandleFunc("/src/server/", handlers.Home)
	mux.HandleFunc("/ws", handlers.WsEndPoint)
	return mux
}
