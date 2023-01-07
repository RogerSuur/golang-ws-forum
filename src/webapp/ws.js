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

                    //check wether to send notification or display msg
                    if (!sendNotification(currentUser.innerHTML, data.from)) {
                        newMessage = createSingleMessage(mDB.length, data.content, data.from, formattedDate)
                        messagesWrapper.prepend(newMessage);
                    }

                    // lastMessage = $(`message-${mDB.length - 1}`)
                    console.log(data);
                    // //only if the chat with the receiver is open display the msg
                    // newMessage = createSingleMessage(mDB.length, data.content, data.from, formattedDate)
                    // //messagesWrapper.insertBefore(newMessage, lastMessage);
                    // messagesWrapper.prepend(newMessage);
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

//Checks which conversation is open
function sendNotification(currentUser, sender) {
    //determine if msg receiver has chat window open
    console.log("currentUser", currentUser);
    console.log("msg sender", sender);
    if (sender === currentUser) {
        return false
    }

    let div = document.querySelector('.messages-area');
    let messagesHeaderText = document.querySelector('.messages-header-text');

    if (div.classList.contains('hidden')) {
        console.log('The div is hidden');
        return true
        //set notification next to bubble to msg sender username
    } else {
        console.log('The div is not hidden');

        //check the user with whom the chat is open
        console.log(messagesHeaderText.textContent);
        if (messagesHeaderText.textContent === `Your conversation with ${sender}`) {
            return false
        }
        return true
    }
}