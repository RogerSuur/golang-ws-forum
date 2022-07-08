const hour = document.getElementById('hour');
const minute = document.getElementById('minute');
const second = document.getElementById('second');

setInterval(() => {
    let d = new Date(); //object of date()
    let hr = d.getHours();
    let min = d.getMinutes();
    let sec = d.getSeconds();
    let hr_rotation = 30 * hr + min / 2; //converting current time
    let min_rotation = 6 * min;
    let sec_rotation = 6 * sec;
  
    hour.style.transform = `rotate(${hr_rotation}deg)`;
    minute.style.transform = `rotate(${min_rotation}deg)`;
    second.style.transform = `rotate(${sec_rotation}deg)`;
}, 1000);


const postsElement = document.getElementById('posts');

async function getJSON(path) {
    const data = await fetch(`${path}`)
    .then(response => {
            if (response.ok) return response.json()
            throw Error(response.statusText)
        })
    .then(result => {
            if (result.error) throw Error(result.error)
            return result.posts
        })
    .catch(error => {throw error})
    return data
}

let postsArray = await getJSON('/src/static/postsData.json')

postsArray.forEach(post => {
    let singlePost = document.createElement('div');
    singlePost.classList.add('single-post');

    let postHeader = document.createElement('div');
    postHeader.classList.add('post-header');

    let postDate = document.createElement('div');
    postDate.classList.add('post-date');
    postDate.innerHTML = `real time of posting: ${post.date}`;
    postHeader.appendChild(postDate);

    let postAuthor = document.createElement('div');
    postAuthor.classList.add('post-date');
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
    
    postsElement.appendChild(singlePost);
});
