import { currentUser, otherUser } from './app.js';
import { createDiv } from './DOM_helpers.js';
import { getJSON } from "./read_JSON.js";
import { webSocketUsers } from './ws.js';


let onlineUsersWrapper = document.querySelector(".online");
let offlineUsersWrapper = document.querySelector(".offline");

export async function populateUsers() {
    //loads fresh set of user
    //let usersObject = await getJSON('/src/server/getUsersHandler');
    let usersObject = await loadUsersObject();

    console.log("currentUser.innerHTML", currentUser.innerHTML);
    onlineUsersWrapper.innerHTML = '';
    offlineUsersWrapper.innerHTML = '';
    if (webSocketUsers !== undefined) {
        //Update usersObject with ws given list of users
        usersObject.online = webSocketUsers.data.online
        if (usersObject.online !== null) {
            usersObject.offline = createOnlineUsers(usersObject.online, usersObject.offline)
        }
    }

    if (usersObject.online !== null) {
        constructUserLists(usersObject.online, onlineUsersWrapper, 'online');
    }
    constructUserLists(usersObject.offline, offlineUsersWrapper, 'offline');
};

async function loadUsersObject() {
    const data = await fetch('/src/server/getUsersHandler', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Username': currentUser.innerHTML,
        },
        body: JSON.stringify({
        }),
    })
        .then((response) => response.json())
        .then((result) => {
            if (!result.hasOwnProperty('data')) alert(result.message);
            else {
                return result.data
            }
        })
        .catch((err) => {
            console.log(err);
        });
    return data
}

const createOnlineUsers = function (onlineUsers, offlineUsers) {
    offlineUsers.forEach(function (user) {
        if (onlineUsers.find(e => e.name === user.name)) {
            //console.log(user);
            // console.log(offlineUsers);
            offlineUsers = offlineUsers.filter(item => item !== user)
            // console.log(offlineUsers);
        }
    })
    // console.log(offlineUsers);
    return offlineUsers
}


const constructUserLists = (usersArray, usersWrapper, type) => {

    //console.log(usersArray);
    let heading = createDiv(`${type}-group`, `<i class="fa-solid fa-comments"></i>${usersArray.length} users ${type}`);
    usersWrapper.appendChild(heading);

    usersArray.forEach((user) => {
        let singleUser = createDiv('user-name', user.name, user.name);
        if (user.unread) {
            singleUser.classList.add('unread-messages');
        }

        usersWrapper.appendChild(singleUser);
    });
};