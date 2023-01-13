import { otherUser } from './app.js';
import { createDiv } from './DOM_helpers.js';
import { getJSON } from "./read_JSON.js";
import { webSocketUsers } from './ws.js';


let onlineUsersWrapper = document.querySelector(".online");
let offlineUsersWrapper = document.querySelector(".offline");

export async function populateUsers() {
    //loads fresh set of user
    let usersObject = await getJSON('/src/server/getUsersHandler');

    onlineUsersWrapper.innerHTML = '';
    offlineUsersWrapper.innerHTML = '';
    if (webSocketUsers !== undefined) {
        //Update usersObject with ws given list of users
        //console.log(webSocketUsers.data.online);
        usersObject.online = webSocketUsers.data.online
        if (usersObject.online !== null) {
            usersObject.offline = createOnlineUsers(usersObject.online, usersObject.offline)
        }
    }
    //console.log("usersObject.online", usersObject.online)
    //console.log("usersObject.offline", usersObject.offline)
    if (usersObject.online !== null) {
        constructUserLists(usersObject.online, onlineUsersWrapper, 'online');
    }
    constructUserLists(usersObject.offline, offlineUsersWrapper, 'offline');
};

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