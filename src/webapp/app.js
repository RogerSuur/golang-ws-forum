import { createDiv } from "./DOM_helpers.js";
import { startHeaderClock } from "./header_clock.js";
import { getJSON } from "./read_JSON.js";
import { populatePosts } from "./populate_posts.js";
import { populateMessages } from "./populate_messages.js";
import { populateUsers } from "./populate_users.js";

export const postsWrapper = document.querySelector('.posts-wrapper');
export const messagesWrapper = document.querySelector('.messages-wrapper');

const messageBoxHeader = document.querySelector('.messages-header-text');
const closeMessagesBox = document.querySelector('.close-button');
const messagesBackgroundOverlay = document.querySelector('.overlay');

let postsObject = await getJSON('/src/static/postsData.json');
let usersObject = await getJSON('/src/static/usersData.json');
let messagesObject = await getJSON('/src/static/messagesData.json');
let currentUser = 'User3';
let otherUser;

/* Creates "Load more" button for posts and messages */
export const createLoadMore = (type) => {
    let wrapper, remaining
    switch (type) {
        case 'posts':
            wrapper = postsWrapper;
            remaining = postsObject.remainingPosts;
            break;
        case 'messages':
            wrapper = messagesWrapper;
            remaining = messagesObject.remainingMessages;
            break;
    }
    let moreContent = createDiv(`more-${type}`, `There are ${remaining} older ${type} to read`);
    let loadMore = createDiv([`load-more`, `${type}`], `load more ...`);
    moreContent.appendChild(loadMore);
    wrapper.appendChild(moreContent);
    addLoadMoreEvent(loadMore, type);
};

function addLoadMoreEvent(element, type) {
    element.addEventListener('click', () => {
        element.parentElement.remove();
        console.log(`loading more ${type}`);
        switch (type) {
            case 'posts':
                getPosts();
                break;
            case 'messages':
                getMessages(currentUser, otherUser);
                break;
        }
    });
}

/* Loads next batch of posts */
const getPosts = () => {
    populatePosts(postsObject.posts);
    if (postsObject.remainingPosts > 0) 
        createLoadMore("posts");
}

/* Loads next batch of messages in a conversation */
function getMessages(currentUser, otherUser) {
    console.log("Loading messages from " + currentUser + " to " + otherUser);
    populateMessages(messagesObject.messages, currentUser);
    if (messagesObject.remainingMessages > 0)
        createLoadMore('messages');
}

/* Loads user lists and creates event listeners for them to load the conversations */
const getUsers = () => {
    populateUsers(usersObject);
    const userElements = document.querySelectorAll('.user-name');

    userElements.forEach((user) => {
        user.addEventListener('click', () => {
            messagesBackgroundOverlay.style.zIndex = '1'; // put overlay on background
            messagesWrapper.parentElement.classList.remove('hidden'); // show messages box
            messagesWrapper.innerHTML = ''; // clear messages box contents
            otherUser = user.id;
            getMessages(currentUser, otherUser);
            messagesWrapper.scrollTop = messagesWrapper.scrollHeight; // scroll to bottom of messages (to the last message)
            messageBoxHeader.textContent = `Your conversation with ${user.textContent}`;
        });
    });

    closeMessagesBox.addEventListener('click', () => {
        messagesBackgroundOverlay.style.zIndex = '-1';
        messagesWrapper.parentElement.classList.add('hidden');
    });
};

startHeaderClock;
getPosts();
getUsers();

