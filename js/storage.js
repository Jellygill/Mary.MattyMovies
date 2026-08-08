/**
 * storage.js - LocalStorage Persistence Manager
 * Manages Watchlist and Continue Watching playback position state.
 */

window.CineStream = window.CineStream || {};

(function() {
  const WATCHLIST_KEY = 'cinestream_watchlist_v1';
  const PROGRESS_KEY = 'cinestream_progress_v1';

  window.CineStream.Storage = {
    // --- WATCHLIST MANAGEMENT ---
    getWatchlist() {
      try {
        const raw = localStorage.getItem(WATCHLIST_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.error('Failed to read watchlist', e);
        return [];
      }
    },

    isInWatchlist(movieId) {
      const list = this.getWatchlist();
      return list.some(item => String(item.id) === String(movieId));
    },

    addToWatchlist(movie) {
      if (!movie || !movie.id) return false;
      const list = this.getWatchlist();
      if (!list.some(item => String(item.id) === String(movie.id))) {
        list.unshift({
          id: movie.id,
          title: movie.title,
          poster: movie.poster,
          backdrop: movie.backdrop,
          year: movie.year,
          rating: movie.rating,
          addedAt: Date.now()
        });
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('cinestream:watchlist-updated', { detail: list }));
        return true;
      }
      return false;
    },

    removeFromWatchlist(movieId) {
      let list = this.getWatchlist();
      const initialLength = list.length;
      list = list.filter(item => String(item.id) !== String(movieId));
      if (list.length !== initialLength) {
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('cinestream:watchlist-updated', { detail: list }));
        return true;
      }
      return false;
    },

    toggleWatchlist(movie) {
      if (this.isInWatchlist(movie.id)) {
        this.removeFromWatchlist(movie.id);
        return false;
      } else {
        this.addToWatchlist(movie);
        return true;
      }
    },

    // --- CONTINUE WATCHING / PLAYBACK PROGRESS ---
    getAllProgress() {
      try {
        const raw = localStorage.getItem(PROGRESS_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch (e) {
        console.error('Failed to read progress', e);
        return {};
      }
    },

    getProgress(movieId) {
      const all = this.getAllProgress();
      return all[movieId] || null;
    },

    saveProgress(movieId, movieMeta, currentTime, duration) {
      if (!movieId || isNaN(currentTime) || currentTime < 2) return;
      const all = this.getAllProgress();
      
      // If watched more than 95%, clear progress
      if (duration && (currentTime / duration) >= 0.95) {
        delete all[movieId];
      } else {
        all[movieId] = {
          id: movieId,
          title: movieMeta.title || 'Movie',
          poster: movieMeta.poster || '',
          backdrop: movieMeta.backdrop || '',
          year: movieMeta.year || 2026,
          currentTime: Math.floor(currentTime),
          duration: Math.floor(duration || 0),
          percent: duration ? Math.min(100, Math.floor((currentTime / duration) * 100)) : 0,
          updatedAt: Date.now()
        };
      }

      localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('cinestream:progress-updated', { detail: all }));
    },

    removeProgress(movieId) {
      const all = this.getAllProgress();
      if (all[movieId]) {
        delete all[movieId];
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
        window.dispatchEvent(new CustomEvent('cinestream:progress-updated', { detail: all }));
      }
    },

    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return '0:00';
      const sec = Math.floor(seconds);
      const mins = Math.floor(sec / 60);
      const secs = sec % 60;
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      if (hrs > 0) {
        return `${hrs}:${remMins < 10 ? '0' : ''}${remMins}:${secs < 10 ? '0' : ''}${secs}`;
      }
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
  };
})();
