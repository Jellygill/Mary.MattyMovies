/**
 * videoProvider.js - Client-Side Video Source Provider
 * Uses vidsrc.me embed for real TMDB movie IDs.
 * Falls back to direct MP4 for known open-license films.
 */

window.CineStream = window.CineStream || {};

(function() {

  // Open-license films with direct MP4 sources (Blender Foundation)
  const DIRECT_SOURCES = {
    'tears-of-steel': {
      type: 'direct',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      subtitles: [],
      trailerUrl: 'https://www.youtube-nocookie.com/embed/r6b3bCDi4f0'
    },
    'big-buck-bunny': {
      type: 'direct',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      subtitles: [],
      trailerUrl: 'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ'
    },
    'sintel': {
      type: 'direct',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      subtitles: [],
      trailerUrl: 'https://www.youtube-nocookie.com/embed/eRsGyueVLvQ'
    },
    'elephants-dream': {
      type: 'direct',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      subtitles: [],
      trailerUrl: 'https://www.youtube-nocookie.com/embed/TLkA0RELQ1g'
    }
  };

  window.CineStream.VideoClientProvider = {
    async getPlaybackSource(movieId) {
      // Use direct source if it's one of our known open-license films
      if (DIRECT_SOURCES[movieId]) {
        return DIRECT_SOURCES[movieId];
      }

      // For all real TMDB numeric IDs, use vidsrc embed player
      const numericId = parseInt(movieId, 10);
      if (!isNaN(numericId)) {
        return {
          type: 'embed',
          url: `https://vidsrc.to/embed/movie/${numericId}`,
          subtitles: [],
          trailerUrl: null
        };
      }

      // Last fallback — shouldn't normally be reached
      return {
        type: 'embed',
        url: `https://vidsrc.to/embed/movie/${movieId}`,
        subtitles: [],
        trailerUrl: null
      };
    }
  };
})();
