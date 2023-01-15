import { postsWrapper, threadWrapper } from './app.js';
import { createDiv, horizontalDivider, $ } from './DOM_helpers.js';

export const initPosts = (DB, from, to, isThread = false) => {

    //console.log("initPosts", DB, from, to, isThread);

    let i = from;
    while (i < to) {

        let existing 
        if (isThread) {
            existing = $(`thread-${DB[i].commentID}`);
        } else {
            existing = $(`post-${DB[i].postID}`);
        }
        
        if (existing) {
            i++;
            continue;
        }
        let insertIntersection = false;
        if (i === to - 1 && DB.length != 1) {
            //console.log("prev to last post");
            insertIntersection = true;
        }

        let newPost = createPost(DB[i], insertIntersection, isThread)

        if (isThread) {
            if (DB.length == 1) {
                threadWrapper.prepend(newPost);
            } else {
                threadWrapper.appendChild(newPost);
            }
        } else {
            postsWrapper.appendChild(newPost);
        }
       
        i++;
    }
}

export function createPost(postData, insertIntersection = false, isThread = false) {
    const singlePost = createDiv('single-post');
    if (isThread) {
        singlePost.setAttribute('id', `thread-${postData.commentID}`);
    } else {
        singlePost.setAttribute('id', `post-${postData.postID}`);
    }

    let postHeader = createDiv('post-header');

    let postDate = createDiv('post-date', `real time of posting: ${postData.timestamp}`);
    postHeader.appendChild(postDate);

    let postAuthor = createDiv('post-user', `real posting by: <b>${postData.user}</b>`);
    postHeader.appendChild(postAuthor);

    singlePost.appendChild(postHeader);

    let hr = horizontalDivider('post-horizontal');
    singlePost.appendChild(hr);

    let postBody = document.createElement('div');
    postBody.classList.add('post-body');

    if (postData.title) {
        let category = createDiv('post-category', `${postData.category}`, `${postData.category}`);
        let postTitle = createDiv('post-title', `${postData.title}`, `${postData.postID}`);
        postTitle.prepend(category);
        postBody.appendChild(postTitle);
    }

    let postContent = createDiv('post-content', `${postData.content}`);
    postBody.appendChild(postContent);

    singlePost.appendChild(postBody);

    if (insertIntersection) {
        //interSection.remove();
        if (isThread) {
            let interSection = $('thread-intersection-observer');
            interSection.remove();
            threadWrapper.appendChild(interSection);
        } else {
            let interSection = $('intersection-observer');
            interSection.remove();
            postsWrapper.appendChild(interSection);
        }
    }

    if (!isThread) {

        // add footer with comments count
        hr = horizontalDivider('post-horizontal');
        singlePost.appendChild(hr);

        let postFooter = createDiv('post-footer');

        let commentIcon = document.createElement('i');
        commentIcon.classList.add('fa-regular', 'fa-message');

        let commentCount = commentIcon.outerHTML + `&nbsp;${postData.comments} comment`;
        if (postData.comments > 1 || postData.comments == 0)
            commentCount += 's';

        let postComments = createDiv('post-comments', commentCount, `${postData.postID}`);

        if (postData.unread)
            postComments.classList.add('unread');

        postFooter.appendChild(postComments);
        singlePost.appendChild(postFooter);
    }

    return singlePost;
}

export function createCommentNode(post) {
    let commentIcon = document.createElement('i');
    commentIcon.classList.add('fa-regular', 'fa-message');

    let commentCount = commentIcon.outerHTML + `&nbsp;${post.comments} comment`;
    if (post.comments > 1 || post.comments == 0)
        commentCount += 's';
    return commentCount;
}