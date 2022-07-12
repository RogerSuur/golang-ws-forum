import { postsWrapper } from './app.js';

export const populatePosts = (postsArray, remainingPosts) => {
    
    console.log(remainingPosts);

    postsArray.forEach(post => {
        let singlePost = document.createElement('div');
        singlePost.classList.add('single-post');

        let postHeader = document.createElement('div');
        postHeader.classList.add('post-header');

        let postDate = document.createElement('div');
        postDate.classList.add('post-date');
        postDate.innerHTML = `real time of posting: ${post.timestamp}`;
        postHeader.appendChild(postDate);

        let postAuthor = document.createElement('div');
        postAuthor.classList.add('post-user');
        postAuthor.innerHTML = `real posting by: <b>${post.user}</b>`;
        postHeader.appendChild(postAuthor);

        singlePost.appendChild(postHeader);

        let hr = document.createElement('hr');
        hr.classList.add('postHr');
        singlePost.appendChild(hr);
        
        let postBody = document.createElement('div');
        postBody.classList.add('post-body');

        let postTitle = document.createElement('div');
        postTitle.classList.add('post-title');
        postTitle.innerHTML = post.title;
        postBody.appendChild(postTitle);
        
        let postContent = document.createElement('div');
        postContent.classList.add('post-content');
        postContent.innerHTML = post.content;
        postBody.appendChild(postContent);

        singlePost.appendChild(postBody);

            
        hr = document.createElement('hr');
        hr.classList.add('postHr');
        singlePost.appendChild(hr);
        
        let postFooter = document.createElement('div');
        postFooter.classList.add('post-footer');
        
        let postComments = document.createElement('div');
        postComments.classList.add('post-comments');
        let commentIcon = document.createElement('i');
        commentIcon.classList.add('fa-regular', 'fa-message');
        if (post.comments > 0) {
            commentIcon.classList.add('active');
        }
        postComments.innerHTML = commentIcon.outerHTML + `&nbsp;${post.comments} comment`;
        if (post.comments > 1 || post.comments == 0) {
            postComments.innerHTML += 's';
        }   
        
        postFooter.appendChild(postComments);
        singlePost.appendChild(postFooter);
        
        postsWrapper.appendChild(singlePost);
    });
    if (remainingPosts > 5) {
        let morePosts = document.createElement('div');
        morePosts.classList.add('more-posts');
        morePosts.innerHTML = `${remainingPosts} older posts to read`;
        let loadMore = document.createElement('div');
        loadMore.classList.add('load-more');
        loadMore.innerHTML = `load more ...`;
        morePosts.appendChild(loadMore);
        postsWrapper.appendChild(morePosts);
    }
}