import { startHeaderClock } from "./header_clock.js";
import { getJSON } from "./read_JSON.js";
import { populatePosts } from "./populate_posts.js";
import { populateMessages } from "./populate_messages.js";
import { populateUsers } from "./populate_users.js";

export const postsWrapper = document.querySelector('.posts-wrapper');
const messagesElement = document.querySelector('.messages');
export const messagesWrapper = document.querySelector('.messages-wrapper');
export const onlineUsers = document.querySelector('.online');
export const offlineUsers = document.querySelector('.offline');

const messageHeader = document.querySelector('.messages-header-text');
const closeMessages = document.querySelector('.close-button');
const overlay = document.querySelector('.overlay');

let postsObject = await getJSON('/src/static/postsData.json');
let usersObject = await getJSON('/src/static/usersData.json');
let loggedUser = 'User3';

startHeaderClock;
populatePosts(postsObject.posts, postsObject.remainingPosts);
populateUsers(usersObject);

const userElements = document.querySelectorAll('.user-name');

const loadMoreEvent = () => {
    let loadMoreElement = document.querySelectorAll('.load-more');
    loadMoreElement.forEach(element => {
        element.addEventListener('click', () => {
            console.log("Load more from: " + element.parentElement.className);
        });
    });
}    

async function getMessages(fromUser, toUser) {
    let messagesObject = await getJSON('/src/static/messagesData.json');
    console.log("Loading messages from " + fromUser + " to " + toUser);
    populateMessages(messagesObject.messages, messagesObject.remainingMessages, fromUser);
    messagesWrapper.scrollTop = messagesWrapper.scrollHeight;
    loadMoreEvent();
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

loadMoreEvent();