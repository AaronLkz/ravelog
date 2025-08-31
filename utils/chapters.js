import { fetchPoster } from './tmdb.js';

const supabaseUrl = 'https://rxzftiapimrwlvnnppeg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4emZ0aWFwaW1yd2x2bm5wcGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDc1MjcsImV4cCI6MjA3MTcyMzUyN30.pkWs-omaGxgXq5gVNdHHfGYJ-pVXMAOGJR6vYaSBptQ';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function cargarCapitulos() {
    const section = document.querySelector('#capitulos-lista');
    const ul = document.querySelector('.chapters-gallery');
    ul.innerHTML = '';

    // Lee el TMDB ID desde el atributo data-tmdb-id
    const serieTmdbId = section?.dataset.tmdbId;
    if (!serieTmdbId) {
        ul.innerHTML = `<li style="color:red;">No se encontró el ID de la serie.</li>`;
        return;
    }

    const { data, error } = await supabase
        .from('capitulos_series')
        .select('*')
        .eq('serie_tmdb_id', serieTmdbId)
        .order('temporada', { ascending: true })
        .order('numero', { ascending: true });

    ul.innerHTML = '';

    if (error) {
        ul.innerHTML = `<li style="color:red;">Error cargando capítulos.</li>`;
        return;
    }
    if (!data || data.length === 0) {
        ul.innerHTML = `<li>No hay capítulos registrados para esta serie.</li>`;
        return;
    }

    for (const cap of data) {
        const tmdbUrl = `https://api.themoviedb.org/3/tv/${serieTmdbId}/season/${cap.temporada}/episode/${cap.numero}?api_key=4383dc16d81a7584696651b492c79c6a&language=es-MX`;
        let titulo = cap.titulo || '';
        let posterUrl = '';
        let overview = '';
        try {
            const res = await fetch(tmdbUrl);
            const tmdbData = await res.json();
            titulo = titulo || tmdbData.name || `Episodio ${cap.numero}`;
            posterUrl = tmdbData.still_path ? `https://image.tmdb.org/t/p/w500${tmdbData.still_path}` : '';
            overview = tmdbData.overview || '';
        } catch (e) {
            titulo = titulo || `Episodio ${cap.numero}`;
        }

        const li = document.createElement('li');
        li.innerHTML = `
            ${posterUrl ? `<img src="${posterUrl}" alt="Poster capítulo">` : ''}
            <div class="chapter-title">T${cap.temporada}E${cap.numero} - ${escapeHtml(titulo)}</div>
            <a class="rave-btn${cap.rave_link ? '' : ' disabled'}"
                href="${cap.rave_link ? cap.rave_link : '#'}"
                target="_blank"
                ${cap.rave_link ? '' : 'tabindex="-1" aria-disabled="true"'}
            >Ver en Rave</a>
        `;
        ul.appendChild(li);
    }
}

document.addEventListener('DOMContentLoaded', cargarCapitulos);