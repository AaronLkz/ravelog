import { fetchPoster } from './utils/tmdb.js';

document.querySelectorAll('.gallery').forEach(ul => {
    const isSeries = ul.previousElementSibling.textContent.toLowerCase().includes('serie');
    ul.querySelectorAll('li').forEach(async li => {
        const posterUrl = await fetchPoster(li.textContent, isSeries ? 'tv' : 'movie');
        if (posterUrl) {
            const img = document.createElement('img');
            img.src = posterUrl;
            img.alt = li.textContent;
            img.className = 'poster';
            li.prepend(img);
        }
    });
});