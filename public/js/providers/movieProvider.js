/**
 * movieProvider.js - Unified Client Provider Layer
 * Dynamically switches between Express Backend API (if available)
 * and Client-Side Providers (for GitHub Pages static hosting).
 */

window.CineStream = window.CineStream || {};

(function() {
  let isApiAvailable = null;

  async function checkServerApi() {
    if (isApiAvailable !== null) return isApiAvailable;
    // Don't attempt server API fetch if protocol is file://
    if (window.location.protocol === 'file:') {
      isApiAvailable = false;
      return false;
    }
    try {
      const res = await fetch('/api/movies/featured', { method: 'HEAD' });
      isApiAvailable = res.ok;
    } catch (e) {
      isApiAvailable = false;
    }
    return isApiAvailable;
  }

  window.CineStream.MovieProvider = {
    async getFeatured() {
      const useApi = await checkServerApi();
      if (useApi) {
        const res = await fetch('/api/movies/featured');
        const json = await res.json();
        return json.data;
      }
      const movies = await window.CineStream.TMDBClientProvider.getFeaturedMovies();
      return Promise.all(movies.map(m => this._attachClientPlayback(m)));
    },

    async getTrending() {
      const useApi = await checkServerApi();
      if (useApi) {
        const res = await fetch('/api/movies/trending');
        const json = await res.json();
        return json.data;
      }
      const movies = await window.CineStream.TMDBClientProvider.getTrendingMovies();
      return Promise.all(movies.map(m => this._attachClientPlayback(m)));
    },

    async getPopular() {
      const useApi = await checkServerApi();
      if (useApi) {
        const res = await fetch('/api/movies/popular');
        const json = await res.json();
        return json.data;
      }
      const movies = await window.CineStream.TMDBClientProvider.getPopularMovies();
      return Promise.all(movies.map(m => this._attachClientPlayback(m)));
    },

    async search(query, genre) {
      const useApi = await checkServerApi();
      if (useApi) {
        const res = await fetch(`/api/movies/search?q=${encodeURIComponent(query || '')}&genre=${encodeURIComponent(genre || '')}`);
        const json = await res.json();
        return json.data;
      }
      const movies = await window.CineStream.TMDBClientProvider.searchMovies(query, genre);
      return Promise.all(movies.map(m => this._attachClientPlayback(m)));
    },

    async getById(id, type = null) {
      const useApi = await checkServerApi();
      if (useApi) {
        const res = await fetch(`/api/movies/${encodeURIComponent(id)}`);
        const json = await res.json();
        return json.data;
      }
      const movie = await window.CineStream.TMDBClientProvider.getMovieById(id, type);
      return this._attachClientPlayback(movie);
    },

    async getWatchDetails(id, type = null) {
      const useApi = await checkServerApi();
      if (useApi) {
        const res = await fetch(`/api/watch/${encodeURIComponent(id)}`);
        const json = await res.json();
        return json.data;
      }
      const movie = await window.CineStream.TMDBClientProvider.getMovieById(id, type);
      const playback = await window.CineStream.VideoClientProvider.getPlaybackSource(movie.id, movie.mediaType || type, movie.imdbId);
      return {
        id: movie.id,
        mediaType: movie.mediaType || type,
        imdbId: movie.imdbId || null,
        title: movie.title,
        year: movie.year,
        backdrop: movie.backdrop,
        poster: movie.poster,
        rating: movie.rating,
        runtime: movie.runtime,
        description: movie.description,
        playback: playback
      };
    },

    async _attachClientPlayback(movie) {
      const playback = await window.CineStream.VideoClientProvider.getPlaybackSource(movie.id, movie.mediaType, movie.imdbId);
      return {
        ...movie,
        playback: {
          type: playback.type,
          trailerUrl: playback.trailerUrl
        }
      };
    }
  };
})();
