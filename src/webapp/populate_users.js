import { createDiv } from './DOM_helpers.js';

const onlineUsersWrapper = document.querySelector('.online');
const offlineUsersWrapper = document.querySelector('.offline');

export const populateUsers = (usersObject) => {
    constructUserLists(usersObject.online, onlineUsersWrapper, 'online');
    constructUserLists(usersObject.offline, offlineUsersWrapper, 'offline');
};

const constructUserLists = (usersArray, usersWrapper, type) => {
    let counter = 0;
    usersArray.forEach((user) => {
        counter++
        let singleUser = createDiv('user-name', user.name, user.name);
        
        if (user.newMessage) {
            singleUser.classList.add('unread-messages');
        }

        usersWrapper.appendChild(singleUser);
    });

    let heading = document.querySelector(`.${type}-group`);
    if (type === 'online') {
        heading.innerHTML = `<i class="fa-solid fa-comments"></i>${counter} users ${type}`;
    } else {
        heading.innerHTML = `<i class="fa-regular fa-comments"></i>${counter} users ${type}`;
    }
};