import { createDiv } from "./DOM_helpers.js";
import { startHeaderClock } from "./header_clock.js";
import { getJSON } from "./read_JSON.js";
import { populatePosts } from "./populate_posts.js";
import { populateMessages } from "./populate_messages.js";
import { populateUsers } from "./populate_users.js";

export const postsWrapper = document.querySelector('.posts-wrapper');
export const threadWrapper = document.querySelector('.thread-wrapper');
export const messagesWrapper = document.querySelector('.messages-wrapper');

const threadHeader = document.querySelector('.thread-header-text');
const messageBoxHeader = document.querySelector('.messages-header-text');
const closeMessagesBox = document.querySelector('.close-messages-button');
const closeThread = document.querySelector('.close-thread-button');
const messagesBackgroundOverlay = document.querySelector('.overlay');

let postsObject = await getJSON('/src/static/postsData.json');
let threadObject = await getJSON('/src/static/threadData.json');
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
        case 'comments':
            wrapper = threadWrapper;
            remaining = threadObject.remainingComments;
            break;
        case 'messages':
            wrapper = messagesWrapper;
            remaining = messagesObject.remainingMessages;
            break;
    }

    let moreContent = createDiv(`more-${type}`, `There are ${remaining} older ${type} to read`);
    let loadMore = createDiv([`load-more`, `${type}`], `load more ...`);
    moreContent.appendChild(loadMore);

    if (type === 'comments') {
        let userCommentForm = threadWrapper.lastElementChild;
        wrapper.insertBefore(moreContent, userCommentForm);
    } else {
        wrapper.appendChild(moreContent);
    }
    
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
            case 'comments':
                getThread();
                break;
            case 'messages':
                getMessages(currentUser, otherUser);
                break;
        }
    });
}

/* Loads next batch of posts and adds event listener for threads*/
const getPosts = () => {
    
    populatePosts(postsObject.posts, false);
    if (postsObject.remainingPosts > 0) 
        createLoadMore("posts");

    const threadOpeningElements = document.querySelectorAll('.post-title, .post-comments');

    threadOpeningElements.forEach((threadLink) => {
        threadLink.addEventListener('click', () => {
            toggleThreadVisibility(true);
            let commentBox = threadWrapper.querySelector('.user-input-area')
            threadWrapper.innerHTML = commentBox.outerHTML; // clear thread box contents
            let selectedPost = postsObject.posts.filter(post => post.postID === threadLink.id)
            threadHeader.innerHTML = selectedPost[0].title;
            getThread();
        });
    });

    closeThread.addEventListener('click', () => {
        toggleThreadVisibility(false);
    });
}

/* Loads a thread */
const getThread = () => {
    console.log("Opening thread");
    populatePosts(threadObject.posts, true);
    if (threadObject.remainingComments> 0)
        createLoadMore("comments");
}

/* Loads next batch of messages in a conversation */
function getMessages(fromUser, toUser) {
    console.log("Loading messages from " + fromUser + " to " + toUser);
    populateMessages(messagesObject.messages, fromUser);
    if (messagesObject.remainingMessages > 0)
        createLoadMore('messages');
}

/* Loads user lists and creates event listeners for them to load the conversations */
const getUsers = () => {

    populateUsers(usersObject);

    const userElements = document.querySelectorAll('.user-name');

    userElements.forEach((user) => {
        user.addEventListener('click', () => {
            toggleMessageBoxVisibility(true);
            messagesWrapper.innerHTML = ''; // clear messages box contents
            otherUser = user.id;
            console.log(otherUser)
            getMessages(currentUser, otherUser);
            messagesWrapper.scrollTop = messagesWrapper.scrollHeight; // scroll to bottom of messages (to the last message)
            messageBoxHeader.textContent = `Your conversation with ${user.textContent}`;
        });
    });

    closeMessagesBox.addEventListener('click', () => {
        toggleMessageBoxVisibility(false);
    });
};

startHeaderClock;
getPosts();
getUsers();

function toggleMessageBoxVisibility(makeVisible) {
    if (makeVisible) {
        messagesBackgroundOverlay.style.zIndex = '1'; // bring overlay in front of posts area
        messagesWrapper.parentElement.classList.remove('hidden'); // make messages box visible
    } else {
        messagesBackgroundOverlay.style.zIndex = '-1';
        messagesWrapper.parentElement.classList.add('hidden');
    }
}

function toggleThreadVisibility(makeVisible) {
    if (makeVisible) {
        postsWrapper.parentElement.classList.add('hidden'); // make posts hidden
        threadWrapper.parentElement.classList.remove('hidden'); // make thread visible
    } else {
        postsWrapper.parentElement.classList.remove('hidden');
        threadWrapper.parentElement.classList.add('hidden');
    }
}