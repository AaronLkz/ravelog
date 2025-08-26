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

// Control de concurrencia para evitar carátulas dobles
let agregarCaratulasEnEjecucion = false;
export async function agregarCaratulas() {
    if (agregarCaratulasEnEjecucion) return;
    agregarCaratulasEnEjecucion = true;
    const allLis = [];
    document.querySelectorAll('.gallery').forEach(ul => {
        ul.querySelectorAll('li').forEach(li => allLis.push({li, isSeries: ul.parentElement.id.includes('series')}));
    });
    for (const {li, isSeries} of allLis) {
        // Elimina todas las carátulas previas
        li.querySelectorAll('img.poster').forEach(img => img.remove());
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
    }
    agregarCaratulasEnEjecucion = false;
}

// Llama a agregarCaratulas después de cada carga de listas
window.agregarCaratulas = agregarCaratulas;
setTimeout(agregarCaratulas, 500); // Primer render tras carga inicial