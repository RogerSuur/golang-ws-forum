import { createNewCookie, badValidation } from "./validate.js"
import { toggleRegisterVisibility, toggleLoginVisibility } from "./visibility_togglers.js"
import { start, initPostIntersectionObserver, initMessageIntersectionObserver, currentUser } from "./app.js"
import { userFieldConnection, userLogoutConnection } from "./ws.js"
import { $ } from "./DOM_helpers.js"

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
    const data = await fetch('/src/server/addCommentsHandler', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
    })
    return data
}

export async function makeNewPostJSON(dataToSend) {
    const data = await fetch('/src/server/addPostHandler', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
    })
    return data
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