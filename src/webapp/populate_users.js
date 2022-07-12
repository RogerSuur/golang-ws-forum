import { onlineUsers } from "./app.js";
import { offlineUsers } from "./app.js";

export const populateUsers = (usersObject) => {
    constructUserLists(usersObject.online, onlineUsers, 'online');
    constructUserLists(usersObject.offline, offlineUsers, 'offline');
};

const constructUserLists = (usersArray, usersElement, type) => {
    let counter = 0;
    usersArray.forEach((user) => {
        counter++
        let singleUser = document.createElement('div');
        singleUser.classList.add('user-name');
        singleUser.setAttribute('id', user.user);
        singleUser.innerHTML = user.user;
        if (user.newMessage) {
            singleUser.classList.add('unread-messages');
        }
        usersElement.appendChild(singleUser);
    });
    let heading = document.querySelector(`.${type}-group`);
    if (type === 'online') {
        heading.innerHTML = `<i class="fa-solid fa-comments"></i>${counter} users ${type}`;
    } else {
        heading.innerHTML = `<i class="fa-regular fa-comments"></i>${counter} users ${type}`;
    }
};