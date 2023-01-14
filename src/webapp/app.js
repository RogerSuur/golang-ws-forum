import { createDiv, $, qS } from "./DOM_helpers.js";
import { startHeaderClock } from "./header_clock.js";
import { getJSON } from "./read_JSON.js";
import { initPosts, createCommentNode } from "./populate_posts.js";
import { initMessages } from "./populate_messages.js";
import { populateUsers } from "./populate_users.js";
import { Forum } from './ws.js';
import { sendMessage } from "./ws.js";
import { socket } from "./ws.js";
import { newPostValidation, signUpValidation, loginValidation } from "./validate.js";
import { badValidation } from "./validate.js";

new Forum()

export const postsWrapper = qS('posts-wrapper');
export const threadWrapper = qS('thread-wrapper');
export const messagesWrapper = qS('messages-wrapper');

function hide(x) { return x.classList.add('hidden'); }
function show(x) { return x.classList.remove('hidden'); }

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

let postsObject = await getJSON('/src/server/getPostsHandler');
//let postsObject = await getJSON('/static/postsData.json');
let threadObject = await getJSON('/src/server/getCommentsHandler');
//let threadObject = await getJSON('/static/threadData.json')
//let usersObject = await getJSON('/static/usersData.json');
//let messagesObject = await getJSON('/static/messagesData.json');
let messagesObject = { "messages": [] };
// export let currentUser = 'Petra Marsh';
export let currentUser = $("current-userID");
export let otherUser;

let topSentinelPreviousY = 0;
let topSentinelPreviousRatio = 0;
let bottomSentinelPreviousY = 0;
let bottomSentinelPreviousRatio = 0;

const nrOfItemsToLoad = 10;
const loadTime = 1500;
let pDB = postsObject.posts;
export let mDB = messagesObject.messages;
let isThread = false;

let currentIndex = 0,
    postsIndex,
    threadIndex,
    messagesIndex = mDB.length;

const sleep = ms => new Promise(r => setTimeout(r, ms));

const keepPostInFocus = (postInFocus, position) => {
    //console.log(`focus on: ` + postInFocus)
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
    //console.log("Firing topSentCallback")
    
    // conditional check for Scrolling up
    if (
        currentY > topSentinelPreviousY &&
        isIntersecting &&
        currentRatio >= topSentinelPreviousRatio
    ) {
        // set spinner
        //console.log("Executing topSentCallback")
        let messagesAreaRect = qS('messages-area').getBoundingClientRect();
        let x = messagesAreaRect.left + messagesAreaRect.width / 2 - 40;
        let y = messagesAreaRect.top + 40;
        spinner.setAttribute('style', `left: ${x}px; top: ${y}px;`);
        show(spinner);
        await sleep(loadTime);
        hide(spinner);
        // load new data
        getMessages(otherUser).then(() => {console.log("Fetching more messages from", currentUser.innerHTML, "to", otherUser, "at index", messagesIndex)})
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
        let postsAreaRect = qS('posts-area').getBoundingClientRect();
        let x = postsAreaRect.left + postsAreaRect.width / 2 - 40;
        let y = postsAreaRect.bottom - 100;
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
        getPosts();
        keepPostInFocus(postInFocus, 'end');

    }

    bottomSentinelPreviousY = currentY;
    bottomSentinelPreviousRatio = currentRatio;
}

const initPostIntersectionObserver = () => {

    const callback = entries => {
        entries.forEach(entry => {
            bottomSentCallback(entry);
        });
    }
    let options = {
        root: qS('posts-area')
    }
    let observer = new IntersectionObserver(callback, options);
    observer.observe($(`intersection-observer`));
    //observer.observe($(`thread-intersection-observer`));
    //observer.observe($(`message-intersection-observer`));
}

const initMessageIntersectionObserver = () => {

    const callback = entries => {
        entries.forEach(entry => {
            topSentCallback(entry);
        });
    }
    let options = {
        root: qS('messages-area')
    }
    let observer = new IntersectionObserver(callback, options);
    observer.observe($(`message-intersection-observer`));
}

function signUp() {
    let data = new FormData($('register-area'));
    let dataToSend = Object.fromEntries(data);

    fetch('/src/server/signup', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
    })

        .then((res) => {
            return res.json()
        })

        .then((result) => {
            if (result.hasOwnProperty("message")) {
                badValidation(result.message, result.requirement)
            } else {
                currentUser.innerHTML = result.username
                createNewCookie(result.UUID)
                toggleRegisterVisibility(false)
                start()
                initPostIntersectionObserver();
                initMessageIntersectionObserver();
                userFieldConnection(result.username)
            }
        })

        .catch((err) => {
            console.log(err);
        });
}

