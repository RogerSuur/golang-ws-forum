import { startHeaderClock } from "./header_clock.js";
import { populatePosts } from "./populate_posts.js";
import { getJSON } from "./read_JSON.js";

startHeaderClock;

let postsArray = await getJSON('/src/static/postsData.json')
populatePosts(postsArray);