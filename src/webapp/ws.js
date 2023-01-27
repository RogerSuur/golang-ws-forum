export const userRegister = document.getElementById("username-register")
export let socket = null;
import { currentUser, otherUser, getUsers, mDB, messagesWrapper, postsWrapper, spinner, sleep, loadTime, getPosts, makeLinksClickable } from './app.js'
import { createSingleMessage } from './messages.js'
import { createDiv, $, qS, formatTimeStamp } from "./DOM_helpers.js";
import { hide, show } from "./visibility_togglers.js";
import { checkCookie } from './validate.js';

export let webSocketUsers;
let formattedDate = new Date().toISOString();

export function Forum() {

    let mDBlength = 0;

    window.onbeforeunload = function () {
        let jsonData = {};
        jsonData["action"] = "left";
        socket.send(JSON.stringify(jsonData))
    }

    //window.load = checkCookie()
    
    // This needs to be moved out from here - it causes duplicate event listeners when multiple windows are open
    // Probably should heppen only after a sucessful login???
    // check https://stackoverflow.com/questions/47233581/socket-io-duplicate-emit-on-second-window
    document.addEventListener("DOMContentLoaded", function () {
        socket = new WebSocket("ws://localhost:8080/ws");

        socket.onopen = () => {
            console.log("Successfully connected");
            checkCookie(currentUser.innerHTML)
        };

        socket.onclose = () => {
            console.log("Connection closed");
        };

        socket.onmessage = (msg) => {
            let data = JSON.parse(msg.data);
            console.log("Action is", data.action);
            switch (data.action) {
                case "new_post":
                    //console.log("new posts", data.posts)
                    if (data.from != currentUser.innerHTML) {
                        //console.log("new posts to be seen!", data)
                        let loadMore = createDiv([`load-more`, `posts`], `New posts have been added in real time! Load more ...`);
                        postsWrapper.prepend(loadMore);
                        loadMore.addEventListener("click", () => {
                            loadMore.remove();
                            //console.log("Load more posts", data.posts)
                            let postsAreaRect = qS('posts-area').getBoundingClientRect();
                            let x = postsAreaRect.left + postsAreaRect.width / 2 - 40;
                            let y = postsAreaRect.bottom - 100;
                            spinner.setAttribute('style', `left: ${x}px; top: ${y}px;`);
                            show(spinner);
                            sleep(loadTime);
                            hide(spinner);
                            getPosts(0, true)
                                .then(() => { makeLinksClickable() })
                                .catch(error => console.log(error))
                        })

                    }
                    break
                case "list_users":
                    webSocketUsers = data.connected_users
                    getUsers()
                    // alert("list_users")
                    //console.log("currentUser:", currentUser.value)
                    break;
                case "broadcast":
                    //check wether to send notification or display msg
                    console.log("broadcasting")

                    sortUsersbyLastMessage(data.from)
                    //console.log("currentuser.innerHTML:", currentuser.innerHTML, "otherUser", `${data.from}`);
                    if (!sendNotification(currentUser.innerHTML, data.from)) {
                        // refresh messages database
                        //console.log("Updating messages from WS with ", currentUser.innerHTML, otherUser)
                        /*
                        let's remove updateMessages from here now
                        updateMessages(currentUser.innerHTML, otherUser)
                            .then((response) => response.length)
                            .then((mDBlength) => {
                                //console.log("mDBlength", mDBlength)
                                */
                        if (mDB.length - 1 > mDBlength) {
                            mDBlength = mDB.length;
                        } else {
                            mDBlength += 1;
                        }
                        let newMessage = createSingleMessage(mDBlength, data.content, data.from, formatTimeStamp(formattedDate))
                        messagesWrapper.prepend(newMessage);
                        /*
                        )})
                        .catch(error => console.log(error))
                        */
                    } else {
                        //display notification
                        const user = $(`${data.from}`);
                        //sortUsersbyLastMessage(user.id)

                        let notification = user.querySelector('.notification')
                        if (notification) {
                            const currentValue = parseInt(notification.innerHTML);
                            notification.innerHTML = currentValue + 1;
                        } else {
                            notification = document.createElement('span');
                            notification.setAttribute('class', 'notification')
                            user.appendChild(notification);
                            notification.innerHTML = 1;
                        }
                    }
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
    // console.log("Updating messages on sending message with", currentUser.innerHTML, otherUser)
    // await updateMessages(currentUser.innerHTML, otherUser)

    try {
        const jsonData = {};
        jsonData["action"] = "broadcast";
        jsonData["from"] = currentUser.innerHTML;
        jsonData["to"] = otherUser;
        jsonData["content"] = $('message').value;
        jsonData["timestamp"] = formattedDate;
        //socket.send(JSON.stringify(jsonData));

        const res = await fetch('/src/server/addMessageHandler', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
        })

        //console.log("messageData", jsonData);

        if (res.status === 200) {
            console.log("Message sent successfully.")
            socket.send(JSON.stringify(jsonData));
        } else {
            console.log("Message not sent", res.status)
        }

    } catch (error) {
        console.log("Error sending message", error)
    }

    sortUsersbyLastMessage(otherUser)
    $('message').value = "";
}

//Sorts usersDiv by last message sent
function sortUsersbyLastMessage(receiver) {
    const userDiv = document.getElementById(receiver);

    if (userDiv) {
        const parentDiv = userDiv.parentElement;
        const userIsOnline = parentDiv.classList.contains('online');

        if (userIsOnline) {
            var onlineGroup = document.getElementsByClassName("online-group")[0];
            onlineGroup.after(userDiv)
        } else {
            var offlineGroup = document.getElementsByClassName("offline-group")[0];
            offlineGroup.after(userDiv);
        }
    }
}

//Checks which conversation is open and wether to send notification or display msg
function sendNotification(currentUser, sender) {
    if (sender === currentUser) {
        return false
    }

    let messagesWindow = document.querySelector('.messages-area');
    let messagesHeaderText = document.querySelector('.messages-header-text');

    if (messagesWindow.classList.contains('hidden')) {
        return true
    } else {
        //check the user with whom the chat is open
        if (messagesHeaderText.textContent === `Your conversation with ${sender}`) {
            return false
        }
        return true
    }
}

//gives loginwsconnection a username
export function userFieldConnection(username) {
    let jsonData = {};
    console.log("userfield connection");
    jsonData["action"] = "username";
    jsonData["username"] = username;
    socket.send(JSON.stringify(jsonData));
}

//removes wsconnections
export function userLogoutConnection() {
    let jsonData = {};
    console.log("userlogoutconnection");
    jsonData["action"] = "left";
    socket.send(JSON.stringify(jsonData));
}