import { messagesWrapper } from "./app.js";
import { createDiv, $ } from "./DOM_helpers.js";
//import { getJSON } from "./read_JSON.js";

export const initMessages = (DB, from, num, currentUser) => {

    let interSection = $('message-intersection-observer');
    if (from === 0) {
        messagesWrapper.innerHTML = '';
        messagesWrapper.appendChild(interSection);    
    }

    if (interSection.nextElementSibling !== null) {
        let temp = interSection.nextElementSibling;
        interSection.nextElementSibling.remove();
        messagesWrapper.insertBefore(temp, interSection);
    }
    
    //let previousUser;
    // let messagesObject = await getJSON('/static/messagesData.json');

    for (let i = from; i < from + num; i++) {
        let singleMessage = createDiv('single-message');

        singleMessage.setAttribute('id', `message-${i}`);

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
        //previousUser = DB[i].from;

        singleMessage.appendChild(messageContent);

        let messageDate = createDiv('message-date', DB[i].timestamp);
        
        singleMessage.appendChild(messageDate);

        messagesWrapper.appendChild(singleMessage);
        
        
        if (i == from + num - 1) {
            messagesWrapper.appendChild(singleMessage);
        } else {
            messagesWrapper.insertBefore(singleMessage, interSection);
        }
        
    }
}
