import { createDiv, $, qS, horizontalDivider } from "./DOM_helpers.js";
import { startHeaderClock } from "./header_clock.js";
import { getJSON } from "./read_JSON.js";
import { initPosts, createCommentNode } from "./populate_posts.js";
import { initMessages } from "./populate_messages.js";
import { populateUsers } from "./populate_users.js";
import { Forum } from './ws.js';
import { sendMessage } from "./ws.js";
import { socket } from "./ws.js";
import { newPostValidation, signUpValidation } from "./validate.js";
import { badValidation } from "./validate.js";

const forum = new Forum()

export const postsWrapper = qS('posts-wrapper');
export const threadWrapper = qS('thread-wrapper');
export const messagesWrapper = qS('messages-wrapper');

function hide(x) {return x.classList.add('hidden');}
function show(x) {return x.classList.remove('hidden');}

const profile = qS('user-profile-container');
const logout = $('logout');
const adsArea = qS('ads-area');
const loginArea = qS('login-area');
const registerArea = qS('register-area');
const userArea = qS('user-list');
const spinner = qS('lds-ellipsis');

const buttons = document.querySelectorAll('button');

const threadHeader = qS('thread-header-text');
const messageBoxHeader = qS('messages-header-text');
const closeMessagesBox = qS('close-messages-button');
const closeThread = qS('close-thread-button');
const messagesBackgroundOverlay = qS('overlay');

//let postsObject = await getJSON('/src/server/getPostsHandler');
let postsObject = await getJSON('/static/postsData.json');
let threadObject = await getJSON('/static/threadData.json');
//let usersObject = await getJSON('/static/usersData.json');
let messagesObject = await getJSON('/static/messagesData.json');
export let currentUser = 'Petra Marsh';
export let otherUser;

let topSentinelPreviousY = 0;
let topSentinelPreviousRatio = 0;
let bottomSentinelPreviousY = 0;
let bottomSentinelPreviousRatio = 0;

const listSize = 20;
const loadTime = 1500;
let DBSize = postsObject.posts.length;
let DB = postsObject.posts;
let trackable = 'post';
let isThread = false;

let currentIndex = 0;
let postsIndex = 0,
    threadIndex = 0,
    messagesIndex = 0;

const sleep = ms => new Promise(r => setTimeout(r, ms));

const keepPostInFocus = (postNr, position) => {
    console.log(`focus on: ${trackable}-` + postNr)
    const scrollPointItem = $(`${trackable}-` + postNr);
    scrollPointItem.scrollIntoView({behavior: 'auto', block: position});
}

const topSentCallback = async entry => {
    const currentY = entry.boundingClientRect.top;
    const currentRatio = entry.intersectionRatio;
    const isIntersecting = entry.isIntersecting;
    // calculate shift in case last scroll is less than listSize
    let shift = 0
    // todo shift calculations

    // conditional check for Scrolling up
    if (
        currentY > topSentinelPreviousY &&
        isIntersecting &&
        currentRatio >= topSentinelPreviousRatio
    ) {
        // set spinner
        let x = entry.target.getBoundingClientRect().left + entry.target.getBoundingClientRect().width / 2;
        let y = entry.target.parentElement.getBoundingClientRect().top;
        spinner.setAttribute('style', `left: ${x}px; top: ${y}px;`);
        show(spinner);
        await sleep(loadTime);
        hide(spinner);

        // load new data
        initMessages(DB, currentIndex, listSize, false);
        currentIndex = currentIndex + listSize + shift;
    }

    topSentinelPreviousY = currentY;
    topSentinelPreviousRatio = currentRatio;
}

