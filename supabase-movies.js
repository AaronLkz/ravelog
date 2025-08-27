// Configuración de Supabase
const supabaseUrl = 'https://rxzftiapimrwlvnnppeg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4emZ0aWFwaW1yd2x2bm5wcGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDc1MjcsImV4cCI6MjA3MTcyMzUyN30.pkWs-omaGxgXq5gVNdHHfGYJ-pVXMAOGJR6vYaSBptQ';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Carga una lista específica
async function cargarLista(tabla, ulSelector) {
    const { data, error } = await supabase.from(tabla).select('*');
    if (error) {
        console.error(`Error cargando ${tabla}:`, error.message);
        return [];
    }
    const ul = document.querySelector(ulSelector);
    ul.innerHTML = '';
    if (data) {
        data.forEach(item => {
            const tieneLink = !!item.rave_link;
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="title">${item.titulo}</span>
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
    return data || [];
}

// Carga todas las películas (vistas + pendientes)
async function cargarTodasPeliculas() {
    const [vistas, pendientes] = await Promise.all([
        supabase.from('vistas').select('*'),
        supabase.from('pendientes').select('*')
    ]);
    const data = [...(vistas.data || []), ...(pendientes.data || [])];
    const ul = document.querySelector('#todas-peliculas .gallery');
    ul.innerHTML = '';
    data.forEach(item => {
        const tieneLink = !!item.rave_link;
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="title">${item.titulo}</span>
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

// Carga todas las series (vistas + pendientes)
async function cargarTodasSeries() {
    const [vistas, pendientes] = await Promise.all([
        supabase.from('vistas_series').select('*'),
        supabase.from('pendientes_series').select('*')
    ]);
    const data = [...(vistas.data || []), ...(pendientes.data || [])];
    const ul = document.querySelector('#todas-series .gallery');
    ul.innerHTML = '';
    data.forEach(item => {
        const tieneLink = !!item.rave_link;
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="title">${item.titulo}</span>
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

// Carga todas las listas
async function cargarTodo() {
    await Promise.all([
        cargarTodasPeliculas(),
        cargarTodasSeries(),
        cargarLista('vistas', '#vistas-peliculas .gallery'),
        cargarLista('vistas_series', '#vistas-series .gallery'),
        cargarLista('pendientes', '#pendientes-peliculas .gallery'),
        cargarLista('pendientes_series', '#pendientes-series .gallery')
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