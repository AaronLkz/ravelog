import { fetchPoster } from './utils/tmdb.js';

// Sistema de gestión de estado de la aplicación
class AppState {
    constructor() {
        this.currentTab = 'todas-peliculas';
        this.isRestoring = false;
        this.posterQueue = new Map();
        this.isProcessingPosters = false;
    }

    setCurrentTab(tabId) {
        this.currentTab = tabId;
        this.isRestoring = false;
    }

    setRestoring(restoring) {
        this.isRestoring = restoring;
    }

    isTabRestoring() {
        return this.isRestoring;
    }
}

const appState = new AppState();

// Navegación por tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (appState.isTabRestoring()) return; // Evitar clicks durante restauración
        
        switchToTab(btn.dataset.tab);
    });
});

// Función centralizada para cambiar de tab
function switchToTab(tabId) {
    // Limpiar estado anterior
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('main section').forEach(sec => sec.classList.remove('active'));
    
    // Activar nuevo tab
    const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    const section = document.getElementById(tabId);
    
    if (tabBtn && section) {
        tabBtn.classList.add('active');
        section.classList.add('active');
        appState.setCurrentTab(tabId);
        
        // Cargar carátulas para la nueva sección
        loadPostersForSection(tabId);
    }
}

// Control de concurrencia mejorado para carátulas
let posterProcessingQueue = new Set();

export async function agregarCaratulas() {
    if (posterProcessingQueue.size > 0) return;
    
    const allLis = [];
    document.querySelectorAll('.gallery').forEach(ul => {
        ul.querySelectorAll('li').forEach(li => {
            if (!li.querySelector('img.poster')) {
                allLis.push({li, isSeries: ul.parentElement.id.includes('series')});
            }
        });
    });
    
    if (allLis.length === 0) return;
    
    await processPosterBatch(allLis);
}

// Procesar carátulas en lotes
async function processPosterBatch(posters, batchSize = 5) {
    for (let i = 0; i < posters.length; i += batchSize) {
        const batch = posters.slice(i, i + batchSize);
        await Promise.all(batch.map(async ({li, isSeries}) => {
            const processId = Math.random().toString(36);
            posterProcessingQueue.add(processId);
            
            try {
                await loadSinglePoster(li, isSeries);
            } catch (error) {
                console.warn('Error cargando carátula:', error);
            } finally {
                posterProcessingQueue.delete(processId);
            }
        }));
        
        if (i + batchSize < posters.length) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
}

// Cargar una sola carátula
async function loadSinglePoster(li, isSeries) {
    if (!li.isConnected || li.querySelector('img.poster')) return;
    
    const titleSpan = li.querySelector('.title');
    const titulo = titleSpan ? titleSpan.textContent : li.textContent;
    const tmdbId = li.dataset.tmdbId;
    
    let posterUrl;
    if (tmdbId) {
        posterUrl = await fetchPoster(null, isSeries ? 'tv' : 'movie', tmdbId);
    } else {
        posterUrl = await fetchPoster(titulo, isSeries ? 'tv' : 'movie');
    }
    
    if (posterUrl && !li.querySelector('img.poster') && li.isConnected) {
        const img = document.createElement('img');
        img.src = posterUrl;
        img.alt = titulo;
        img.className = 'poster';
        li.prepend(img);
    }
}

// Función para cargar carátulas solo para una sección específica
async function loadPostersForSection(seccionId) {
    const seccion = document.getElementById(seccionId);
    if (!seccion) return;
    
    const gallery = seccion.querySelector('.gallery');
    if (!gallery) return;
    
    const lis = gallery.querySelectorAll('li:not(:has(img.poster))');
    if (lis.length === 0) return;
    
    console.log(` Cargando carátulas para sección: ${seccionId}`);
    
    // Crear array de elementos a procesar
    const posters = Array.from(lis).map(li => ({
        li,
        isSeries: seccionId.includes('series')
    }));
    
    // Procesar en lotes
    await processPosterBatch(posters);
    
    console.log(`✅ Carátulas cargadas para sección: ${seccionId}`);
}

// Exporta funciones globales
window.agregarCaratulas = agregarCaratulas;
window.loadPostersForSection = loadPostersForSection;

// Guarda el tab activo antes de navegar a una serie
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.rave-btn');
    if (btn && btn.href && btn.href.includes('series/')) {
        const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
        if (activeTab) {
            localStorage.setItem('lastTab', activeTab);
            console.log(`💾 Guardando tab activo: ${activeTab}`);
        }
    }
});

// Sistema de restauración de tab mejorado
class TabRestorer {
    constructor() {
        this.isRestoring = false;
        this.restoreTimeout = null;
    }

    async restoreLastTab() {
        const lastTab = localStorage.getItem('lastTab');
        if (!lastTab) return false;

        console.log(`🔄 Iniciando restauración del tab: ${lastTab}`);
        
        // Marcar que estamos restaurando
        this.isRestoring = true;
        appState.setRestoring(true);
        
        try {
            // Limpiar timeout anterior si existe
            if (this.restoreTimeout) {
                clearTimeout(this.restoreTimeout);
            }
            
            // Esperar a que el DOM esté completamente listo
            await this.waitForDOMReady();
            
            // Cambiar al tab guardado
            switchToTab(lastTab);
            
            // Esperar a que la galería esté renderizada
            await this.waitForGalleryReady(lastTab);
            
            // Cargar carátulas inmediatamente
            await loadPostersForSection(lastTab);
            
            console.log(`✅ Tab restaurado exitosamente: ${lastTab}`);
            return true;
            
        } catch (error) {
            console.error('Error restaurando tab:', error);
            return false;
        } finally {
            // Limpiar estado
            this.isRestoring = false;
            appState.setRestoring(false);
            localStorage.removeItem('lastTab');
        }
    }

    async waitForDOMReady() {
        return new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve, { once: true });
            }
        });
    }

    async waitForGalleryReady(tabId) {
        return new Promise((resolve) => {
            const checkGallery = () => {
                const section = document.getElementById(tabId);
                const gallery = section?.querySelector('.gallery');
                
                if (gallery && gallery.children.length > 0) {
                    console.log(`✅ Galería lista para: ${tabId}`);
                    resolve();
                } else {
                    console.log(`⏳ Esperando galería para: ${tabId}`);
                    setTimeout(checkGallery, 100);
                }
            };
            
            checkGallery();
        });
    }

    cancelRestore() {
        if (this.restoreTimeout) {
            clearTimeout(this.restoreTimeout);
            this.restoreTimeout = null;
        }
        this.isRestoring = false;
        appState.setRestoring(false);
    }
}

const tabRestorer = new TabRestorer();

// Al cargar el index, restaurar el tab guardado
document.addEventListener('DOMContentLoaded', async () => {
    // Esperar un poco para que Supabase termine de cargar
    setTimeout(async () => {
        await tabRestorer.restoreLastTab();
    }, 100);
});

// Cargar carátulas globalmente solo si no hay restauración
setTimeout(() => {
    if (!appState.isTabRestoring()) {
        agregarCaratulas();
    }
}, 500);