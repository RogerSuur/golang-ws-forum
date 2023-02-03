import { otherUser } from './app.js';
import { createDiv } from './DOM_helpers.js';
import { getJSON } from "./read_JSON.js";
import { webSocketUsers } from './ws.js';
import { currentUser } from './app.js';


let onlineUsersWrapper = document.querySelector(".online");
let offlineUsersWrapper = document.querySelector(".offline");

export async function populateUsers() {
    //loads fresh set of user
    //let usersObject = await getJSON('/src/server/getUsersHandler');
    let usersObject = await loadUsersObject();

    if (usersObject.offline !== null) {
        console.log("usersObject:", usersObject);
        onlineUsersWrapper.innerHTML = '';
        offlineUsersWrapper.innerHTML = '';
        //Update usersObject with ws given list of users
        usersObject.online = webSocketUsers.data.online
        //sort alphabetically
        usersObject.online.sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });
        usersObject.offline = createOnlineUsers(usersObject.online, usersObject.offline)

        constructUserLists(usersObject.online, onlineUsersWrapper, 'online');
        constructUserLists(usersObject.offline, offlineUsersWrapper, 'offline');
    }
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
            offlineUsers = offlineUsers.filter(item => item !== user)
        }
    })
    return offlineUsers
}


const constructUserLists = (usersArray, usersWrapper, type) => {
    let heading = createDiv(`${type}-group`, `<i class="fa-solid fa-comments"></i>${usersArray.length - 1} users ${type}`);
    usersWrapper.appendChild(heading);
    usersArray.forEach((user) => {
        if (user.name !== currentUser.innerHTML) {
            let singleUser = createDiv('user-name', user.name, user.name);
            if (user.unread) {
                singleUser.classList.add('unread-messages');
            }
            usersWrapper.appendChild(singleUser);
        }
    });
};