import { messagesWrapper } from "./app.js";
import { createDiv } from "./DOM_helpers.js";
import { getJSON } from "./read_JSON.js";

export async function populateMessages (currentUser)  {

    let previousUser;
    let messagesObject = await getJSON('/static/messagesData.json');

    messagesObject.messages.forEach((message) => {
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
    })

}