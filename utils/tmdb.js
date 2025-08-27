// utils/tmdb.js

const TMDB_API_KEY = "4383dc16d81a7584696651b492c79c6a";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMG_URL = "https://image.tmdb.org/t/p/w500";

// Función para buscar películas o series y devolver poster
export async function fetchPoster(query, tipo = 'movie', tmdbId = null) {
    let url;
    if (tmdbId) {
        url = `${TMDB_BASE_URL}/${tipo}/${tmdbId}?api_key=${TMDB_API_KEY}&language=es-MX`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.poster_path) {
            return TMDB_IMG_URL + data.poster_path;
        }
        return null;
    } else {
        url = `${TMDB_BASE_URL}/search/${tipo}?api_key=${TMDB_API_KEY}&language=es-MX&query=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.results && data.results.length > 0 && data.results[0].poster_path) {
            return TMDB_IMG_URL + data.results[0].poster_path;
        }
        return null;
    }
}

// Si luego quieres exportar otras funciones (buscarSeries, obtenerDetalle, etc.)
export async function buscarSeries(query) {
    const url = `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&language=es-MX&query=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results;
}

export async function buscarPeliculas(query) {
    const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=es-MX&query=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results;
}
