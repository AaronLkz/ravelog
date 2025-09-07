// Configuración de Supabase
const supabaseUrl = 'https://rxzftiapimrwlvnnppeg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4emZ0aWFwaW1yd2x2bm5wcGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDc1MjcsImV4cCI6MjA3MTcyMzUyN30.pkWs-omaGxgXq5gVNdHHfGYJ-pVXMAOGJR6vYaSBptQ';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Obtiene los tmdb_id únicos de las series que tienen capítulos registrados
async function obtenerSeriesConCapitulosIds() {
    const { data, error } = await supabase
        .from('capitulos_series')
        .select('serie_tmdb_id');
    if (error) return [];
    // Devuelve solo los IDs únicos
    return [...new Set(data.map(row => row.serie_tmdb_id))];
}

// Genera el slug para el link de capítulos
function slugify(texto) {
    return texto.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

// Escapa caracteres HTML especiales
function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

// Renderiza el ítem de serie con el botón de capítulos
function renderSerieItem(item, seriesConCapitulosIds) {
    const tieneCapitulos = seriesConCapitulosIds.includes(item.tmdb_id);
    const slug = slugify(item.titulo);
    const capLink = tieneCapitulos ? `series/${slug}.html` : '#';
    const capBtnClass = `rave-btn${tieneCapitulos ? '' : ' disabled'}`;
    return `
        <span class="title">${escapeHtml(item.titulo)}</span>
        <a class="${capBtnClass}" href="${capLink}" ${tieneCapitulos ? '' : 'tabindex="-1" aria-disabled="true"'}>Ver capítulos</a>
    `;
}

// Ordena alfabéticamente por título (función utilitaria)
function ordenarPorTitulo(arr, campo = 'titulo') {
    return arr.slice().sort((a, b) => {
        const tA = (a[campo] || '').toLowerCase();
        const tB = (b[campo] || '').toLowerCase();
        return tA.localeCompare(tB);
    });
}

// Carga una lista específica
async function cargarLista(tabla, ulSelector, seriesConCapitulosIds = []) {
    const { data, error } = await supabase.from(tabla).select('*');
    if (error) return [];
    const ul = document.querySelector(ulSelector);
    ul.innerHTML = '';
    if (data) {
        const ordenados = ordenarPorTitulo(data, 'titulo');
        ordenados.forEach(item => {
            const li = document.createElement('li');
            // Si es una serie, muestra el botón de capítulos
            if (tabla === 'vistas_series' || tabla === 'pendientes_series') {
                li.innerHTML = renderSerieItem(item, seriesConCapitulosIds);
            } else {
                // Para películas, sigue mostrando el botón de Rave
                const tieneLink = !!item.rave_link;
                li.innerHTML = `
                    <span class="title">${escapeHtml(item.titulo)}</span>
                    <a 
                        class="rave-btn${tieneLink ? '' : ' disabled'}"
                        href="${tieneLink ? item.rave_link : '#'}"
                        target="_blank" rel="noopener"
                        ${tieneLink ? '' : 'tabindex="-1" aria-disabled="true"'}
                    >Ver en Rave</a>
                `;
            }
            if (item.tmdb_id) {
                li.dataset.tmdbId = item.tmdb_id;
            }
            ul.appendChild(li);
        });
    }
    return data || [];
}

// Modifica cargarTodasPeliculas para ordenar
async function cargarTodasPeliculas() {
    const [vistas, pendientes] = await Promise.all([
        supabase.from('vistas').select('*'),
        supabase.from('pendientes').select('*')
    ]);
    const data = [...(vistas.data || []), ...(pendientes.data || [])];
    const ordenados = ordenarPorTitulo(data, 'titulo');
    const ul = document.querySelector('#todas-peliculas .gallery');
    ul.innerHTML = '';
    ordenados.forEach(item => {
        const tieneLink = !!item.rave_link;
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="title">${escapeHtml(item.titulo)}</span>
            <a 
                class="rave-btn${tieneLink ? '' : ' disabled'}"
                href="${tieneLink ? item.rave_link : '#'}"
                target="_blank" rel="noopener"
                ${tieneLink ? '' : 'tabindex="-1" aria-disabled="true"'}
            >Ver en Rave</a>
        `;
        if (item.tmdb_id) {
            li.dataset.tmdbId = item.tmdb_id;
        }
        ul.appendChild(li);
    });
}

// Modifica cargarTodasSeries para ordenar
async function cargarTodasSeries(seriesConCapitulosIds) {
    const [vistas, pendientes] = await Promise.all([
        supabase.from('vistas_series').select('*'),
        supabase.from('pendientes_series').select('*')
    ]);
    const data = [...(vistas.data || []), ...(pendientes.data || [])];
    const ordenados = ordenarPorTitulo(data, 'titulo');
    const ul = document.querySelector('#todas-series .gallery');
    ul.innerHTML = '';
    ordenados.forEach(item => {
        const li = document.createElement('li');
        li.classList.add('serie-item');
        li.innerHTML = renderSerieItem(item, seriesConCapitulosIds);
        ul.appendChild(li);
    });
}

// Carga todas las listas
async function cargarTodo() {
    const seriesConCapitulosIds = await obtenerSeriesConCapitulosIds();
    await Promise.all([
        cargarTodasPeliculas(),
        cargarTodasSeries(seriesConCapitulosIds),
        cargarLista('vistas', '#vistas-peliculas .gallery'),
        cargarLista('vistas_series', '#vistas-series .gallery', seriesConCapitulosIds),
        cargarLista('pendientes', '#pendientes-peliculas .gallery'),
        cargarLista('pendientes_series', '#pendientes-series .gallery', seriesConCapitulosIds)
    ]);
    if (window.agregarCaratulas) {
        await window.agregarCaratulas(); // Usa await si es async
    }
}

// Inicializa
cargarTodo();

// Barra de búsqueda para filtrar títulos en la sección activa
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    searchInput.addEventListener('input', () => {
        const filtro = searchInput.value.trim().toLowerCase();
        // Busca la sección activa
        const activeSection = document.querySelector('main section.active');
        if (!activeSection) return;
        // Filtra los elementos de la galería
        activeSection.querySelectorAll('.gallery li').forEach(li => {
            const titulo = li.querySelector('.title')?.textContent?.toLowerCase() || '';
            li.style.display = titulo.includes(filtro) ? '' : 'none';
        });
    });
});

// Limpia la búsqueda al cambiar de tab
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';
    });
});

function renderGallery(items, galleryElement) {
    // Ordena los elementos por título alfabéticamente
    items.sort((a, b) => {
        const titleA = (a.title || '').toLowerCase();
        const titleB = (b.title || '').toLowerCase();
        return titleA.localeCompare(titleB);
    });

    galleryElement.innerHTML = '';
    items.forEach(item => {
        // ...código para crear y agregar cada elemento a la galería...
    });
}