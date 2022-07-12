import { startHeaderClock } from "./header_clock.js";
import { getJSON } from "./read_JSON.js";
import { populatePosts } from "./populate_posts.js";
import { populateMessages } from "./populate_messages.js";

const postsElement = document.querySelector('.posts');
export const postsWrapper = document.querySelector('.postsWrapper');
const messagesElement = document.querySelector('.messages');
export const messagesWrapper = document.querySelector('.messagesWrapper');
const userElements = document.querySelectorAll('.userName');
const messageHeader = document.querySelector('.messagesHeaderText');
const closeMessages = document.getElementById('closeButton');
const overlay = document.querySelector('.overlay');

startHeaderClock;

let postsArray = await getJSON('/src/static/postsData.json');
populatePosts(postsArray);

let messagesArray = await getJSON('/src/static/messagesData.json');
populateMessages(messagesArray, 'User3');

userElements.forEach((user) => {
    user.addEventListener('click', () => {
        overlay.style.zIndex = '1';
        messagesElement.classList.remove('hidden');
        messageHeader.textContent = `Your conversation with ${user.textContent}`;
        messagesWrapper.scrollTop = messagesWrapper.scrollHeight;
    });
});

closeMessages.addEventListener('click', () => {
    overlay.style.zIndex = '-1';
    messagesElement.classList.add('hidden');
});