const messagesElement = document.querySelector('.messagesWrapper');

export const populateMessages = (messagesArray, currentUser) => {

    let previousUser = '';

    messagesArray.forEach(message => {
        let singleMessage = document.createElement('div');
        singleMessage.classList.add('single-message');

        let messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.innerHTML = message.content;

        let messageAuthor = document.createElement('div');
        messageAuthor.classList.add('message-user');

        if (previousUser !== message.from) {
            if (message.from === currentUser) {
                messageAuthor.innerHTML = `Me`;
                singleMessage.classList.add('me');
                messageAuthor.classList.add('me');
                messageContent.classList.add('me');
            } else {
                messageAuthor.innerHTML = `${message.from}`;
            }
            singleMessage.appendChild(messageAuthor);
        } else if (previousUser === currentUser) {
            singleMessage.classList.add('me');
            messageAuthor.classList.add('me');
            messageContent.classList.add('me');
        }
        previousUser = message.from;

        singleMessage.appendChild(messageContent);

        let messageDate = document.createElement('div');
        messageDate.classList.add('message-date');
        messageDate.innerHTML = `${message.date}`;
        singleMessage.appendChild(messageDate);
            
        messagesElement.appendChild(singleMessage);
    });
}