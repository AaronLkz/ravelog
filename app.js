import { fetchPoster } from './utils/tmdb.js';

// Navegación por tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('main section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// Aquí puedes agregar tu integración con TMDb para carátulas
document.querySelectorAll('.gallery').forEach(ul => {
    const isSeries = ul.parentElement.id.includes('series');
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