const bottomSentCallback = async entry => {
	if (currentIndex === DBSize - listSize) {
        // if we are at the end of the DB, do nothing
        console.log('end of DB');
        return;
    }
    const currentY = entry.boundingClientRect.top;
    const currentRatio = entry.intersectionRatio;
    const isIntersecting = entry.isIntersecting;
    // calculate shift in case last scroll is less than listSize
    let shift = 0
    if (DBSize - currentIndex - listSize/2 < listSize)
        shift = DBSize - currentIndex - listSize - listSize/2;
    // conditional check for Scrolling down
    if (
        currentY < bottomSentinelPreviousY &&
        currentRatio > bottomSentinelPreviousRatio &&
        isIntersecting
    ) {
        // set spinner
        let x = entry.target.getBoundingClientRect().left + entry.target.getBoundingClientRect().width / 2;
        let y = entry.target.parentElement.getBoundingClientRect().bottom - 100;
        spinner.setAttribute('style', `left: ${x}px; top: ${y}px;`);
        if (entry.target.getBoundingClientRect().top < window.innerHeight) {
            show(spinner);
            await sleep(loadTime);
            hide(spinner);
        }

        // load new data
        initPosts(DB, currentIndex, listSize, false);
        currentIndex = currentIndex + listSize + shift;
    
    }

    bottomSentinelPreviousY = currentY;
    bottomSentinelPreviousRatio = currentRatio;
}

const initIntersectionObserver = () => {
    
    const callback = entries => {
      entries.forEach(entry => {
        console.log("Trackable: ", trackable);
        if (trackable === 'message') {
            topSentCallback(entry);
        } else {
            bottomSentCallback(entry);
        }
      });
    }
    var observer = new IntersectionObserver(callback);
    observer.observe($(`intersection-observer`));
    observer.observe($(`message-intersection-observer`));
}

function signUp() {
    debugger
    var data = new FormData(document.getElementById('register-area'));
    var dataToSend = Object.fromEntries(data)

    fetch('/src/server/signup', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
    })

        .then((res) => {
            if (res.status == 200) {
                toggleRegisterVisibility(false)
            } else {
                return res.json()
            }
        })

        .then((result) => {
            if (result !== undefined) {
                badValidation(result.message, result.requirement)
            }
        })

        // .then((result) => {
        //     //if (result.status != 200) { throw new Error("Bad sservu Response"); }
        //     console.log(result.status);
        //     if (result.status == 200) {
        //         toggleRegisterVisibility(false)
        //     } else {
        //         return result.json();

        //     }
        //     // console.log(result.message);
        //     //console.log(result.status)
        // })

        // // (D) SERVER RESPONSE
        // .then((response) => {
        //     console.log(response.message);
        //     badValidation(response.message)
        // })
        .catch((err) => {
            console.log(err);
        });
}

const start = () => {

    //DB = initDB(DBSize, postsObject);
	initPosts(DB, 0, listSize, false);
    currentIndex = currentIndex + listSize;
    keepPostInFocus(0, 'start');

    const threadOpeningElements = document.querySelectorAll('.post-title, .post-comments');
    threadOpeningElements.forEach((threadLink) => {
        threadLink.addEventListener('click', () => {
            toggleThreadVisibility(true);
            threadWrapper.innerHTML = ""; // clear thread box contents
            let selectedPost = postsObject.posts.filter(post => post.postID === threadLink.id)[0]
            threadHeader.innerHTML = selectedPost.title;
            //let threadDB = initDB(selectedPost.comments, threadObject);
            trackable = 'thread';
            currentIndex = threadIndex;
            DB = threadObject.posts;
            DBSize = selectedPost.comments + 1;
            isThread = true;
            if (selectedPost.comments < listSize) {
                initPosts(DB, 0, DBSize, true);
            } else { 
                initPosts(DB, 0, listSize, true);
                initIntersectionObserver();
            }
        });
    });

    closeThread.addEventListener('click', () => {
        toggleThreadVisibility(false);
        trackable = 'post';
        threadIndex = currentIndex;
        currentIndex = postsIndex;
        DB = postsObject.posts;
        DBSize = postsObject.posts.length;
        isThread = false;
    });

    if (listSize < DBSize) {
        initIntersectionObserver();
    }
}

