import { messagesWrapper } from "./app.js";

export const populateMessages = (messagesArray, remainingMessages, currentUser) => {

    let previousUser;

    messagesArray.forEach((message) => {
        let singleMessage = document.createElement('div');
        singleMessage.classList.add('single-message');

        let messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.innerHTML = message.content;

        if (message.from !== previousUser) {
            let messageAuthor = document.createElement('div');
            messageAuthor.classList.add('message-user');
            if (message.from === currentUser) {
                messageAuthor.innerHTML = `Me`;
                singleMessage.classList.add('me');
                messageAuthor.classList.add('me');
                messageContent.classList.add('me');
            } else {
                messageAuthor.innerHTML = `${message.from}`;
            }
            singleMessage.appendChild(messageAuthor);
        } else if (previousUser !== currentUser) {
            singleMessage.classList.add('me');
            messageContent.classList.add('me');
        }
        previousUser = message.from;

        singleMessage.appendChild(messageContent);

        let messageDate = document.createElement('div');
        messageDate.classList.add('message-date');
        messageDate.innerHTML = `${message.timestamp}`;
        singleMessage.appendChild(messageDate);
        
        messagesWrapper.appendChild(singleMessage);
    });
    if (remainingMessages < 1) {
        console.log("No more messages")
    }
}