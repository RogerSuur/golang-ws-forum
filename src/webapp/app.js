import { createDiv, $, qS } from "./DOM_helpers.js";
import { startHeaderClock } from "./header_clock.js";
import { getJSON, logoutJSON, makeNewCommentJSON, signUpJSON, loginJSON, makeNewPostJSON } from "./read_JSON.js";
import { initPosts, createPost } from "./posts.js";
import { initMessages } from "./messages.js";
import { populateUsers } from "./users.js";
import { Forum, socket, sendMessage, userFieldConnection, userLogoutConnection } from './ws.js';
import { getCookie, createNewCookie, newPostValidation, signUpValidation, loginValidation, badValidation } from "./validate.js";
import { hide, show, toggleMessageBoxVisibility, toggleThreadVisibility, toggleLoginVisibility, toggleRegisterVisibility } from "./visibility_togglers.js";

new Forum();

export const postsWrapper = qS('posts-wrapper');
export const threadWrapper = qS('thread-wrapper');
export const messagesWrapper = qS('messages-wrapper');

export const spinner = qS('lds-ellipsis');

const buttons = document.querySelectorAll('button');

const threadHeader = qS('thread-header-text');
const parentID = $('parentID');
const messageBoxHeader = qS('messages-header-text');
const closeMessagesBox = qS('close-messages-button');
const closeThread = qS('close-thread-button');

let postsObject = { "posts": [] };
let messagesObject = { "messages": [] };
// export let currentUser = 'Petra Marsh';
export let currentUser = $("current-userID");
export let otherUser;

let topSentinelPreviousY = 0;
let topSentinelPreviousRatio = 0;
let bottomSentinelPreviousY = 0;
let bottomSentinelPreviousRatio = 0;

const nrOfItemsToLoad = 10;
export const loadTime = 1500;
let pDB = postsObject.posts;
export let mDB = messagesObject.messages;
let isThread = false;

let currentIndex = 0,
    postsIndex,
    messagesIndex = mDB.length;

export const sleep = ms => new Promise(r => setTimeout(r, ms));

const keepPostInFocus = (postInFocus, position) => {
    const scrollPointItem = $(postInFocus);
    scrollPointItem.scrollIntoView({ behavior: 'auto', block: position });
}

const topSentCallback = async entry => {
    if (messagesIndex == 0 && topSentinelPreviousRatio != 0) {
        // if we are at the end of the DB, do nothing
        console.log("No more messages to load");
        return;
    }

    const currentY = entry.boundingClientRect.top;
    const currentRatio = entry.intersectionRatio;
    const isIntersecting = entry.isIntersecting;

    // conditional check for Scrolling up
    if (
        currentY > topSentinelPreviousY &&
        isIntersecting &&
        currentRatio >= topSentinelPreviousRatio
    ) {
        // set spinner
        let messagesAreaRect = qS('messages-area').getBoundingClientRect();
        let x = messagesAreaRect.left + messagesAreaRect.width / 2 - 40;
        let y = messagesAreaRect.top + 40;
        spinner.setAttribute('style', `left: ${x}px; top: ${y}px;`);
        show(spinner);
        await sleep(loadTime);
        hide(spinner);
        // load new data
        getMessages(otherUser).then(() => { console.log("Fetching more messages from", currentUser.innerHTML, "to", otherUser, "at index", messagesIndex) })
    }

    topSentinelPreviousY = currentY;
    topSentinelPreviousRatio = currentRatio;
}

const bottomSentCallback = async entry => {
    if (currentIndex >= pDB.length) {
        // if we are at the end of the DB, do nothing
        console.log('end of DB');
        return;
    }
    const currentY = entry.boundingClientRect.top;
    const currentRatio = entry.intersectionRatio;
    const isIntersecting = entry.isIntersecting;

    if (
        currentY < bottomSentinelPreviousY &&
        currentRatio > bottomSentinelPreviousRatio &&
        isIntersecting
    ) {
        // set spinner
        let rect;
        if (isThread) {
            rect = qS('thread-area').getBoundingClientRect();
        } else {
            rect = qS('posts-area').getBoundingClientRect();
        }
        let x = rect.left + rect.width / 2 - 40;
        let y = rect.bottom - 100;
        spinner.setAttribute('style', `left: ${x}px; top: ${y}px;`);
        if (entry.target.getBoundingClientRect().top < window.innerHeight) {
            show(spinner);
            await sleep(loadTime);
            hide(spinner);
        }

        // load new data
        let postInFocus;
        if (isThread) {
            postInFocus = threadWrapper.lastChild.id;
        } else {
            postInFocus = postsWrapper.lastChild.id;
        }
        getPosts(currentIndex, false, isThread)
            .then(() => {
                if (!isThread) {
                    makeLinksClickable()
                }
            })

        keepPostInFocus(postInFocus, 'end');

    }

    bottomSentinelPreviousY = currentY;
    bottomSentinelPreviousRatio = currentRatio;
}

const callback = entries => {
    entries.forEach(entry => {
        bottomSentCallback(entry);
    });
}

let observer = new IntersectionObserver(callback);

