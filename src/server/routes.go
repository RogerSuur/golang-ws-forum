package main

import (
	"net/http"

	"01.kood.tech/git/jrms/real-time-forum/src/server/handlers"
)

func routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/src/server/", handlers.Home)
	// mux.HandleFunc("/src/server/err", err)

	// mux.HandleFunc("/src/server/login", login)
	// mux.HandleFunc("/src/server/logout", logout)
	mux.HandleFunc("/src/server/signup", SignUpHandler)
	// mux.HandleFunc("/src/server/signup_account", signupAccount)
	// mux.HandleFunc("/src/server/authenticate", authenticate)
	mux.HandleFunc("/ws", handlers.WsEndPoint)
	mux.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("./src/webapp"))))
	// files := http.FileServer(http.Dir("/public"))
	// mux.Handle("/", http.StripPrefix("/", files))
	return mux
}
