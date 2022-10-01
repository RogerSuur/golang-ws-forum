import { createDiv, $, qS, horizontalDivider } from "./DOM_helpers.js";
import { startHeaderClock } from "./header_clock.js";
import { getJSON } from "./read_JSON.js";
import { populatePosts, createCommentNode } from "./populate_posts.js";
import { populateMessages } from "./populate_messages.js";
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
let postPage = 0;

let topSentinelPreviousY = 0;
let topSentinelPreviousRatio = 0;
let bottomSentinelPreviousY = 0;
let bottomSentinelPreviousRatio = 0;

let listSize = 20;
let DBSize = 200;

const initDB = num => {
    const db = [];
    for (let i = 0; i < num; i++) {
        db.push({
        postCounter: i,
        user: postsObject.posts[i].user,
        postID: postsObject.posts[i].postID,
        title: postsObject.posts[i].title,
        content: postsObject.posts[i].content,
        timestamp: postsObject.posts[i].timestamp,
        comments: postsObject.posts[i].comments,
        unread: postsObject.posts[i].unread,
    })
  }
  return db;
}

let DB = [];

let currentIndex = 0;

const initList = num => {
  
    for (let i = 0; i < num; i++) {
        const singlePost = createDiv('single-post');
        singlePost.setAttribute('id', `post-${i}`);

        let postHeader = createDiv('post-header');

        let postDate = createDiv('post-date', `real time of posting: ${postsObject.posts[i].timestamp}`);
        postHeader.appendChild(postDate);

        let postAuthor = createDiv('post-user', `real posting by: <b>${postsObject.posts[i].user}</b>`);
        postHeader.appendChild(postAuthor);

        singlePost.appendChild(postHeader);

        let hr = horizontalDivider('post-horizontal');
        singlePost.appendChild(hr);

        let postBody = document.createElement('div');
        postBody.classList.add('post-body');

        if (postsObject.posts[i].title) {
            let postTitle = createDiv('post-title', `${postsObject.posts[i].title}`, `${postsObject.posts[i].postID}`);
            postBody.appendChild(postTitle);
        }

        let postContent = createDiv('post-content', `${postsObject.posts[i].content}`);
        postBody.appendChild(postContent);

        singlePost.appendChild(postBody);

        /*
        if (isThread) {

            // insert thread before user input area
            let userCommentForm = threadWrapper.lastElementChild;
            threadWrapper.insertBefore(singlePost, userCommentForm);

        } else {
            */

            // add footer with comments count
            hr = horizontalDivider('post-horizontal');
            singlePost.appendChild(hr);
            
            let postFooter = createDiv('post-footer');
            
            let commentIcon = document.createElement('i');
            commentIcon.classList.add('fa-regular', 'fa-message');
            
            let commentCount = commentIcon.outerHTML + `&nbsp;${postsObject.posts[i].comments} comment`;
            if (postsObject.posts[i].comments > 1 || postsObject.posts[i].comments == 0) 
                commentCount += 's';

            let postComments = createDiv('post-comments', commentCount, `${postsObject.posts[i].postID}`);
            
            if (postsObject.posts[i].unread) 
                postComments.classList.add('unread');

            postFooter.appendChild(postComments);
            singlePost.appendChild(postFooter);

            postsWrapper.appendChild(singlePost);

        //}
  }
  postsWrapper.appendChild(createDiv('load-more', 'Loading more...', 'load-more'));
  
}

const getSlidingWindow = isScrollDown => {
	const increment = Math.floor(listSize / 2);
	let firstIndex;
  
    if (isScrollDown) {
        firstIndex = currentIndex + increment;
    } else {
        firstIndex = currentIndex - increment - listSize;
    }
  
    if (firstIndex < 0) {
        firstIndex = 0;
    }
  
    return firstIndex;
}

const recycleDOM = firstIndex => {
	for (let i = 0; i < listSize; i++) {
        const tile = $("post-" + i);
        tile.childNodes[0].firstChild.innerHTML = `real time of posting: ${DB[firstIndex + i].timestamp}`;
        tile.childNodes[0].lastChild.innerHTML = `real posting by: <b>${DB[firstIndex + i].user}</b>`;
        tile.childNodes[2].firstChild.innerHTML = `${DB[firstIndex + i].title}`;
        tile.childNodes[2].firstChild.setAttribute('id', `${DB[firstIndex + i].postID}`);
        tile.childNodes[2].lastChild.innerHTML = `${DB[firstIndex + i].content}`;
        let commentCount = createCommentNode(DB[firstIndex + i]);
        tile.childNodes[4].firstChild.innerHTML = commentCount;
        tile.childNodes[4].firstChild.setAttribute('id', `${DB[firstIndex + i].postID}`);
    }
}

