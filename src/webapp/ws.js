export const userRegister = document.getElementById("username-register")
export let socket = null;
import { currentUser, otherUser, getMessages, getUsers, messagesWrapper, mDB } from './app.js'
import { checkCookie } from './app.js';
import { createSingleMessage } from './populate_messages.js'
import { $ } from "./DOM_helpers.js";

export let webSocketUsers;
let formattedDate = new Date().toLocaleString("en-US", { hour12: false }).replace(",", "");

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
                    //getMessages(otherUser, false)
                    // lastMessage = $(`message-${mDB.length - 1}`)
                    console.log(data);
                    newMessage = createSingleMessage(mDB.length, data.content, data.from, formattedDate)
                    //messagesWrapper.insertBefore(newMessage, lastMessage);
                    messagesWrapper.prepend(newMessage);
                    //getMessages(otherUser, false)
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
export async function sendMessage() {
    let jsonData = {};
    jsonData["action"] = "broadcast";
    jsonData["from"] = currentUser.innerHTML;
    jsonData["to"] = otherUser;
    jsonData["content"] = $('message').value;
    jsonData["timestamp"] = formattedDate;
    socket.send(JSON.stringify(jsonData));

    const res = await fetch('/src/server/addMessageHandler', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
    })

    //console.log("messageData", jsonData);

    if (res.status === 200) {
        console.log("Message sent successfully", res.status)
    } else {
        console.log("Message not sent", res.status)
    }

    $('message').value = "";

}
