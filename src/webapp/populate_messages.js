import { messagesWrapper, currentUser } from "./app.js";
import { createDiv, $ } from "./DOM_helpers.js";
//import { getJSON } from "./read_JSON.js";

export const initMessages = (DB, from, num) => {


    let interSection = $('message-intersection-observer');

    if (from === DB.length) {
        messagesWrapper.innerHTML = '';
        messagesWrapper.appendChild(interSection);
    }

    let i = from - 1;
    let nextUser;
    while (i >= num) {

        if (i === num) {
            interSection.remove();
            messagesWrapper.appendChild(interSection);
        }
        if (i === 0) {
            nextUser = '';
        } else {
            nextUser = DB[i - 1].from;
        }
        //console.log("i", DB[i].content, "DB[i] current", DB[i].from, "DB[i-1] next", nextUser)
        let singleMessage = createSingleMessage(i, DB[i].content, DB[i].from, DB[i].timestamp, nextUser)

        messagesWrapper.appendChild(singleMessage);

        i--;
    }
}

export const createSingleMessage = (index, content, from, timestamp, previousUser) => {

    let singleMessage = createDiv('single-message');

    singleMessage.setAttribute('id', `message-${index}`);

    let messageContent = createDiv('message-content', content);

    if (from !== previousUser) {
        let messageAuthor = createDiv('message-user', from);
        if (from === currentUser.innerHTML) {
            messageAuthor.innerHTML = `Me`;
            singleMessage.classList.add('me');
            messageAuthor.classList.add('me');
            messageContent.classList.add('me');
        }
        singleMessage.appendChild(messageAuthor);

    } else if (previousUser === currentUser.innerHTML) {

        singleMessage.classList.add('me');
        messageContent.classList.add('me');
    }

    singleMessage.appendChild(messageContent);

    let messageDate = createDiv('message-date', timestamp);

    singleMessage.appendChild(messageDate);

    return singleMessage

}
