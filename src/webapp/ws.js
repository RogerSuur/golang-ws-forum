export const userRegister = document.getElementById("username-register")
export let socket = null;
import { currentUser, getUsers } from './app.js'
import { otherUser } from './app.js';
import { getMessages } from './app.js';
import { checkCookie } from './app.js';

export let webSocketUsers;

export function Forum() {

    window.onbeforeunload = function () {
        let jsonData = {};
        jsonData["action"] = "left";
        socket.send(JSON.stringify(jsonData))
    }

    //window.load = checkCookie()

    document.addEventListener("DOMContentLoaded", function () {
        socket = new WebSocket("ws://localhost:8080/ws");

        socket.onopen = () => {
            console.log("Successfully connected");
            checkCookie()
        };

        socket.onclose = () => {
            console.log("Connection closed");
        };

        socket.onmessage = (msg) => {
            let data = JSON.parse(msg.data);
            console.log("Action is", data.action);
            switch (data.action) {
                case "list_users":
                    //console.log("list_users data:", data);
                    //console.log("data.connected_users:", data.connected_users);
                    // console.log(typeof data.connected_users) == object
                    webSocketUsers = data.connected_users
                    getUsers()
                    // alert("list_users")
                    //console.log("currentUser:", currentUser.value)
                    break;
                case "broadcast":
                    // console.log("currentUser:", currentUser.value)
                    // console.log("otherUser: ", otherUser)
                    console.log("received data:", data);
                    getMessages(currentUser.value, otherUser)
                case "login":
                    console.log("login in socket")
            }
        };

        socket.onerror = (error) => {
            console.log("there was an error");
        };
    })
}

//send messages to server
export function sendMessage() {
    let jsonData = {};
    let message = document.getElementById("message")
    jsonData["action"] = "broadcast";
    jsonData["other_user"] = otherUser;
    jsonData["username"] = currentUser.innerHTML
    jsonData["message"] = message.value
    console.log(jsonData);
    socket.send(JSON.stringify(jsonData))
    message.value = "";
}
