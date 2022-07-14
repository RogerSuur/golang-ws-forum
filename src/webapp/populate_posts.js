import { postsWrapper } from './app.js';
import { createDiv, horizontalDivider } from './DOM_helpers.js';

export const populatePosts = (postsArray) => {

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

        let postTitle = createDiv('post-title', `${post.title}`);
        postBody.appendChild(postTitle);
        
        let postContent = createDiv('post-content', `${post.content}`);
        postBody.appendChild(postContent);

        singlePost.appendChild(postBody);

        hr = horizontalDivider('post-horizontal');
        singlePost.appendChild(hr);
        
        let postFooter = createDiv('post-footer');
        
        let commentIcon = document.createElement('i');
        commentIcon.classList.add('fa-regular', 'fa-message');
        if (post.comments > 0) 
            commentIcon.classList.add('active');

        let commentCount = commentIcon.outerHTML + `&nbsp;${post.comments} comment`;
        if (post.comments > 1 || post.comments == 0) 
            commentCount += 's';

        let postComments = createDiv('post-comments', commentCount);
        
        postFooter.appendChild(postComments);
        singlePost.appendChild(postFooter);
        
        postsWrapper.appendChild(singlePost);
    });

}

