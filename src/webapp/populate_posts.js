import { postsWrapper, threadWrapper } from './app.js';
import { createDiv, horizontalDivider } from './DOM_helpers.js';

export const populatePosts = (postsArray, isThread) => {

    postsArray.forEach(post => {
        let singlePost = createDiv('single-post');

        let postHeader = createDiv('post-header');

        let postDate = createDiv('post-date', `real time of posting: ${post.timestamp}`);
        postHeader.appendChild(postDate);

        let postAuthor = createDiv('post-user', `real posting by: <b>${post.user}</b>`);
        postHeader.appendChild(postAuthor);

        singlePost.appendChild(postHeader);

        let hr = horizontalDivider('post-horizontal');
        singlePost.appendChild(hr);
        
        let postBody = document.createElement('div');
        postBody.classList.add('post-body');

        if (post.title) {
            let postTitle = createDiv('post-title', `${post.title}`, `${post.postID}`);
            postBody.appendChild(postTitle);
        }
        
        let postContent = createDiv('post-content', `${post.content}`);
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
            
            let commentCount = commentIcon.outerHTML + `&nbsp;${post.comments} comment`;
            if (post.comments > 1 || post.comments == 0) 
                commentCount += 's';

            let postComments = createDiv('post-comments', commentCount, `${post.postID}`);
            
            if (post.unread) 
                postComments.classList.add('unread');

            postFooter.appendChild(postComments);
            singlePost.appendChild(postFooter);

            postsWrapper.appendChild(singlePost);

        }
         
    });
}

