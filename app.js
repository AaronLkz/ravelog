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

// Integración con TMDb para carátulas
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
        } else {
            // Solo agrega la carátula fake si no hay imagen real
            const fakePoster = document.createElement('div');
            fakePoster.className = 'fake-poster';
            fakePoster.textContent = '🎬';
            li.prepend(fakePoster);
        }
    });
});