const initPostIntersectionObserver = (open) => {
    if (open) {
        observer.observe($(`intersection-observer`));
        observer.unobserve($(`thread-intersection-observer`));
    } else {
        observer.unobserve($(`intersection-observer`));
        observer.observe($(`thread-intersection-observer`));
    }
}

const initMessageIntersectionObserver = () => {

    const messagesCallback = entries => {
        entries.forEach(entry => {
            topSentCallback(entry);
        });
    }
    let options = {
        root: qS('messages-area')
    }
    let messagesObserver = new IntersectionObserver(messagesCallback, options);
    messagesObserver.observe($(`message-intersection-observer`));
}

function signUp() {
    let data = new FormData($('register-area'));
    let dataToSend = Object.fromEntries(data);

    signUpJSON(dataToSend)
}

function login() {
    let data = new FormData($('login-area'));
    let dataToSend = Object.fromEntries(data)

    loginJSON(dataToSend)
}

export const start = async () => {
    await getPosts().then(() => { makeLinksClickable() });
    getUsers();
}

/* Loads next batch of posts */
export async function getPosts(index = currentIndex, prepend = false, isThread = false) {
    if (!isThread) {
        postsObject = await getJSON('/src/server/getPostsHandler');
        pDB = postsObject.posts;
    }

    if (index + nrOfItemsToLoad > pDB.length) {
        initPosts(pDB, index, pDB.length, isThread, prepend);
    } else {
        initPosts(pDB, index, index + nrOfItemsToLoad, isThread, prepend);
    }
    currentIndex = index + nrOfItemsToLoad;
}


/* Loads next batch of messages in a conversation */
export async function getMessages(toUser) {

    await updateMessages(currentUser.innerHTML, toUser)
    if (messagesIndex == 0) {
        messagesIndex = mDB.length;
    }
    if (messagesIndex - nrOfItemsToLoad < 0) {
        initMessages(mDB, messagesIndex, 0, toUser);
        messagesIndex = 0;
    } else {
        initMessages(mDB, messagesIndex, messagesIndex - nrOfItemsToLoad, toUser);
        messagesIndex = messagesIndex - nrOfItemsToLoad;
    }
}

export async function updateMessages(sender, receiver) {
    try {
        const query = {
            sender: sender,
            receiver: receiver,
        };
        let response = await fetch('/src/server/getMessagesHandler', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            cache: 'no-cache',
            body: JSON.stringify(query)
        })
        let data = await response.json();
        if (data.data.messages == undefined || data.data.messages == null) {
            return mDB = [{ "content": "#beginningofconversation#" }];
        }
        return mDB = await data.data.messages;
    } catch (err) {
        console.log("Error updating messages:", err);
    }
}

async function updateComments(postID) {
    try {
        const query = {
            postID: postID.toString(),
        };
        let response = await fetch('/src/server/getCommentsHandler', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            cache: 'no-cache',
            body: JSON.stringify(query)
        })
        let data = await response.json();
        return pDB = await data.data.comments;
    } catch (err) {
        console.log("Error updating comments:", err);
    }
}

/* Loads user lists and creates event listeners for them to load the conversations */
export async function getUsers() {
    await populateUsers()
    const userElements = qS('.user-name');
    userElements.forEach((user) => {
        user.addEventListener('click', () => {
            toggleMessageBoxVisibility(true);
            let interSection = $('message-intersection-observer');
            messagesWrapper.innerHTML = ''; // clear messages box contents
            messagesWrapper.appendChild(interSection);
            otherUser = user.id;

            let notification = user.querySelector('.notification')
            if (notification) {
                notification.remove();
            }

            messagesIndex = 0;
            topSentinelPreviousY = 0;
            getMessages(otherUser)
            messagesWrapper.scrollTop = messagesWrapper.scrollHeight; // scroll to bottom of messages (to the last message)
            messageBoxHeader.textContent = `Your conversation with ${otherUser}`;
        });
    });

    closeMessagesBox.addEventListener('click', () => {
        toggleMessageBoxVisibility(false);
        messagesIndex = mDB.length;
    });
}

startHeaderClock;

//Maybe can be refactored without needing this function
buttons.forEach((button) => {
    button.addEventListener('click', function () {
        switch (button.id) {
            case 'login':
                //toggleLoginVisibility(false);
                //start();
                break;
            case 'register':
                toggleRegisterVisibility(true);
                break;
            case 'create':
                break;
            case 'logout':
                toggleLoginVisibility(true);
                break;
            case 'sendMessage':
                if (!socket) {
                    console.log("no connection");
                    return
                }
                sendMessage()
                break;
            default:
                console.log("Button", button.id)
        }
    });
});

$('register-area').addEventListener('submit', (e) => {
    if (signUpValidation()) {
        signUp();
    }
    console.log("new register area eventlistener");
    e.preventDefault(); // prevent page reload
});

$('login-area').addEventListener('submit', (e) => {
    if (loginValidation()) {
        login();
    }
    console.log("new login area eventlistener");
    e.preventDefault();
});

