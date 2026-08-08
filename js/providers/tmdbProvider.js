/**
 * tmdbProvider.js - Client-Side TMDB API Provider
 * Fetches real movie metadata from The Movie Database (TMDB) API.
 * Falls back to static catalog if API is unavailable.
 */

window.CineStream = window.CineStream || {};

(function() {
  const TMDB_API_KEY  = '8da19210099b47ea34f080eb884e956b';
  const TMDB_BASE     = 'https://api.themoviedb.org/3';
  const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p';

  // --- Fallback catalog (used if TMDB is unreachable) ---
  const FALLBACK_CATALOG = [
    {
      id: 'tears-of-steel',
      title: 'Tears of Steel',
      year: 2012,
      rating: 7.8,
      runtime: '12 min',
      genres: ['Sci-Fi', 'Action'],
      description: 'In a dystopian future in Amsterdam, a group of warriors and scientists gather to stage a crucial desperate intervention to save humanity.',
      poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
      backdrop: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1920&auto=format&fit=crop',
      isFeatured: true, isTrending: true, isPopular: true
    }
  ];

  // --- TMDB Helpers ---
  async function tmdbFetch(endpoint, params = {}) {
    const url = new URL(`${TMDB_BASE}${endpoint}`);
    url.searchParams.set('api_key', TMDB_API_KEY);
    url.searchParams.set('language', 'en-US');
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`TMDB ${res.status}`);
    return res.json();
  }

  function formatMovie(m) {
    const posterPath   = m.poster_path   ? `${TMDB_IMG_BASE}/w500${m.poster_path}`   : 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800';
    const backdropPath = m.backdrop_path ? `${TMDB_IMG_BASE}/w1280${m.backdrop_path}` : 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1920';
    const year  = m.release_date ? new Date(m.release_date).getFullYear() : '—';
    const genres = (m.genres || m.genre_ids || []).map(g => typeof g === 'object' ? g.name : g).filter(Boolean);

    return {
      id:          String(m.id),
      title:       m.title || m.original_title || 'Unknown',
      year,
      rating:      m.vote_average ? parseFloat(m.vote_average.toFixed(1)) : 0,
      voteCount:   m.vote_count || 0,
      runtime:     m.runtime ? `${m.runtime} min` : null,
      genres,
      director:    m.director || null,
      cast:        m.cast || [],
      tagline:     m.tagline || '',
      description: m.overview || '',
      poster:      posterPath,
      backdrop:    backdropPath,
      isFeatured:  false,
      isTrending:  false,
      isPopular:   false
    };
  }

  // --- Provider ---
  window.CineStream.TMDBClientProvider = {

    async getFeaturedMovies() {
      try {
        const data = await tmdbFetch('/movie/now_playing', { page: 1 });
        const movies = (data.results || []).slice(0, 10).map(formatMovie);
        if (movies.length > 0) movies[0].isFeatured = true;
        return movies;
      } catch (e) {
        console.warn('TMDB getFeaturedMovies failed, using fallback:', e);
        return FALLBACK_CATALOG.filter(m => m.isFeatured);
      }
    },

    async getTrendingMovies() {
      try {
        const data = await tmdbFetch('/trending/movie/week');
        return (data.results || []).slice(0, 20).map(m => ({ ...formatMovie(m), isTrending: true }));
      } catch (e) {
        console.warn('TMDB getTrendingMovies failed, using fallback:', e);
        return FALLBACK_CATALOG.filter(m => m.isTrending);
      }
    },

    async getPopularMovies() {
      try {
        const data = await tmdbFetch('/movie/popular', { page: 1 });
        return (data.results || []).slice(0, 20).map(m => ({ ...formatMovie(m), isPopular: true }));
      } catch (e) {
        console.warn('TMDB getPopularMovies failed, using fallback:', e);
        return FALLBACK_CATALOG;
      }
    },

    async searchMovies(query = '', genre = '') {
      try {
        if (!query.trim() && !genre) return this.getPopularMovies();
        const data = await tmdbFetch('/search/movie', { query: query.trim(), page: 1 });
        let results = (data.results || []).map(formatMovie);
        if (genre) {
          results = results.filter(m => m.genres.some(g => g.toLowerCase().includes(genre.toLowerCase())));
        }
        return results;
      } catch (e) {
        console.warn('TMDB searchMovies failed, using fallback:', e);
        return FALLBACK_CATALOG;
      }
    },

    async getMovieById(id) {
      try {
        const data = await tmdbFetch(`/movie/${id}`, { append_to_response: 'credits' });
        const movie = formatMovie(data);
        if (data.credits) {
          const director = (data.credits.crew || []).find(c => c.job === 'Director');
          if (director) movie.director = director.name;
          movie.cast = (data.credits.cast || []).slice(0, 6).map(c => c.name);
        }
        return movie;
      } catch (e) {
        console.warn('TMDB getMovieById failed, using fallback:', e);
        return FALLBACK_CATALOG[0];
      }
    },

    getAllMovies() {
      return FALLBACK_CATALOG;
    }
  };
})();
