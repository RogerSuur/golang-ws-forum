import { startHeaderClock } from "./header_clock.js";
import { getJSON } from "./read_JSON.js";
import { populatePosts } from "./populate_posts.js";
import { populateMessages } from "./populate_messages.js";
import { populateUsers } from "./populate_users.js";

export const postsWrapper = document.querySelector('.postsWrapper');
const messagesElement = document.querySelector('.messages');
export const messagesWrapper = document.querySelector('.messagesWrapper');
export const onlineUsers = document.querySelector('.online');
export const offlineUsers = document.querySelector('.offline');

const messageHeader = document.querySelector('.messagesHeaderText');
const closeMessages = document.getElementById('closeButton');
const overlay = document.querySelector('.overlay');

let loggedUser = 'User3';

startHeaderClock;

let postsArray = await getJSON('/src/static/postsData.json');
populatePosts(postsArray);

let usersObject = await getJSON('/src/static/usersData.json');
populateUsers(usersObject);

const userElements = document.querySelectorAll('.userName');

async function getMessages(fromUser, toUser) {
    let messagesArray = await getJSON('/src/static/messagesData.json');
    console.log("Loading messages from " + fromUser + " to " + toUser);
    populateMessages(messagesArray, fromUser);
    messagesWrapper.scrollTop = messagesWrapper.scrollHeight;
}

userElements.forEach((user) => {
    user.addEventListener('click', () => {
        overlay.style.zIndex = '1';
        messagesElement.classList.remove('hidden');
        getMessages(loggedUser, user.id);
        messageHeader.textContent = `Your conversation with ${user.textContent}`;
    });
});

closeMessages.addEventListener('click', () => {
    overlay.style.zIndex = '-1';
    messagesElement.classList.add('hidden');
});