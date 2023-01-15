import { postsWrapper, threadWrapper } from './app.js';
import { createDiv, horizontalDivider, $ } from './DOM_helpers.js';

export const initPosts = (DB, from, to, isThread) => {

    //console.log("initPosts", DB, from, to, isThread);

    let i = from;
    while (i < to) {

        const singlePost = createDiv('single-post');
        if (isThread) {
            singlePost.setAttribute('id', `thread-${DB[i].commentID}`);
        } else {
            singlePost.setAttribute('id', `post-${DB[i].postID}`);
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
            let category = createDiv('post-category', `${DB[i].category}`, `${DB[i].category}`);
            let postTitle = createDiv('post-title', `${DB[i].title}`, `${DB[i].postID}`);
            postTitle.prepend(category);
            postBody.appendChild(postTitle);
        }

        let postContent = createDiv('post-content', `${DB[i].content}`);
        postBody.appendChild(postContent);

        singlePost.appendChild(postBody);

        if (i === to - 1) {
            //interSection.remove();
            if (isThread) {
                let interSection = $('thread-intersection-observer');
                //interSection.remove();
                threadWrapper.appendChild(interSection);
            } else {
                let interSection = $('intersection-observer');
                //interSection.remove();
                postsWrapper.appendChild(interSection);
            }
        }

        if (isThread) {
            threadWrapper.appendChild(singlePost);
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
        i++;
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