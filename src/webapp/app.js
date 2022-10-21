import { createDiv } from "./DOM_helpers.js";
import { startHeaderClock } from "./header_clock.js";
import { getJSON } from "./read_JSON.js";
import { populatePosts } from "./populate_posts.js";
import { populateMessages } from "./populate_messages.js";
import { populateUsers } from "./populate_users.js";
import { Forum } from './ws.js';
import { sendMessage } from "./ws.js";
import { socket } from "./ws.js";



export const postsWrapper = document.querySelector('.posts-wrapper');
export const threadWrapper = document.querySelector('.thread-wrapper');
export const messagesWrapper = document.querySelector('.messages-wrapper');

const profile = document.querySelector('.user-profile-container');
const logout = document.getElementById('logout');
const adsArea = document.querySelector('.ads-area');
const loginArea = document.querySelector('.login-area');
const registerArea = document.querySelector('.register-area');
const userArea = document.querySelector('.user-list');

const buttons = document.querySelectorAll('button');

const threadHeader = document.querySelector('.thread-header-text');
const messageBoxHeader = document.querySelector('.messages-header-text');
const closeMessagesBox = document.querySelector('.close-messages-button');
const closeThread = document.querySelector('.close-thread-button');
const messagesBackgroundOverlay = document.querySelector('.overlay');

let postsObject = await getJSON('/static/postsData.json');
let threadObject = await getJSON('/static/threadData.json');
//let usersObject = await getJSON('/static/usersData.json');

let messagesObject = await getJSON('/static/messagesData.json');
export let currentUser = document.getElementById("username");
export let otherUser;
// export let messagesObject;



const forum = new Forum()
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

// function signUp() {
//     const data = new FormData(document.getElementsByClassName('register-area'));
//     fetch('/src/server/signup', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//             username: data.get('username-register'),
//             age: parseInt(data.get('age-register')),
//             gender: data.get('gender-register'),
//             firstname: data.get('first-name-register'),
//             lastname: data.get('last-name-register'),
//             email: data.get('email-register'),
//             password: data.get('password-register'),
//         }),
//     })
//         .then((response) => response.json())
//         .then((data) => {
//               //make a cookie =)
//         })
//         .catch((err) => {
//             console.log(err);
//         });
// }

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
    if (threadObject.remainingComments > 0)
        createLoadMore("comments");
}

/* Loads next batch of messages in a conversation */
export async function getMessages(fromUser, toUser) {
    console.log("Loading messages from " + fromUser + " to " + toUser);
    messagesWrapper.innerHTML = '';
    await populateMessages(fromUser)
    if (messagesObject.remainingMessages > 0)
        createLoadMore('messages');
}

/* Loads user lists and creates event listeners for them to load the conversations */
export async function getUsers() {
    //debugger
    await populateUsers()
    const userElements = document.querySelectorAll('.user-name');
    console.log("getUsers")
    // console.log("currentUser:", currentUser)
    // console.log("otherUser: ", otherUser)
    userElements.forEach((user) => {
        user.addEventListener('click', () => {
            toggleMessageBoxVisibility(true);
            messagesWrapper.innerHTML = ''; // clear messages box contents
            otherUser = user.id;
            // console.log("currentUser:", currentUser)
            // console.log("otherUser: ", otherUser)
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

buttons.forEach((button) => {
    button.addEventListener('click', function (event) {
        switch (button.id) {
            case 'login':
                toggleLoginVisibility(false);
                break;
            case 'register':
                toggleRegisterVisibility(true);
                break;
            case 'create':
                toggleRegisterVisibility(false);
                //signUp()
                break;
            case 'logout':
                toggleLoginVisibility(true);
                break;
            case 'sendMessage':
                if (message.value === "") {
                    alert("fill out user nad message")
                    return False
                } else {
                    sendMessage()
                }
                break;
            default:
                console.log(button.id)
        }
    });
});

document.getElementById("message").addEventListener("keydown", function (event) {
    if (event.code === "Enter") {
        if (!socket) {
            console.log("no connection");
            return false
        }
        event.preventDefault();//dont send the form
        event.stopPropagation();
        sendMessage()
    }
})

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

function toggleLoginVisibility(makeVisible) {
    if (makeVisible) {
        adsArea.classList.add('hidden');
        postsWrapper.parentElement.classList.add('hidden');
        userArea.classList.add('hidden');
        profile.classList.add('hidden');
        registerArea.classList.add('hidden');
        logout.innerHTML = 'Login';
        loginArea.classList.remove('hidden');
    } else {
        adsArea.classList.remove('hidden');
        postsWrapper.parentElement.classList.remove('hidden');
        userArea.classList.remove('hidden');
        profile.classList.remove('hidden');
        logout.innerHTML = 'Logout';
        loginArea.classList.add('hidden');
    }
}

function toggleRegisterVisibility(makeVisible) {
    if (makeVisible) {
        adsArea.classList.add('hidden');
        postsWrapper.parentElement.classList.add('hidden');
        userArea.classList.add('hidden');
        profile.classList.add('hidden');
        logout.innerHTML = 'Login';
        loginArea.classList.add('hidden');
        registerArea.classList.remove('hidden');
    } else {
        adsArea.classList.remove('hidden');
        postsWrapper.parentElement.classList.remove('hidden');
        userArea.classList.remove('hidden');
        profile.classList.remove('hidden');
        logout.innerHTML = 'Logout';
        registerArea.classList.add('hidden');
    }
}