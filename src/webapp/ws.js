export const userRegister = document.getElementById("username-register")
export let socket = null;
import { currentUser, otherUser, getUsers, messagesWrapper, mDB } from './app.js'
import { checkCookie } from './app.js';
import { createSingleMessage } from './populate_messages.js'
import { $ } from "./DOM_helpers.js";

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
            let lastMessage = $(`message-${mDB.length-1}`)
            let newMessage;
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
                    console.log("currentUser:", currentUser.innerHTML)
                    console.log("otherUser: ", otherUser)
                    newMessage = createSingleMessage(mDB.length, data.message, data.fromUser, Date.now())
                    messagesWrapper.insertBefore(newMessage, lastMessage);
                    //getMessages(currentUser.value, otherUser)
                    break;
                case "login":
                    console.log("login in socket")
            }
        };

        socket.onerror = (error) => {
            console.log("there was an error", error);
        };
    })
}

//send messages to server
export function sendMessage() {
    let jsonData = {};
    jsonData["action"] = "broadcast";
    jsonData["other_user"] = otherUser;
    jsonData["username"] = currentUser.innerHTML;
    jsonData["message"] = $('message').value;
    jsonData["timestamp"] = Date.now();
    socket.send(JSON.stringify(jsonData));
    $('message').value = "";

}
