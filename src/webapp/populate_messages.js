import { messagesWrapper } from "./app.js";
import { createDiv } from "./DOM_helpers.js";
import { getJSON } from "./read_JSON.js";

export const initMessages = (DB, num, currentUser) => {

    let previousUser;
    // let messagesObject = await getJSON('/static/messagesData.json');


    for (let i = 0; i < num; i++) {
        let singleMessage = createDiv('single-message');

        singleMessage.setAttribute('id', `message-${num - i - 1}`);

        let messageContent = createDiv('message-content', DB[i].content);
        
        //if (DB[i].from !== previousUser) {
            let messageAuthor = createDiv('message-user', DB[i].from);
            if (DB[i].from === currentUser) {
                // messageAuthor.innerHTML = `Me`;
                singleMessage.classList.add('me');
                messageAuthor.classList.add('me');
                messageContent.classList.add('me');
            }
            /*
            if (DB[i].from === previousUser) {
                messageAuthor.classList.add('hidden');
            }
            */
            singleMessage.appendChild(messageAuthor);
        /*
        } else if (previousUser !== currentUser) {
            singleMessage.classList.add('me');
            messageContent.classList.add('me');
        }
        */
        previousUser = DB[i].from;

        singleMessage.appendChild(messageContent);

        let messageDate = createDiv('message-date', DB[i].timestamp);
        
        singleMessage.appendChild(messageDate);

        messagesWrapper.appendChild(singleMessage);
    }
}