$('new-post').addEventListener('submit', (e) => {
    if (newPostValidation()) {
        makeNewPost();
    }
    console.log("new Post area eventlistener");
    e.preventDefault();
});

$('new-comment').addEventListener('submit', (e) => {
    makeNewComment();

    console.log("new Comment area eventlistener");
    e.preventDefault();
});

async function makeNewComment() {
    let data = new FormData($('new-comment'));
    let dataToSend = Object.fromEntries(data)

    dataToSend.timestamp = new Date().toISOString();
    dataToSend.user = currentUser.innerHTML;

    const res = await makeNewCommentJSON(dataToSend)

    if (res.status == 200) {
        // Generate ID for HTML element (the actual ID is given in DB, but that is not known until the DB is updated and is not relevant here, too)
        let last = threadWrapper.lastElementChild.id.replace("thread-", "") * 1;
        dataToSend.commentID = (last + 1).toString();

        let newComment = createPost(dataToSend, false, true);
        threadWrapper.appendChild(newComment);
        keepPostInFocus(newComment.id, 'end');
        updateCommentCount(dataToSend.postID);
        let jsonData = {};
        jsonData["action"] = "new_comment";
        jsonData["from"] = currentUser.innerHTML;
        jsonData["postID"] = dataToSend.postID;
        console.log("Sending", jsonData)
        socket.send(JSON.stringify(jsonData));
    } else {
        console.log("Status other", res.status)
        return res.json()
    }

    // resetting form values
    $('commentContentID').value = '';
}

export function updateCommentCount(postID, markUnread = false) {
    postsWrapper.querySelectorAll(`.post-comments`).forEach((comment) => {
        if (comment.id == postID) {
            let previousComments = comment.innerHTML.replace(/^\D+/g, '').replace(" comments", "") * 1;
            comment.innerHTML = comment.innerHTML.replace(/\d+/g, previousComments + 1);
            if (markUnread) {
                comment.classList.add('unread');
            }
        }
    });
}

async function makeNewPost() {
    let data = new FormData($('new-post'));
    let dataToSend = Object.fromEntries(data)

    dataToSend.timestamp = new Date().toISOString();
    dataToSend.comments = 0;
    dataToSend.user = currentUser.innerHTML;

    const res = makeNewPostJSON(dataToSend)

    if (res.status == 200) {
        let last = postsWrapper.firstElementChild.id.replace("post-", '') * 1;
        dataToSend.postID = last + 1;
        let newPost = createPost(dataToSend);
        postsWrapper.prepend(newPost);
        keepPostInFocus(newPost.id, 'start');
        getPosts().then(() => { makeLinksClickable() });
        let jsonData = {};
        console.log("broadcasting new post");
        jsonData["action"] = "new_post";
        jsonData["from"] = currentUser.innerHTML;
        socket.send(JSON.stringify(jsonData));

    } else {
        console.log("Status other", res.status)
        return res.json()
    }

    // resetting form values
    $('contentID').value = '';
    $('titleID').value = '';
    $('categoryID').value = 'general';
}

export function makeLinksClickable() {
    const threadOpeningElements = document.querySelectorAll('.post-title, .post-comments');
    threadOpeningElements.forEach((threadLink) => {
        threadLink.addEventListener('click', () => {
            if (threadLink.classList.contains('unread')) {
                threadLink.classList.remove('unread');
            }
            toggleThreadVisibility(true);
            isThread = true;
            let interSection = $('thread-intersection-observer');
            threadWrapper.innerHTML = ''; // clear thread box contents
            threadWrapper.appendChild(interSection);
            postsIndex = currentIndex;
            updateComments((threadLink.id))
                .then(() => {
                    getPosts(0, false, isThread);
                    let selectedPost = postsObject.posts.filter(post => post.postID === threadLink.id)[0]
                    let category = createDiv('post-category', selectedPost.category, selectedPost.category);
                    threadHeader.innerHTML = selectedPost.title;
                    parentID.value = selectedPost.postID;
                    threadHeader.prepend(category);
                })
                .then(() => { initPostIntersectionObserver(false) })
                .catch((err) => {
                    console.log("Error with displaying comments: ", err)
                });
        });
    });

    closeThread.addEventListener('click', () => {
        toggleThreadVisibility(false);
        initPostIntersectionObserver(true);
        currentIndex = postsIndex;
        pDB = postsObject.posts;
        isThread = false;
    });
}


$("message").addEventListener("keydown", function (event) {
    if (event.code === "Enter" || event.code === "NumpadEnter") {
        if (!socket) {
            console.log("no connection");
            return false
        }
        sendMessage();
    }
    console.log("new message area eventlistener");
})

$('logout_User').addEventListener('click', () => {
    let user_uuid = getCookie();

    //fetch to send db request deleting cookie
    logoutJSON(user_uuid)

    document.cookie = "username" + "=" + ";" + "Max-Age=-99999999" + ";path=/;"
    let input_area = $("username_loginID")
    let input_area2 = $("password_loginID")
    input_area.style.borderColor = ''
    input_area2.style.borderColor = ''
    $("login-area").reset()

    toggleLoginVisibility(true);
})