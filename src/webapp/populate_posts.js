import { postsWrapper, threadWrapper } from './app.js';
import { createDiv, horizontalDivider } from './DOM_helpers.js';

export const initPosts = (DB, num, isThread) => {
  
    for (let i = 0; i < num; i++) {
        const singlePost = createDiv('single-post');
        if (isThread) {
            singlePost.setAttribute('id', `thread-${i}`);
        } else {
            singlePost.setAttribute('id', `post-${i}`);
        }

        let postHeader = createDiv('post-header');

        let postDate = createDiv('post-date', `real time of posting: ${DB[i].timestamp}`);
        postHeader.appendChild(postDate);

        let postAuthor = createDiv('post-user', `real posting by: <b>${DB[i].user}</b>`);
        postHeader.appendChild(postAuthor);

        singlePost.appendChild(postHeader);

        let hr = horizontalDivider('post-horizontal');
        singlePost.appendChild(hr);

        let postBody = document.createElement('div');
        postBody.classList.add('post-body');

        if (DB[i].title) {
            let postTitle = createDiv('post-title', `${DB[i].title}`, `${DB[i].postID}`);
            postBody.appendChild(postTitle);
        }

        let postContent = createDiv('post-content', `${DB[i].content}`);
        postBody.appendChild(postContent);

        singlePost.appendChild(postBody);

        if (isThread) {

            // insert thread before user input area
            let userCommentForm = threadWrapper.lastElementChild;
            threadWrapper.insertBefore(singlePost, userCommentForm);

        } else {
        
            // add footer with comments count
            hr = horizontalDivider('post-horizontal');
            singlePost.appendChild(hr);
            
            let postFooter = createDiv('post-footer');
            
            let commentIcon = document.createElement('i');
            commentIcon.classList.add('fa-regular', 'fa-message');
            
            let commentCount = commentIcon.outerHTML + `&nbsp;${DB[i].comments} comment`;
            if (DB[i].comments > 1 || DB[i].comments == 0) 
                commentCount += 's';

            let postComments = createDiv('post-comments', commentCount, `${DB[i].postID}`);
            
            if (DB[i].unread) 
                postComments.classList.add('unread');

            postFooter.appendChild(postComments);
            singlePost.appendChild(postFooter);

            postsWrapper.appendChild(singlePost);

        }
  }
}

export function createCommentNode(post) {
    let commentIcon = document.createElement('i');
    commentIcon.classList.add('fa-regular', 'fa-message');

    let commentCount = commentIcon.outerHTML + `&nbsp;${post.comments} comment`;
    if (post.comments > 1 || post.comments == 0)
        commentCount += 's';
    return commentCount;
}
