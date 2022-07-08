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
    
    let postTitle = document.createElement('div');
    postTitle.classList.add('post-title');
    postTitle.innerHTML = post.title;
    singlePost.appendChild(postTitle);
    
    let postContent = document.createElement('div');
    postContent.classList.add('post-content');
    postContent.innerHTML = post.content;
    singlePost.appendChild(postContent);

    let postAuthor = document.createElement('div');
    postAuthor.classList.add('post-author');
    postAuthor.innerHTML = post.user;
    singlePost.appendChild(postAuthor);

    let postDate = document.createElement('div');
    postDate.classList.add('post-date');
    postDate.innerHTML = post.date;
    singlePost.appendChild(postDate);

    let postComments = document.createElement('div');
    postComments.classList.add('post-comments');
    postComments.innerHTML = `<i class="fa-regular fa-message"></i> ${post.comments}`;
    singlePost.appendChild(postComments);
    
    postsElement.appendChild(singlePost);
});


console.log(postsArray);