/* Loads next batch of messages in a conversation */
// currently unused
export function getMessages(fromUser, toUser) {
    console.log("Loading messages from " + fromUser + " to " + toUser);
    //let messageDB = initDB(messagesObject.messages.length, messagesObject);
    if (messagesObject.messages.length < listSize) {
        initMessages(messagesObject.messages, 0, messagesObject.messages.length, fromUser);
    } else {
        initMessages(messagesObject.messages, 0, listSize, fromUser);
    }
}


/* Loads user lists and creates event listeners for them to load the conversations */
export async function getUsers() {
    await populateUsers()
    const userElements = document.querySelectorAll('.user-name');
    // console.log("getUsers")
    // console.log("currentUser:", currentUser)
    // console.log("otherUser: ", otherUser)
    userElements.forEach((user) => {
        user.addEventListener('click', () => {
            toggleMessageBoxVisibility(true);
            // messagesWrapper.innerHTML = ''; // clear messages box contents
            otherUser = user.id;
            // console.log("currentUser:", currentUser)
            // console.log("otherUser: ", otherUser)
            trackable = 'message';
            currentIndex = messagesIndex;
            DB = messagesObject.messages;
            DBSize = messagesObject.messages.length;
            if (DBSize < listSize) {
                initMessages(DB, 0, DBSize, currentUser);
            } else {
                initMessages(DB, 0, listSize, currentUser);
                currentIndex = currentIndex + listSize;
                initIntersectionObserver();
            }
            messagesWrapper.scrollTop = messagesWrapper.scrollHeight; // scroll to bottom of messages (to the last message)
            messageBoxHeader.textContent = `Your conversation with ${user.textContent}`;
        });
    });

    closeMessagesBox.addEventListener('click', () => {
        toggleMessageBoxVisibility(false);
        trackable = 'post';
        messagesIndex = currentIndex;
        if (isThread) {
            currentIndex = threadIndex;
            DB = threadObject.posts;
            DBSize = threadObject.posts.length;
        } else {
            currentIndex = postsIndex;
            DB = postsObject.posts;
            DBSize = postsObject.posts.length;
        }
    });
};

startHeaderClock;
getUsers();

buttons.forEach((button) => {
    button.addEventListener('click', function (event) {
        switch (button.id) {
            case 'login':
                toggleLoginVisibility(false);
                start();
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
                if (message.value === "") {
                    alert("fill out user nad message")
                    return false
                } else {
                    sendMessage()
                }
                break;
            default:
                console.log(button.id)
        }
    });
});

document.getElementById('register-area').addEventListener('submit', (e) => {
    if (signUpValidation()) {
        signUp();
        //toggleRegisterVisibility(false)
    }
    e.preventDefault();
});

document.getElementById('new-post').addEventListener('submit', (e) => {
    if (newPostValidation()) {
        makeNewPost();
        //toggleRegisterVisibility(false)
    }
    console.log("new Post area eventlistener");
    e.preventDefault();
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
        hide(postsWrapper.parentElement); // make posts hidden
        show(threadWrapper.parentElement); // make thread visible
    } else {
        show(postsWrapper.parentElement);
        hide(threadWrapper.parentElement);
    }
}

function toggleLoginVisibility(makeVisible) {
    if (makeVisible) {
        hide(adsArea);
        hide(postsWrapper.parentElement);
        hide(userArea);
        hide(profile);
        hide(registerArea);

        logout.innerHTML = 'Login';
        show(loginArea);

    } else {
        show(adsArea);
        show(postsWrapper.parentElement);
        show(userArea);
        show(profile);

        logout.innerHTML = 'Logout';
        hide(loginArea);
    }
}

function toggleRegisterVisibility(makeVisible) {
    if (makeVisible) {
        adsArea.classList.add('hidden');
        postsWrapper.parentElement.classList.add('hidden');
        userArea.classList.add('hidden');
        profile.classList.add('hidden');
        loginArea.classList.add('hidden');
        
        logout.innerHTML = 'Login';
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
