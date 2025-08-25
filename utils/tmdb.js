const TMDB_API_KEY = '4383dc16d81a7584696651b492c79c6a';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMG_URL = 'https://image.tmdb.org/t/p/w185';

export async function fetchPoster(title, type = 'movie') {
    const urlES = `${TMDB_BASE_URL}/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=es-MX`;
    const urlEN = `${TMDB_BASE_URL}/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=en-US`;

    let res = await fetch(urlES);
    let data = await res.json();
    if (data.results && data.results[0] && data.results[0].poster_path) {
        return TMDB_IMG_URL + data.results[0].poster_path;
    }
    res = await fetch(urlEN);
    data = await res.json();
    if (data.results && data.results[0] && data.results[0].poster_path) {
        return TMDB_IMG_URL + data.results[0].poster_path;
    }
    return null;
}