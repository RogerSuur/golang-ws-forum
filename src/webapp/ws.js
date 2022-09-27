export const userInput = document.getElementById("username")
import {getUsers} from './app.js'

export function Forum() {
    let socket = null;

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
                    break;
            }
        };

        //let userInput = document.getElementById("username"); //reference to form control
        userInput.addEventListener("change", function () {
            let jsonData = {}; // json send to websocket
            jsonData["action"] = "username";
            jsonData["username"] = this.value; // whatever i type in the form input
            socket.send(JSON.stringify(jsonData)); //send it as jsondata
        });

        socket.onerror = (error) => {
            console.log("there was an error");
        };
    // });
}
