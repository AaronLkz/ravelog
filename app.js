import { fetchPoster } from './utils/tmdb.js';

// Navegación por tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('main section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(btn.dataset.tab).classList.add('active');
        // Cargar carátulas para la nueva sección activa después de un pequeño delay
        setTimeout(() => {
            cargarCaratulasParaSeccion(btn.dataset.tab);
        }, 100);
    });
});

// Control de concurrencia mejorado para evitar carátulas dobles
let caratulasEnProceso = new Set();
export async function agregarCaratulas() {
    if (caratulasEnProceso.size > 0) return;
    const allLis = [];
    document.querySelectorAll('.gallery').forEach(ul => {
        ul.querySelectorAll('li').forEach(li => {
            if (!li.querySelector('img.poster')) {
                allLis.push({li, isSeries: ul.parentElement.id.includes('series')});
            }
        });
    });
    if (allLis.length === 0) return;
    const batchSize = 5;
    for (let i = 0; i < allLis.length; i += batchSize) {
        const batch = allLis.slice(i, i + batchSize);
        await Promise.all(batch.map(async ({li, isSeries}) => {
            const processId = Math.random().toString(36);
            caratulasEnProceso.add(processId);
            try {
                const titleSpan = li.querySelector('.title');
                const titulo = titleSpan ? titleSpan.textContent : li.textContent;
                const tmdbId = li.dataset.tmdbId;
                let posterUrl;
                if (tmdbId) {
                    posterUrl = await fetchPoster(null, isSeries ? 'tv' : 'movie', tmdbId);
                } else {
                    posterUrl = await fetchPoster(titulo, isSeries ? 'tv' : 'movie');
                }
                if (posterUrl && !li.querySelector('img.poster')) {
                    const img = document.createElement('img');
                    img.src = posterUrl;
                    img.alt = titulo;
                    img.className = 'poster';
                    li.prepend(img);
                }
            } catch (error) {
                console.warn('Error cargando carátula:', error);
            } finally {
                caratulasEnProceso.delete(processId);
            }
        }));
        if (i + batchSize < allLis.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
}

// Función para cargar carátulas solo para una sección específica
async function cargarCaratulasParaSeccion(seccionId) {
    const seccion = document.getElementById(seccionId);
    if (!seccion) return;
    const gallery = seccion.querySelector('.gallery');
    if (!gallery) return;
    const lis = gallery.querySelectorAll('li:not(:has(img.poster))');
    if (lis.length === 0) return;
    for (const li of lis) {
        const isSeries = seccionId.includes('series');
        const titleSpan = li.querySelector('.title');
        const titulo = titleSpan ? titleSpan.textContent : li.textContent;
        const tmdbId = li.dataset.tmdbId;
        try {
            let posterUrl;
            if (tmdbId) {
                posterUrl = await fetchPoster(null, isSeries ? 'tv' : 'movie', tmdbId);
            } else {
                posterUrl = await fetchPoster(titulo, isSeries ? 'tv' : 'movie');
            }
            if (posterUrl && !li.querySelector('img.poster')) {
                const img = document.createElement('img');
                img.src = posterUrl;
                img.alt = titulo;
                img.className = 'poster';
                li.prepend(img);
            }
        } catch (error) {
            console.warn('Error cargando carátula:', error);
        }
    }
}

// Exporta funciones globales
window.agregarCaratulas = agregarCaratulas;
window.cargarCaratulasParaSeccion = cargarCaratulasParaSeccion;

// Elimina la carga global de carátulas para evitar recargas dobles
// setTimeout(agregarCaratulas, 500);
// window.addEventListener('load', () => {
//     setTimeout(agregarCaratulas, 1000);
// });

// Guarda el tab activo antes de navegar a una serie
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.rave-btn');
    if (btn && btn.href && btn.href.includes('series/')) {
        const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
        if (activeTab) {
            localStorage.setItem('lastTab', activeTab);
        }
    }
});

// Al cargar el index, restaura el tab guardado y carga carátulas solo para esa sección
document.addEventListener('DOMContentLoaded', () => {
    const lastTab = localStorage.getItem('lastTab');
    if (lastTab) {
        const tabBtn = document.querySelector(`.tab-btn[data-tab="${lastTab}"]`);
        if (tabBtn) {
            tabBtn.click();
            // Espera a que la galería esté renderizada antes de cargar carátulas
            setTimeout(() => {
                if (window.cargarCaratulasParaSeccion) {
                    window.cargarCaratulasParaSeccion(lastTab);
                }
            }, 300); // Aumenta el delay para asegurar que la galería esté lista
        }
        localStorage.removeItem('lastTab');
    }
});