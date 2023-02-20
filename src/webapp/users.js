import { otherUser } from './app.js';
import { createDiv } from './DOM_helpers.js';
import { getJSON } from "./read_JSON.js";
import { webSocketUsers } from './ws.js';
import { currentUser } from './app.js';


let onlineUsersWrapper = document.querySelector(".online");
let offlineUsersWrapper = document.querySelector(".offline");

export async function populateUsers() {
    //loads fresh set of user
    let usersObject = await loadUsersObject();


    if (usersObject.offline !== null) {
        onlineUsersWrapper.innerHTML = '';
        offlineUsersWrapper.innerHTML = '';

        usersObject.online = webSocketUsers.data.online

        usersObject.online = removeDoubleOnlineUsers(usersObject.online)
        usersObject.online = sortOnlineUsers(usersObject.online, usersObject.offline)
        usersObject.offline = removeDoubleUsers(usersObject.online, usersObject.offline)

        constructUserLists(usersObject.online, onlineUsersWrapper, 'online');
        constructUserLists(usersObject.offline, offlineUsersWrapper, 'offline');
    }
};

const removeDoubleOnlineUsers = function (onlineUsers) {
    return onlineUsers.filter((user, index, self) => {
        return index === self.findIndex(u => u.name === user.name);
    });
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

const removeDoubleUsers = function (onlineUsers, offlineUsers) {
    offlineUsers.forEach(function (user) {
        if (onlineUsers.find(e => e.name === user.name)) {
            offlineUsers = offlineUsers.filter(item => item !== user)
        }
    })
    return offlineUsers
}

const sortOnlineUsers = function (onlineUsers, offlineUsers) {
    const offlineIndexMap = {};
    for (let i = 0; i < offlineUsers.length; i++) {
        const userName = offlineUsers[i].name;
        offlineIndexMap[userName] = i;
    }

    onlineUsers.sort((a, b) => {
        const aIndex = offlineIndexMap[a.name];
        const bIndex = offlineIndexMap[b.name];
        if (aIndex === undefined || bIndex === undefined) {
            return 0;
        } else {
            return aIndex - bIndex;
        }
    });

    return onlineUsers
}

const constructUserLists = (usersArray, usersWrapper, type) => {
    let heading = createDiv(`${type}-group`, `<i class="fa-solid fa-comments"></i>${usersArray.length} users ${type}`);
    usersWrapper.appendChild(heading);
    usersArray.forEach((user) => {
        if (user.name !== currentUser.innerHTML) {
            let singleUser = createDiv('user-name', user.name, user.name);
            if (user.unread) {
                singleUser.classList.add('unread-messages');
            }
            usersWrapper.appendChild(singleUser);
        }
        if (user.name === currentUser.innerHTML) {
            const headingElement = document.querySelector(".online-group");
            headingElement.innerText = `${usersArray.length - 1} users ${type}`
        }
    });
};