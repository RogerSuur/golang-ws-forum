import { messagesWrapper, currentUser } from "./app.js";
import { createDiv, $ } from "./DOM_helpers.js";
//import { getJSON } from "./read_JSON.js";

export const initMessages = (DB, from, num) => {

    //console.log("initMessages", from, num);
    
    let interSection = $('message-intersection-observer');

    if (from === DB.length) {
        messagesWrapper.innerHTML = '';
        messagesWrapper.appendChild(interSection);    
    }

    let i = from - 1;

    while (i >= num) {

        if (i === num) {
            interSection.remove();
            messagesWrapper.appendChild(interSection);    
        }

        let singleMessage = createSingleMessage(i, DB[i].content, DB[i].from, DB[i].timestamp)
        
        messagesWrapper.appendChild(singleMessage);

        i--;
    }
}

export const createSingleMessage = (index, content, from, timestamp) => {
    let singleMessage = createDiv('single-message');

    singleMessage.setAttribute('id', `message-${index}`);

    let messageContent = createDiv('message-content', content);
    
    //if (DB[i].from !== previousUser) {
        let messageAuthor = createDiv('message-user', from);
        if (from === currentUser.innerHTML) {
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
    //previousUser = DB[i].from;

    singleMessage.appendChild(messageContent);

    let messageDate = createDiv('message-date', timestamp);
    
    singleMessage.appendChild(messageDate);

    return singleMessage

}
