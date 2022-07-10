import { startHeaderClock } from "./header_clock.js";
import { getJSON } from "./read_JSON.js";
import { populatePosts } from "./populate_posts.js";

export const postsElement = document.querySelector('.posts');
const messageElement = document.querySelector('.messages');
const userElements = document.querySelectorAll('.userName');
const messageHeader = document.querySelector('.newMessageHeader');
const closeMessages = document.getElementById('closeButton');

startHeaderClock;

let postsArray = await getJSON('/src/static/postsData.json')
populatePosts(postsArray);

userElements.forEach((user) => {
    user.addEventListener('click', () => {
        postsElement.classList.add('hidden');
        messageElement.classList.remove('hidden');
        messageHeader.textContent = `Your conversation with ${user.textContent}`;
    });
});

closeMessages.addEventListener('click', () => {
    postsElement.classList.remove('hidden');
    messageElement.classList.add('hidden');
});