import { createDiv } from './DOM_helpers.js';
import { getJSON } from "./read_JSON.js";

const onlineUsersWrapper = document.getElementById("online");
const offlineUsersWrapper = document.getElementById("offline");

export async function populateUsers  ()  {
    
    //loads fresh set of user
    const usersObject = await getJSON('/static/usersData.json');
    constructUserLists(usersObject.online, onlineUsersWrapper, 'online');
    constructUserLists(usersObject.offline, offlineUsersWrapper, 'offline');
};

//add only new users maybe? 
const constructUserLists = (usersArray, usersWrapper, type) => {
    let counter = 0;
   console.log("usersWrapper:", usersWrapper)
    usersArray.forEach((user) => { 
        
        counter++
        let singleUser = createDiv('user-name', user.name, user.name);
        if (user.unread) {
            singleUser.classList.add('unread-messages');
        }

        if (usersWrapper.querySelector((`#${user.name}`)) === null) { //checks if it does display the user already to avoid dubles
        usersWrapper.appendChild(singleUser);
        }
    });

    let heading = document.querySelector(`.${type}-group`);
    if (type === 'online') {
        heading.innerHTML = `<i class="fa-solid fa-comments"></i>${counter} users ${type}`;
    } else {
        heading.innerHTML = `<i class="fa-regular fa-comments"></i>${counter} users ${type}`;
    }
};