import { createDiv } from "./DOM_helpers.js";

const patterns = {
    "username-register": /^[a-zA-Z\d]{1,15}$/,
    "email-register": /^([a-z\d\.]+)@([a-z\d]+)\.([a-z]{2,8})$/,
    "password-register": /^[\w]{1,15}$/,
}

export const newPostValidation = () => {

    var data = new FormData(document.getElementById('new-post'));
    var dataToSend = Object.fromEntries(data)

    var errors = document.getElementsByClassName('error-message');
    while (errors[0]) {
        errors[0].parentNode.removeChild(errors[0]);
    }

    if (dataToSend.title == "") {
        badValidation("title", "Please add a title")
        return false
    } else {
        var input_area = document.getElementById("titleID")
        input_area.style.borderColor = "";
    }

    if (dataToSend.content == "") {
        badValidation("content", "We are not mind-readers")
        return false
    } else {
        var input_area = document.getElementById("contentID")
        input_area.style.borderColor = "";
    }

    return true
}

export const signUpValidation = () => {

    var data = new FormData(document.getElementById('register-area'));
    var dataToSend = Object.fromEntries(data)

    var errors = document.getElementsByClassName('error-message');
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
    var input_area = document.getElementById(field + "ID")
    input_area.style.borderColor = 'red'
    let errorMessage = createDiv('error-message', requirement, 'error-message');
    input_area.parentNode.insertBefore(errorMessage, input_area)

}

function goodValidation(field) {
    var div = document.getElementById(field + "ID")
    div.style.borderColor = 'green'
}