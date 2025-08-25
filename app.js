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

// Función para agregar carátulas de TMDb a todos los elementos de las galerías
export async function agregarCaratulas() {
    document.querySelectorAll('.gallery').forEach(ul => {
        const isSeries = ul.parentElement.id.includes('series');
        ul.querySelectorAll('li').forEach(async li => {
            // Evita duplicar carátulas si ya existe una imagen o fake-poster
            if (li.querySelector('img.poster, .fake-poster')) return;
            const titleSpan = li.querySelector('.title');
            const titulo = titleSpan ? titleSpan.textContent : li.textContent;
            const posterUrl = await fetchPoster(titulo, isSeries ? 'tv' : 'movie');
            if (posterUrl) {
                const img = document.createElement('img');
                img.src = posterUrl;
                img.alt = titulo;
                img.className = 'poster';
                li.prepend(img);
            } else {
                const fakePoster = document.createElement('div');
                fakePoster.className = 'fake-poster';
                fakePoster.textContent = '🎬';
                li.prepend(fakePoster);
            }
        });
    });
}

// Llama a agregarCaratulas después de cada carga de listas
window.agregarCaratulas = agregarCaratulas;
setTimeout(agregarCaratulas, 500); // Primer render tras carga inicial