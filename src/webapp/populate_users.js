import { createDiv } from './DOM_helpers.js';
import { getJSON } from "./read_JSON.js";


let onlineUsersWrapper = document.querySelector(".online");
let offlineUsersWrapper = document.querySelector(".offline");

export async function populateUsers  ()  {
    //loads fresh set of user
    const usersObject = await getJSON('/static/usersData.json');
    onlineUsersWrapper.innerHTML = '';
    offlineUsersWrapper.innerHTML = '';
    constructUserLists(usersObject.online, onlineUsersWrapper, 'online');
    constructUserLists(usersObject.offline, offlineUsersWrapper, 'offline');
};


const constructUserLists = (usersArray, usersWrapper, type) => {
    
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