function login() {
    let data = new FormData($('login-area'));
    let dataToSend = Object.fromEntries(data)

    fetch('/src/server/login', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
    })

        .then((res) => {
            return res.json();
        })

        .then((result) => {
            if (result.hasOwnProperty('message')) {
                //badValidation(result.message, result.requirement)
                let input_area = $("username_loginID")
                let input_area2 = $("password_loginID")
                input_area.style.borderColor = 'red'
                input_area2.style.borderColor = 'red'
                let errorMessage = createDiv('error-message', result.requirement, 'error-message');
                input_area.parentNode.insertBefore(errorMessage, input_area)
            } else {
                //Attach the UUID to the document
                createNewCookie(result.UUID);
                toggleLoginVisibility(false);
                start();
                initPostIntersectionObserver();
                initMessageIntersectionObserver();
                userFieldConnection(result.username);
                currentUser.innerHTML = result.username;
            }
        })

        .catch((err) => {
            console.log(err);
        });
}

const start = () => {

    //DB = initDB(DBSize, postsObject);
    getUsers();
    getPosts();
    const threadOpeningElements = document.querySelectorAll('.post-title, .post-comments');
    threadOpeningElements.forEach((threadLink) => {
        threadLink.addEventListener('click', () => {
            toggleThreadVisibility(true);
            let interSection = $('thread-intersection-observer');
            threadWrapper.innerHTML = ''; // clear thread box contents
            threadWrapper.appendChild(interSection);
            let selectedPost = postsObject.posts.filter(post => post.postID === threadLink.id)[0]
            threadHeader.innerHTML = selectedPost.title;
            //let threadDB = initDB(selectedPost.comments, threadObject);
            postsIndex = currentIndex;
            currentIndex = 0;
            pDB = threadObject.comments;
            isThread = true;
            getPosts();
        });
    });

    closeThread.addEventListener('click', () => {
        toggleThreadVisibility(false);
        currentIndex = postsIndex;
        pDB = postsObject.posts;
        isThread = false;
    });

}

/* Loads next batch of posts */
export function getPosts() {
    console.log("Total number of posts", pDB.length, ", loading posts at index", currentIndex);
    if (currentIndex + nrOfItemsToLoad > pDB.length) {
        initPosts(pDB, currentIndex, pDB.length, isThread);
    } else {
        initPosts(pDB, currentIndex, currentIndex + nrOfItemsToLoad, isThread);
    }
    currentIndex = currentIndex + nrOfItemsToLoad;
}


/* Loads next batch of messages in a conversation */
export async function getMessages(toUser) {
    await updateMessages(currentUser.innerHTML, toUser)
    if (messagesIndex == 0) {
        messagesIndex = mDB.length;
        // console.log("reset MessagesIndex", messagesIndex);
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
        //console.log("lengths:", mDB.length, data.data.messages.length);
        //console.log("Last message:", await data.data.messages[data.data.messages.length - 1])
        return mDB = await data.data.messages;
    } catch (err) {
        console.log("Error updating messages:", err);
    }
}

/* Loads user lists and creates event listeners for them to load the conversations */
export async function getUsers() {
    await populateUsers()
    const userElements = document.querySelectorAll('.user-name');
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
            getMessages(otherUser).then(() => {console.log("Loading messages from", currentUser.innerHTML, "to", otherUser, "at index", messagesIndex)})
            messagesWrapper.scrollTop = messagesWrapper.scrollHeight; // scroll to bottom of messages (to the last message)
            messageBoxHeader.textContent = `Your conversation with ${otherUser}`;
        });
    });

    closeMessagesBox.addEventListener('click', () => {
        toggleMessageBoxVisibility(false);
        messagesIndex = mDB.length;
        /*
        if (isThread) {
            currentIndex = threadIndex;
        } else {
            currentIndex = postsIndex;
        }
        */
    });
};

startHeaderClock;

//Maybe can be refactored without needing this function
buttons.forEach((button) => {
    button.addEventListener('click', function (event) {
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
                if (message.value === "") {
                    alert("fill out user and message")
                    return
                }
                if (!socket) {
                    console.log("no connection");
                    return
                }
                // event.preventDefault();
                // event.stopPropagation();
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
        //toggleRegisterVisibility(false)
    }
    e.preventDefault();
});

$('login-area').addEventListener('submit', (e) => {
    if (loginValidation()) {
        //console.log(e.target);
        login();
    }
    e.preventDefault();
});

$('new-post').addEventListener('submit', (e) => {
    if (newPostValidation()) {
        makeNewPost();
        //toggleRegisterVisibility(false)
    }
    console.log("new Post area eventlistener");
    e.preventDefault();
});

$('new-comment').addEventListener('submit', (e) => {
    //check that comment field is not empty) {
    makeNewComment();
    //toggleRegisterVisibility(false)
    //}
    console.log("new Comment area eventlistener");
    e.preventDefault();
});

async function makeNewComment() {
    let data = new FormData($('new-comment'));
    let dataToSend = Object.fromEntries(data)

    //get post title
    let header = qS("thread-header-text")
    //console.log("dataToSend", dataToSend);

    const res = await fetch('/src/server/addCommentsHandler', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'X-Username': currentUser.innerHTML,
            'Post-title': header.innerHTML,
        },
        body: JSON.stringify(dataToSend)
    })

    //console.log("postsObject", postsObject);

    if (res.status == 200) {
        console.log("Status 200", res.status)
        // // clear the postsWrapper element
        // let interSection = $('intersection-observer');
        // postsWrapper.innerHTML = '';
        // postsWrapper.appendChild(interSection);
        // // initialise postsObject
        // postsObject = await getJSON('/src/server/getPostsHandler');
        // //console.log("Updated postsOpbject", postsObject);
        // currentIndex = 0;
        // pDB = postsObject.posts;
        // // restart the posts area of forum
        // start()
    } else {
        console.log("Status other", res.status)
        return res.json()
    }

}

