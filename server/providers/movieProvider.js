/**
 * movieProvider.js - Main Movie Aggregator Provider
 * Combines metadata from tmdbProvider and playback sources from videoProvider
 * returning normalized JSON payloads to the REST endpoints.
 */

const tmdbProvider = require('./tmdbProvider');
const videoProvider = require('./videoProvider');

class MovieProvider {
  async getFeatured() {
    const movies = await tmdbProvider.getFeaturedMovies();
    return Promise.all(movies.map(m => this._attachPlaybackInfo(m)));
  }

  async getTrending() {
    const movies = await tmdbProvider.getTrendingMovies();
    return Promise.all(movies.map(m => this._attachPlaybackInfo(m)));
  }

  async getPopular() {
    const movies = await tmdbProvider.getPopularMovies();
    return Promise.all(movies.map(m => this._attachPlaybackInfo(m)));
  }

  async search(query, genre) {
    const movies = await tmdbProvider.searchMovies(query, genre);
    return Promise.all(movies.map(m => this._attachPlaybackInfo(m)));
  }

  async getById(id) {
    const movie = await tmdbProvider.getMovieById(id);
    return this._attachPlaybackInfo(movie);
  }

  async getWatchDetails(id) {
    const movie = await tmdbProvider.getMovieById(id);
    const playback = await videoProvider.getPlaybackSource(movie.id);
    return {
      id: movie.id,
      title: movie.title,
      year: movie.year,
      backdrop: movie.backdrop,
      poster: movie.poster,
      rating: movie.rating,
      runtime: movie.runtime,
      description: movie.description,
      playback: playback
    };
  }

  async _attachPlaybackInfo(movie) {
    const playback = await videoProvider.getPlaybackSource(movie.id);
    return {
      ...movie,
      playback: {
        type: playback.type,
        trailerUrl: playback.trailerUrl
      }
    };
  }
}

module.exports = new MovieProvider();
