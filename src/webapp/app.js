import { createDiv, $, qS, horizontalDivider } from "./DOM_helpers.js";
import { startHeaderClock } from "./header_clock.js";
import { getJSON } from "./read_JSON.js";
import { initPosts, createCommentNode } from "./populate_posts.js";
import { initMessages } from "./populate_messages.js";
import { populateUsers } from "./populate_users.js";

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

let postsObject = await getJSON('/src/static/postsData.json');
let threadObject = await getJSON('/src/static/threadData.json');
let usersObject = await getJSON('/src/static/usersData.json');
let messagesObject = await getJSON('/src/static/messagesData.json');
let currentUser = 'User3';
let otherUser;

let topSentinelPreviousY = 0;
let topSentinelPreviousRatio = 0;
let bottomSentinelPreviousY = 0;
let bottomSentinelPreviousRatio = 0;

const listSize = 20;
const loadTime = 1500;
let DBSize = postsObject.posts.length;
let DB = postsObject.posts;
let trackable = "post";

let currentIndex = 0;

const getSlidingWindow = isScrollDown => {
	const increment = Math.floor(listSize / 2);
	let firstIndex;
  
    if (isScrollDown) {
        firstIndex = currentIndex + increment;
    } else {
        firstIndex = currentIndex - increment;
    }
  
    if (firstIndex < 0) {
        firstIndex = 0;
    }
  
    return firstIndex;
}

const recycleDOM = (firstIndex, isThread) => {
	for (let i = 0; i < listSize; i++) {
        const tile = $("post-" + i);
        tile.childNodes[0].firstChild.innerHTML = `real time of posting: ${DB[firstIndex + i].timestamp}`;
        tile.childNodes[0].lastChild.innerHTML = `real posting by: <b>${DB[firstIndex + i].user}</b>`;
        tile.childNodes[2].firstChild.innerHTML = `${DB[firstIndex + i].title}`;
        tile.childNodes[2].firstChild.setAttribute('id', `${DB[firstIndex + i].postID}`);
        tile.childNodes[2].lastChild.innerHTML = `${DB[firstIndex + i].content}`;
        if (!isThread) {
            let commentCount = createCommentNode(DB[firstIndex + i]);
            tile.childNodes[4].firstChild.innerHTML = commentCount;
            tile.childNodes[4].firstChild.setAttribute('id', `${DB[firstIndex + i].postID}`);
            if (DB[firstIndex + i].unread) 
                tile.childNodes[4].firstChild.classList.add('unread');
            else
                tile.childNodes[4].firstChild.classList.remove('unread');
        }
    }
}

const keepPostInFocus = isScrollDown => {
    if (isScrollDown) {
        const scrollPpintItem = $(`post-` + (listSize / 2 - 1));
        scrollPpintItem.scrollIntoView({behavior: 'auto', block: 'end'});
    } else {
        const scrollPpintItem = $(`post-` + (listSize / 2 + 1));
        scrollPpintItem.scrollIntoView({behavior: 'auto', block: 'start'});
    }
}

const topSentCallback = entry => {
    const currentY = entry.boundingClientRect.top;
    const currentRatio = entry.intersectionRatio;
    const isIntersecting = entry.isIntersecting;

  // conditional check for Scrolling up
    if (
        currentY > topSentinelPreviousY &&
        isIntersecting &&
        currentRatio >= topSentinelPreviousRatio &&
        currentIndex !== 0
    ) {
        const firstIndex = getSlidingWindow(false);
        keepPostInFocus(false);
        recycleDOM(firstIndex, false);
        currentIndex = firstIndex;
    }

    if (currentIndex === 0) {
        hide(spinner);
    }

    topSentinelPreviousY = currentY;
    topSentinelPreviousRatio = currentRatio;
}

