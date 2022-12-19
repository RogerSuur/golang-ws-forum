export const userRegister = document.getElementById("username-register")
export let socket = null;
import { currentUser, otherUser, getUsers, messagesWrapper, mDB } from './app.js'
import { checkCookie } from './app.js';
import { createSingleMessage } from './populate_messages.js'
import { $ } from "./DOM_helpers.js";

export let webSocketUsers;
let formattedDate

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
            let lastMessage = $(`message-${mDB.length - 1}`)
            let newMessage;
            console.log("Action is", data.action);
            switch (data.action) {
                case "list_users":
                    webSocketUsers = data.connected_users
                    getUsers()
                    // alert("list_users")
                    //console.log("currentUser:", currentUser.value)
                    break;
                case "broadcast":
                    console.log("currentUser:", currentUser.innerHTML)
                    console.log("otherUser: ", otherUser)
                    newMessage = createSingleMessage(mDB.length, data.message, data.fromUser, formattedDate)
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
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1; // months are 0-based, so we need to add 1
    const day = currentDate.getDate();
    const year = currentDate.getFullYear();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const seconds = currentDate.getSeconds()
    formattedDate = `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
    jsonData["timestamp"] = formattedDate
    console.log(jsonData["timestamp"]);
    socket.send(JSON.stringify(jsonData));
    $('message').value = "";

}
