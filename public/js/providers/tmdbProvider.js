/**
 * tmdbProvider.js - Client-Side TMDB API Provider
 * Support full multi-search (Movies, TV Shows, Anime) and detailed lookup.
 */

window.CineStream = window.CineStream || {};

(function() {
  const TMDB_API_KEY  = '8da19210099b47ea34f080eb884e956b';
  const TMDB_BASE     = 'https://api.themoviedb.org/3';
  const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p';

  // --- Fallback catalog ---
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
      isFeatured: true, isTrending: true, isPopular: true, mediaType: 'movie'
    }
  ];

  async function tmdbFetch(endpoint, params = {}) {
    const url = new URL(`${TMDB_BASE}${endpoint}`);
    url.searchParams.set('api_key', TMDB_API_KEY);
    url.searchParams.set('language', 'en-US');
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`TMDB ${res.status}`);
    return res.json();
  }

  function formatMedia(m) {
    const isTV = (m.media_type === 'tv') || (!m.title && Boolean(m.name));
    const title = isTV ? (m.name || m.original_name) : (m.title || m.original_title || 'Unknown');
    const dateStr = isTV ? m.first_air_date : m.release_date;
    const year = dateStr ? new Date(dateStr).getFullYear() : '—';

    const posterPath   = m.poster_path   ? `${TMDB_IMG_BASE}/w500${m.poster_path}`   : 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800';
    const backdropPath = m.backdrop_path ? `${TMDB_IMG_BASE}/w1280${m.backdrop_path}` : 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1920';
    const genres = (m.genres || m.genre_ids || []).map(g => typeof g === 'object' ? g.name : g).filter(Boolean);

    return {
      id:          String(m.id),
      mediaType:   isTV ? 'tv' : 'movie',
      title,
      year,
      rating:      m.vote_average ? parseFloat(m.vote_average.toFixed(1)) : 0,
      voteCount:   m.vote_count || 0,
      runtime:     m.runtime ? `${m.runtime} min` : (m.episode_run_time && m.episode_run_time[0] ? `${m.episode_run_time[0]} min` : null),
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

  window.CineStream.TMDBClientProvider = {

    async getFeaturedMovies() {
      try {
        const data = await tmdbFetch('/movie/now_playing', { page: 1 });
        const movies = (data.results || []).slice(0, 10).map(formatMedia);
        if (movies.length > 0) movies[0].isFeatured = true;
        return movies;
      } catch (e) {
        console.warn('TMDB getFeaturedMovies failed:', e);
        return FALLBACK_CATALOG.filter(m => m.isFeatured);
      }
    },

    async getTrendingMovies() {
      try {
        const data = await tmdbFetch('/trending/all/week');
        return (data.results || [])
          .filter(m => m.media_type === 'movie' || m.media_type === 'tv')
          .slice(0, 20)
          .map(m => ({ ...formatMedia(m), isTrending: true }));
      } catch (e) {
        console.warn('TMDB getTrendingMovies failed:', e);
        return FALLBACK_CATALOG.filter(m => m.isTrending);
      }
    },

    async getPopularMovies() {
      try {
        const data = await tmdbFetch('/movie/popular', { page: 1 });
        return (data.results || []).slice(0, 20).map(m => ({ ...formatMedia(m), isPopular: true }));
      } catch (e) {
        console.warn('TMDB getPopularMovies failed:', e);
        return FALLBACK_CATALOG;
      }
    },

    async searchMovies(query = '', genre = '') {
      try {
        if (!query.trim() && !genre) return this.getPopularMovies();

        // Use multi search to get movies, tv shows, and anime
        const data = await tmdbFetch('/search/multi', { query: query.trim(), page: 1 });
        let results = (data.results || [])
          .filter(m => m.media_type === 'movie' || m.media_type === 'tv')
          .map(formatMedia);

        if (genre) {
          results = results.filter(m => m.genres.some(g => g.toLowerCase().includes(genre.toLowerCase())));
        }
        return results;
      } catch (e) {
        console.warn('TMDB searchMovies failed:', e);
        return FALLBACK_CATALOG;
      }
    },

    async getMovieById(id) {
      // First attempt movie lookup
      try {
        const data = await tmdbFetch(`/movie/${id}`, { append_to_response: 'credits' });
        const movie = formatMedia(data);
        if (data.credits) {
          const director = (data.credits.crew || []).find(c => c.job === 'Director');
          if (director) movie.director = director.name;
          movie.cast = (data.credits.cast || []).slice(0, 6).map(c => c.name);
        }
        return movie;
      } catch (e) {
        // If movie fails, attempt TV show lookup
        try {
          const tvData = await tmdbFetch(`/tv/${id}`, { append_to_response: 'credits' });
          const tvShow = formatMedia({ ...tvData, media_type: 'tv' });
          if (tvData.credits) {
            const creator = (tvData.created_by || [])[0];
            if (creator) tvShow.director = creator.name;
            tvShow.cast = (tvData.credits.cast || []).slice(0, 6).map(c => c.name);
          }
          return tvShow;
        } catch (err) {
          console.warn('TMDB getMovieById failed for both movie and TV:', err);
          return FALLBACK_CATALOG[0];
        }
      }
    },

    getAllMovies() {
      return FALLBACK_CATALOG;
    }
  };
})();
