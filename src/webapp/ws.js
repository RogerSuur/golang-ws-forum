export const userInput = document.getElementById("username")
export const userNameInput = document.getElementById("usernameinput")
export let socket = null;
import { currentUser, getUsers } from './app.js'
import { otherUser } from './app.js';
import { getMessages } from './app.js';


export function Forum() {

    window.onbeforeunload = function () {
        let jsonData = {};
        jsonData["action"] = "left";
        socket.send(JSON.stringify(jsonData))
    }

    // document.addEventListener("DOMContentLoaded", function () {
    socket = new WebSocket("ws://localhost:8080/ws");

    socket.onopen = () => {
        console.log("Successfully connected");
    };

    socket.onclose = () => {
        console.log("Connection closed");
    };

    socket.onmessage = (msg) => {
        let data = JSON.parse(msg.data);
        console.log("Action is", data.action);
        switch (data.action) {
            case "list_users":
                getUsers()
                console.log("currentUser:", currentUser.value)
                break;
            case "broadcast":
                console.log("currentUser:", currentUser.value)
                console.log("otherUser: ", otherUser)
                getMessages(currentUser.value, otherUser)
        }
    };

    socket.onerror = (error) => {
        console.log("there was an error");
    };

    //Later be replaced
    userInput.addEventListener("change", function () {
        let jsonData = {}; // json send to websocket
        jsonData["action"] = "username";
        jsonData["username"] = this.value; // whatever i type in the form input
        let currentUser = document.querySelector(".current-user").textContent = this.value
        socket.send(JSON.stringify(jsonData)); //send it as jsondata
    });

    userNameInput.addEventListener("change", function () {
        let jsonData = {};
        jsonData["action"] = "username";
        jsonData["username"] = this.value;
        let currentUser = document.querySelector(".current-user").textContent = this.value
        socket.send(JSON.stringify(jsonData));
    });

    // });
}

//send messages to server
export function sendMessage() {
    let jsonData = {};
    jsonData["action"] = "broadcast";
    //console.log("sendMesagge from js func");
    //console.log(document.getElementById("username").value);
    jsonData["other_user"] = otherUser;
    jsonData["username"] = document.getElementById("username").value;
    jsonData["message"] = document.getElementById("message").value;
    socket.send(JSON.stringify(jsonData))
    document.getElementById("message").value = "";
}