import { messagesWrapper } from "./app.js";
import { createDiv } from "./DOM_helpers.js";

export const initMessages = (DB, num, currentUser) => {

    let previousUser;

    for (let i = 0; i < num; i++) {
        let singleMessage = createDiv('single-message');

        let messageContent = createDiv('message-content', DB[i].content);
        
        if (DB[i].from !== previousUser) {
            let messageAuthor = createDiv('message-user', DB[i].from);
            if (DB[i].from === currentUser) {
                messageAuthor.innerHTML = `Me`;
                singleMessage.classList.add('me');
                messageAuthor.classList.add('me');
                messageContent.classList.add('me');
            }
            singleMessage.appendChild(messageAuthor);
        } else if (previousUser !== currentUser) {
            singleMessage.classList.add('me');
            messageContent.classList.add('me');
        }
        previousUser = DB[i].from;

        singleMessage.appendChild(messageContent);

        let messageDate = createDiv('message-date', DB[i].timestamp);
        
        singleMessage.appendChild(messageDate);
        
        messagesWrapper.appendChild(singleMessage);
    }
}

/*
export const populateMessages = (messagesArray, currentUser) => {

    let previousUser;

    messagesArray.forEach((message) => {
        let singleMessage = createDiv('single-message');

        let messageContent = createDiv('message-content', message.content);
        
        if (message.from !== previousUser) {
            let messageAuthor = createDiv('message-user', message.from);
            if (message.from === currentUser) {
                messageAuthor.innerHTML = `Me`;
                singleMessage.classList.add('me');
                messageAuthor.classList.add('me');
                messageContent.classList.add('me');
            }
            singleMessage.appendChild(messageAuthor);
        } else if (previousUser !== currentUser) {
            singleMessage.classList.add('me');
            messageContent.classList.add('me');
        }
        previousUser = message.from;

        singleMessage.appendChild(messageContent);

        let messageDate = createDiv('message-date', message.timestamp);
        
        singleMessage.appendChild(messageDate);
        
        messagesWrapper.appendChild(singleMessage);
    });
}
*/