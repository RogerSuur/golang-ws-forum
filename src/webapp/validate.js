import { createDiv } from "./DOM_helpers.js";
import { currentUser, start } from "./app.js";
import { toggleLoginVisibility } from "./visibility_togglers.js";
import { userFieldConnection } from "./ws.js";

const patterns = {
    "username-register": /^[a-zA-Z\d]{1,15}$/,
    "email-register": /^([a-z\d\.]+)@([a-z\d]+)\.([a-z]{2,8})$/,
    "password-register": /^[\w]{1,15}$/,
}

export const newPostValidation = () => {

    let data = new FormData(document.getElementById('new-post'));
    let dataToSend = Object.fromEntries(data)

    let errors = document.getElementsByClassName('error-message');
    while (errors[0]) {
        errors[0].parentNode.removeChild(errors[0]);
    }

    if (dataToSend.title == "") {
        badValidation("title", "Please add a title")
        return false
    } else {
        let title_input_area = document.getElementById("titleID")
        title_input_area.style.borderColor = "";
    }

    if (dataToSend.content == "") {
        badValidation("content", "We are not mind-readers")
        return false
    } else {
        let input_area = document.getElementById("contentID")
        input_area.style.borderColor = "";
    }

    return true
}

export const loginValidation = () => {
    let data = new FormData(document.getElementById('login-area'));
    let dataToSend = Object.fromEntries(data)

    let errors = document.getElementsByClassName('error-message');
    while (errors[0]) {
        errors[0].parentNode.removeChild(errors[0]);
    }

    if (dataToSend.username_login == "") {
        badValidation("username_login", "Please add a username")
        return false
    } else {
        let username_input_area = document.getElementById("username_loginID")
        username_input_area.style.borderColor = "";
    }

    if (dataToSend.password_login == "") {
        badValidation("password_login", "Please enter password")
        return false
    } else {
        let input_area = document.getElementById("password_loginID")
        input_area.style.borderColor = "";
    }

    return true
}

export const signUpValidation = () => {

    let data = new FormData(document.getElementById('register-area'));
    let dataToSend = Object.fromEntries(data)

    let errors = document.getElementsByClassName('error-message');
    while (errors[0]) {
        errors[0].parentNode.removeChild(errors[0]);
    }


    for (const [key, value] of Object.entries(dataToSend)) {
        switch (key) {
            case "username-register":
                if (!validateRegex(key, value, "Username needs to be up to 1-15 alphanumerical characters")) {
                    return false
                }
                break;
            case "email-register":
                if (!validateRegex(key, value, "Insert valid email, e.x. your@domain.com")) {
                    return false
                }
                break;
            case "password-register":
                if (!validateRegex(key, value, "Password needs to be up to 1-15 alphanumerical characters")) {
                    return false
                }
                break;
            case "password-register-confirm":
                if (value !== dataToSend["password-register"]) {
                    badValidation("password-register-confirm", "Passwords don't match")
                    return false
                } else {
                    goodValidation("password-register-confirm")
                }
                break;
            default:
                return true
        }
    }
}

function validateRegex(field, value, requirement) {
    if (!patterns[field].test(value)) {
        badValidation(field, requirement)
        return false
    } else {
        goodValidation(field)
        return true
    }
}

export function badValidation(field, requirement) {
    let input_area = document.getElementById(field + "ID")
    input_area.style.borderColor = 'red'
    let errorMessage = createDiv('error-message', requirement, 'error-message');
    input_area.parentNode.insertBefore(errorMessage, input_area)

}

function goodValidation(field) {
    let div = document.getElementById(field + "ID")
    div.style.borderColor = 'green'
}

export function checkCookie() {
    //let currentUser
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

export function createNewCookie(uuid) {
    const d = new Date();
    d.setTime(d.getTime() + (1 * 7 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = "username=" + encodeURI(uuid) + "; Path=/; " + expires + ";";
}

export function getCookie() {
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split('=');
    return ca[1]
}