const getNumFromStyle = numStr => Number(numStr.substring(0, numStr.length - 2));

const adjustPaddings = isScrollDown => {
    /*
    if (isScrollDown) {
        const currentItem = $("post-" + (listSize - 3));
        currentItem.scrollIntoView();
    } else {
        const currentItem = $("post-13");
        currentItem.scrollIntoView();
    }
 
    const container = postsWrapper;
    const currentPaddingTop = getNumFromStyle(container.style.paddingTop);
    const currentPaddingBottom = getNumFromStyle(container.style.paddingBottom);
    const remPaddingsVal = 100 * (listSize / 2);
	if (isScrollDown) {
        container.style.paddingTop = currentPaddingTop + remPaddingsVal + "px";
        container.style.paddingBottom = currentPaddingBottom === 0 ? "0px" : currentPaddingBottom - remPaddingsVal + "px";
    } else {
        container.style.paddingBottom = currentPaddingBottom + remPaddingsVal + "px";
        container.style.paddingTop = currentPaddingTop === 0 ? "0px" : currentPaddingTop - remPaddingsVal + "px";
    }
    */
}

const topSentCallback = entry => {
    if (currentIndex === 0) {
		const container = postsWrapper;
        container.style.paddingTop = "0px";
        container.style.paddingBottom = "0px";
    }

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
        adjustPaddings(false);
        recycleDOM(firstIndex);
        currentIndex = firstIndex;
    }

    topSentinelPreviousY = currentY;
    topSentinelPreviousRatio = currentRatio;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

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
        adjustPaddings(true);
        recycleDOM(firstIndex);
        currentIndex = firstIndex;
    }

    bottomSentinelPreviousY = currentY;
    bottomSentinelPreviousRatio = currentRatio;
}

const initIntersectionObserver = () => {
    const options = {
        //root: $("load-more"),
    }
  
    const callback = entries => {
      entries.forEach(entry => {
        if (entry.target.id === 'post-0') {
          topSentCallback(entry);
        } else if (entry.target.id === `load-more`) {
            setTimeout(() => {
                bottomSentCallback(entry);
            }, 1000);
        }
      });
    }
  
    var observer = new IntersectionObserver(callback, options);
    observer.observe($("post-0"));
    observer.observe($("load-more"));
    //observer.observe($(`post-${listSize - 1}`));
  }

const start = () => {

    DB = initDB(DBSize);
	initList(listSize);
	initIntersectionObserver();
}

start();

/* Creates "Load more" button for posts and messages */
/*
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
*/
/* Loads next batch of posts and adds event listener for threads*/
/*
const getPosts = () => {
    
    populatePosts(postsObject.posts, false, postPage);
    if (postsObject.remainingPosts > 0) 
        postPage += 5;
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
*/
/* Loads a thread */
/*
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
//getPosts();
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

/*

https://medium.com/walmartglobaltech/infinite-scrolling-the-right-way-11b098a08815
https://jsfiddle.net/valkyris/43fmku20/693/

const initIntersectionObserver = () => {
    const options = {
        root: postsWrapper,
    }

    const callback = (entries) => {
        entries.forEach(entry => {
            console.log(entry.id. postPage)
            if (entry.id === 'post-0') {
                topSentCallback(entry)
            } else if (entry.id === `post-${postPage - 1}`) {
                bottomSentCallback(entry)
            }
        });
    }
    
    var observer = new IntersectionObserver(callback, options);
    observer.observe(document.querySelector("#post-0"));
    observer.observe(document.querySelector(`#post-${postPage - 1}`));
}


const recycleDOM = firstIndex => {
	for (let i = 0; i < postPage; i++) {
		const tile = document.querySelector("#post-" + i);
		//tile.firstElementChild.innerText = DB[i + firstIndex].title;
		//tile.lastChild.setAttribute("src", DB[i + firstIndex].imgSrc);
  }
}
*/