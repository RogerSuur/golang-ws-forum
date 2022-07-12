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
        singleUser.classList.add('userName');
        singleUser.setAttribute('id', user.user);
        singleUser.innerHTML = user.user;
        usersElement.appendChild(singleUser);
    });
    let heading = document.querySelector(`.${type}Heading`);
    heading.textContent = `${counter} users ${type}`;
};