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
            // Elimina cualquier carátula previa
            const prevImg = li.querySelector('img.poster');
            if (prevImg) prevImg.remove();
            const titleSpan = li.querySelector('.title');
            const titulo = titleSpan ? titleSpan.textContent : li.textContent;
            const posterUrl = await fetchPoster(titulo, isSeries ? 'tv' : 'movie');
            if (posterUrl) {
                const img = document.createElement('img');
                img.src = posterUrl;
                img.alt = titulo;
                img.className = 'poster';
                li.prepend(img);
            }
            // Si no hay poster, no se agrega nada visual
        });
    });
}

// Llama a agregarCaratulas después de cada carga de listas
window.agregarCaratulas = agregarCaratulas;
setTimeout(agregarCaratulas, 500); // Primer render tras carga inicial