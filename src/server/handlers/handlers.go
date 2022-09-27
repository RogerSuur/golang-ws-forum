package handlers

import (
	"fmt"
	"log"
	"net/http"
	"sort"
	"text/template"

	"01.kood.tech/git/jrms/real-time-forum/src/server/database"

	"github.com/gorilla/websocket"
)

func Home(w http.ResponseWriter, r *http.Request) {
	ts, err := template.ParseFiles("./src/webapp/index.html")
	if err != nil {
		fmt.Println("error in:", err)
	}

	err = ts.Execute(w, nil)
	if err != nil {
		fmt.Println("error in:", err)
	}
}

var wsChan = make(chan WsPayload) // channel that accepts things ws type wspayload

var clients = make(map[WebSocketConnection]string)

// variable used to upgrade connections
var upgradeConnection = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true }, // is security reasons
}

// response type that send back from the websocket
type WsJsonResponse struct {
	Action         string   `json:"action"`
	Message        string   `json:"message"`
	MessageType    string   `json:"message_type"`
	ConnectedUsers []string `json:"connected_users"`
}

type WebSocketConnection struct {
	*websocket.Conn
}

// sending to the server
type WsPayload struct {
	Action   string              `json:"action"`
	Username string              `json:"username"`
	Message  string              `json:"message"`
	Conn     WebSocketConnection `json:"-"`
}

// takes a regular connection and upgrades it to websocket connection
func WsEndPoint(w http.ResponseWriter, r *http.Request) {
	ws, err := upgradeConnection.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
	}

	log.Println("Client connected to endpoint")

	conn := WebSocketConnection{Conn: ws}
	clients[conn] = ""

	go ListenForWs(&conn)
}

func ListenForWs(conn *WebSocketConnection) {
	defer func() {
		if r := recover(); r != nil {
			log.Println("error", fmt.Sprintf("%v", r))
		}
	}()

	var payload WsPayload

	for {
		err := conn.ReadJSON(&payload)
		if err != nil {
			// do nothing
		} else {
			payload.Conn = *conn
			wsChan <- payload
		}
	}
}

func ListenToWsChannel() {
	var response WsJsonResponse

	for {
		for {
			e := <-wsChan // everytime we get a payload from the channel
			// response.Action = "Got here"
			// response.Message = fmt.Sprintf("Some message and action was%v", e.Action)
			switch e.Action {
			case "username":
				// get a list of all users and send it back via broadcast
				clients[e.Conn] = e.Username
				users := getUserList()
				// fmt.Println("ListenToWsChannel finds username to be:", e.Username)
				fmt.Println("my users list: ", users)
				database.UpdateOnlineUsers(users)
				response.Action = "list_users"
				response.ConnectedUsers = users
				BroadcastToAll(response)
			case "left":
				response.Action = "list_users"
				delete(clients, e.Conn)
				fmt.Println("action left", clients)
				users := getUserList()
				database.UpdateOnlineUsers(users)
				response.ConnectedUsers = users
				BroadcastToAll(response)
			}
		}
	}
}

func getUserList() []string {
	var userList []string
	for _, x := range clients {
		userList = append(userList, x)
	}
	sort.Strings(userList)
	return userList
}

func BroadcastToAll(response WsJsonResponse) {
	for client := range clients {
		err := client.WriteJSON(response)
		if err != nil {
			log.Println("websocket error")
			_ = client.Close()
			delete(clients, client)
		}
	}
}
