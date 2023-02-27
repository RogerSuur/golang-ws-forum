import { createNewCookie, badValidation } from "./validate.js"
import { toggleRegisterVisibility, toggleLoginVisibility } from "./visibility_togglers.js"
import { start, initPostIntersectionObserver, makeLinksClickable, updateCommentCount, initMessageIntersectionObserver, currentUser, postsWrapper, threadWrapper, keepPostInFocus, getPosts } from "./app.js"
import { userFieldConnection, userLogoutConnection, socket } from "./ws.js"
import { $ } from "./DOM_helpers.js"
import { createPost } from "./posts.js"

export async function getJSON(path) {
    const data = await fetch(`${path}`)
        .then(response => {
            if (response.ok) return response.json()
            throw Error(response.statusText)
        })
        .then(result => {
            if (result.error) throw Error(result.error)
            return result.data
        })
        .catch(error => { throw error })
    return data
}

export async function signUpJSON(dataToSend) {
    const data = await fetch('/src/server/signup', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
    })

        .then((res) => {
            return res.json()
        })

        .then((result) => {
            if (Object.prototype.hasOwnProperty.call(result, "message")) {
                badValidation(result.message, result.requirement)
            } else {
                currentUser.innerHTML = result.username
                createNewCookie(result.UUID)
                toggleRegisterVisibility(false)
                start()
                initPostIntersectionObserver(true);
                initMessageIntersectionObserver();
                userFieldConnection(result.username)
            }
        })

        .catch((err) => {
            console.log("Error with signup", err);
        });

    return data
}

export async function loginJSON(dataToSend) {
    const data = await fetch('/src/server/login', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
    })

        .then((res) => {
            return res.json();
        })

        .then((result) => {
            if (Object.prototype.hasOwnProperty.call(result, "message")) {
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
                initPostIntersectionObserver(true);
                initMessageIntersectionObserver();
                userFieldConnection(result.username);
                currentUser.innerHTML = result.username;
            }
        })


        .catch((err) => {
            console.log("Error with login", err);
        });
    return data
}

export async function makeNewCommentJSON(dataToSend) {
    const res = await fetch('/src/server/addCommentsHandler', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
    })

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

    return res
}

export async function makeNewPostJSON(dataToSend) {
    const res = await fetch('/src/server/addPostHandler', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
    })
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


    return res
}

export function logoutJSON(user_uuid) {
    const data = fetch('/src/server/deleteCookieHandler', {
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

    return data
}