async function makeNewPost() {
    let data = new FormData($('new-post'));
    let dataToSend = Object.fromEntries(data)

    console.log("dataToSend", dataToSend);

    const res = await fetch('/src/server/addPostHandler', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'X-Username': currentUser.innerHTML
        },
        body: JSON.stringify(dataToSend)
    })

    //console.log("postsObject", postsObject);

    if (res.status == 200) {
        console.log("Status 200", res.status)
        // clear the postsWrapper element
        let interSection = $('intersection-observer');
        postsWrapper.innerHTML = '';
        postsWrapper.appendChild(interSection);
        // initialise postsObject
        postsObject = await getJSON('/src/server/getPostsHandler');
        //console.log("Updated postsOpbject", postsObject);
        currentIndex = 0;
        pDB = postsObject.posts;
        // restart the posts area of forum
        start()
    } else {
        console.log("Status other", res.status)
        return res.json()
    }
    
    // resetting form values
    $('contentID').value = '';
    $('titleID').value = '';
    $('categoryID').value = 'general';
}

$("message").addEventListener("keydown", function (event) {
    if (event.code === "Enter") {
        if (!socket) {
            console.log("no connection");
            return false
        }
        // event.preventDefault();//dont send the form
        // event.stopPropagation();
        sendMessage();
    }
})

function toggleMessageBoxVisibility(makeVisible) {
    //console.log(makeVisible, "toggle messagebox");
    if (makeVisible) {
        messagesBackgroundOverlay.style.zIndex = '1'; // bring overlay in front of posts area
        show(messagesWrapper.parentElement); // make messages box visible
    } else {
        messagesBackgroundOverlay.style.zIndex = '-1';
        hide(messagesWrapper.parentElement); // make messages box hidden
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

export function toggleLoginVisibility(makeVisible) {
    if (makeVisible) {
        toggleMessageBoxVisibility(false);
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
        hide(adsArea);
        hide(postsWrapper.parentElement);
        hide(userArea)
        hide(profile);
        hide(loginArea);
        logout.innerHTML = 'Login';
        show(registerArea);
    } else {
        show(adsArea);
        show(postsWrapper.parentElement);
        show(userArea);
        show(profile);
        logout.innerHTML = 'Logout';
        hide(registerArea);
    }
}

export function checkCookie() {
    //var currentUser
    if (document.cookie == "") {
        toggleLoginVisibility(true)
    } else {
        let user_uuid = getCookie();

        fetch('/src/server/checkCookieHandler', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: user_uuid
        })

            .then((res) => {
                if (res.ok) {
                    toggleLoginVisibility(false)
                    start()
                    return res.json()
                } else {
                    throw res.statusText
                }
            })

            .then((result) => {
                //set username to result.user
                userFieldConnection(result.user)
                currentUser.innerHTML = result.user;
            })

            .catch((error) => {
                console.error('Error:', error);
            });
    }
}

function createNewCookie(uuid) {
    const d = new Date();
    d.setTime(d.getTime() + (1 * 7 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = "username=" + encodeURI(uuid) + "; Path=/; " + expires + ";";
}

function getCookie() {
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split('=');
    return ca[1]
}


$('logout_User').addEventListener('click', () => {
    let user_uuid = getCookie();

    //fetch to send db request deleting cookie
    fetch('/src/server/deleteCookieHandler', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: user_uuid
    })
        .then((res) => {
            if (res.ok) {
                toggleLoginVisibility(true)
                userLogoutConnection()
                currentUser.innerHTML = ""
            } else {
                throw res.statusText
            }
        })


        .catch((error) => {
            console.error('Error:', error);
        });

    document.cookie = "username" + "=" + ";" + "Max-Age=-99999999" + ";path=/;"
    let input_area = $("username_loginID")
    let input_area2 = $("password_loginID")
    input_area.style.borderColor = ''
    input_area2.style.borderColor = ''
    $("login-area").reset()

    toggleLoginVisibility(true);
})

//gives loginwsconnection a username
function userFieldConnection(username) {
    let jsonData = {};
    console.log("userfield connection");
    jsonData["action"] = "username";
    jsonData["username"] = username;
    socket.send(JSON.stringify(jsonData));
}

//removes wsconnections
function userLogoutConnection() {
    let jsonData = {};
    console.log("userlogoutconnection");
    jsonData["action"] = "left";
    socket.send(JSON.stringify(jsonData));
}