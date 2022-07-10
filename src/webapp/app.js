import { startHeaderClock } from "./header_clock.js";
import { getJSON } from "./read_JSON.js";
import { populatePosts } from "./populate_posts.js";

export const postsElement = document.getElementById('posts');

startHeaderClock;

let postsArray = await getJSON('/src/static/postsData.json')
populatePosts(postsArray);

const userElements = document.querySelectorAll('.userName');

console.log(userElements);

userElements.forEach((user) => {
    user.addEventListener('click', () => {
        postsElement.classList.add('hidden');
        console.log(user.textContent);
    });
});