const bottomSentCallback = entry => {
	if (currentIndex === DBSize - listSize) {
        return;
    }
    const currentY = entry.boundingClientRect.top;
    const currentRatio = entry.intersectionRatio;
    const isIntersecting = entry.isIntersecting;
  // conditional check for Scrolling down
    if (
        currentY < bottomSentinelPreviousY &&
        currentRatio > bottomSentinelPreviousRatio &&
        isIntersecting
    ) {
        const firstIndex = getSlidingWindow(true);
        keepPostInFocus(true);
        recycleDOM(firstIndex, false);
        currentIndex = firstIndex;
    }

    bottomSentinelPreviousY = currentY;
    bottomSentinelPreviousRatio = currentRatio;
}

const initIntersectionObserver = () => {

    const callback = entries => {
      entries.forEach(entry => {
        if (entry.target.id === `${trackable}-0`) {
            setTimeout(() => {
                let x = entry.target.getBoundingClientRect().left + entry.target.getBoundingClientRect().width / 2;
                let y = entry.target.parentElement.getBoundingClientRect().top;
                spinner.setAttribute('style', `left: ${x}px; top: ${y}px;`);
                show(spinner);
                topSentCallback(entry);
            }, loadTime);
            hide(spinner);
        } else if (entry.target.id === `${trackable}-${listSize - 1}`) {
            setTimeout(() => {
                let x = entry.target.getBoundingClientRect().left + entry.target.getBoundingClientRect().width / 2;
                let y = entry.target.parentElement.getBoundingClientRect().bottom - 100;
                spinner.setAttribute('style', `left: ${x}px; top: ${y}px;`);
                if (entry.target.getBoundingClientRect().top < window.innerHeight) 
                    show(spinner);
                bottomSentCallback(entry);
            }, loadTime);
            hide(spinner);
        }
      });
    }
  
    var observer = new IntersectionObserver(callback);
    observer.observe($(`${trackable}-0`));
    observer.observe($(`${trackable}-${listSize - 1}`));
}

const start = () => {

    //DB = initDB(DBSize, postsObject);
	initPosts(DB, listSize, false);

    const threadOpeningElements = document.querySelectorAll('.post-title, .post-comments');
    threadOpeningElements.forEach((threadLink) => {
        threadLink.addEventListener('click', () => {
            toggleThreadVisibility(true);
            let commentBox = threadWrapper.querySelector('.user-input-area')
            threadWrapper.innerHTML = commentBox.outerHTML; // clear thread box contents
            let selectedPost = postsObject.posts.filter(post => post.postID === threadLink.id)[0]
            threadHeader.innerHTML = selectedPost.title;
            //let threadDB = initDB(selectedPost.comments, threadObject);
            if (selectedPost.comments < listSize) {
                initPosts(threadObject.posts, selectedPost.comments + 1, true);
            } else { 
                initPosts(threadObject.posts, listSize, true);
            }
            trackable = 'thread';
        });
    });

    closeThread.addEventListener('click', () => {
        toggleThreadVisibility(false);
        trackable = 'post';
    });

	initIntersectionObserver();
}

start();

/* Loads next batch of messages in a conversation */
function getMessages(fromUser, toUser) {
    console.log("Loading messages from " + fromUser + " to " + toUser);
    //let messageDB = initDB(messagesObject.messages.length, messagesObject);
    if (messagesObject.messages.length < listSize) {
        initMessages(messagesObject.messages, messagesObject.messages.length, fromUser);
    } else {
        initMessages(messagesObject.messages, listSize, fromUser);
    }
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
            trackable = 'message';
            messagesWrapper.scrollTop = messagesWrapper.scrollHeight; // scroll to bottom of messages (to the last message)
            messageBoxHeader.textContent = `Your conversation with ${user.textContent}`;
        });
    });

    closeMessagesBox.addEventListener('click', () => {
        toggleMessageBoxVisibility(false);
        trackable = 'post';
    });
};

startHeaderClock;
getUsers();

buttons.forEach((button) => {
    button.addEventListener('click', () => {
        switch (button.id) {
            case 'login':
                toggleLoginVisibility(false);
                break;
            case 'register':
                toggleRegisterVisibility(true);
                break;
            case 'create':
                toggleRegisterVisibility(false);
                break;
            case 'logout':
                toggleLoginVisibility(true);
                break;
            default:
                console.log(button.id)
        }
    });
});

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
