import { startHeaderClock } from "./header_clock.js";
import { getJSON } from "./read_JSON.js";
import { populatePosts } from "./populate_posts.js";
import { populateMessages } from "./populate_messages.js";
import { populateUsers } from "./populate_users.js";

export const postsWrapper = document.querySelector('.posts-wrapper');
const messagesElement = document.querySelector('.messages-wrapper');
export const messagesWrapper = document.querySelector('.messages-area');
export const onlineUsers = document.querySelector('.online');
export const offlineUsers = document.querySelector('.offline');

const messageHeader = document.querySelector('.messages-header-text');
const closeMessages = document.querySelector('.close-button');
const overlay = document.querySelector('.overlay');

let postsObject = await getJSON('/src/static/postsData.json');
let usersObject = await getJSON('/src/static/usersData.json');
let messagesObject = await getJSON('/src/static/messagesData.json');
let loggedUser = 'User3';
let otherUser;

const createLoadMore = (type) => {
    let postsArea = document.querySelector(`.${type}-area`);
    let moreContent = document.createElement('div');
    moreContent.classList.add(`more-${type}`);
    let remaining = (type === 'posts') ? postsObject.remainingPosts : messagesObject.remainingMessages;
    moreContent.innerHTML = `There are ${remaining} older ${type} to read`;
    let loadMore = document.createElement('div');
    loadMore.classList.add(`load-more`, `${type}`);
    loadMore.innerHTML = `load more ...`;
    moreContent.appendChild(loadMore);
    postsArea.appendChild(moreContent);
    addLoadMoreEvent(loadMore, type);
    }  

const getMessages = (fromUser, toUser) => {
    console.log("Loading messages from " + fromUser + " to " + toUser);
    populateMessages(messagesObject.messages, messagesObject.remainingMessages, fromUser);
    if (messagesObject.remainingMessages > 0) createLoadMore('messages');
}

startHeaderClock;
populatePosts(postsObject.posts);
if (postsObject.remainingPosts > 0) createLoadMore("posts");

populateUsers(usersObject);

const userElements = document.querySelectorAll('.user-name');

userElements.forEach((user) => {
    user.addEventListener('click', () => {
        overlay.style.zIndex = '1';
        messagesElement.classList.remove('hidden');
        messagesWrapper.innerHTML = '';
        otherUser = user.id;
        getMessages(loggedUser, user.id);
        messagesWrapper.scrollTop = messagesWrapper.scrollHeight;
        messageHeader.textContent = `Your conversation with ${user.textContent}`;
    });
});

closeMessages.addEventListener('click', () => {
    overlay.style.zIndex = '-1';
    messagesElement.classList.add('hidden');
});

function addLoadMoreEvent(element) {
    console.log(element)
    element.addEventListener('click', () => {
        console.log(element.parentElement.className)
        if (element.parentElement.className === 'more-posts') {
            console.log("loading more posts");
            populatePosts(postsObject.posts, postsObject.remainingPosts);
        } else if (element.parentElement.className === 'more-messages') {
            console.log("loading more messages");
            getMessages(loggedUser, otherUser);
            element.parentElement.remove();
        }
    });
    if (postsObject.remainingPosts < 5) {
        let loadMore = document.querySelector('.load-more', '.posts');
        loadMore.innerHTML = `No more posts`;
        loadMore.removeEventListener('click', () => {
            console.log("No more posts");
        });
    }
}

