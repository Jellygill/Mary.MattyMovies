/**
 * videoProvider.js - Client-Side Multi-Server Embed Provider
 * Provides multiple fast stream servers.
 * Allows instant switching if any video is unavailable on a specific server.
 */

window.CineStream = window.CineStream || {};

(function() {

  // Open-license direct MP4 samples
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

  // High-availability embed stream providers - Using tested working endpoints (200 OK)
  const EMBED_SERVERS = [
    {
      id: 'vidsrcnet',
      name: 'Server 1 (VidSrc.net)',
      getMovieUrl: (id) => `https://vidsrc.net/embed/movie?tmdb=${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://vidsrc.net/embed/tv?tmdb=${id}&season=${s}&episode=${e}`
    },
    {
      id: 'vidsrcpm',
      name: 'Server 2 (VidSrc.pm)',
      getMovieUrl: (id) => `https://vidsrc.pm/embed/movie?tmdb=${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://vidsrc.pm/embed/tv?tmdb=${id}&season=${s}&episode=${e}`
    },
    {
      id: 'autoembed',
      name: 'Server 3 (AutoEmbed)',
      getMovieUrl: (id) => `https://autoembed.co/movie/tmdb/${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://autoembed.co/tv/tmdb/${id}-${s}-${e}`
    },
    {
      id: 'twoembed',
      name: 'Server 4 (2Embed)',
      getMovieUrl: (id) => `https://www.2embed.cc/embed/${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`
    },
    {
      id: 'multiembed',
      name: 'Server 5 (MultiEmbed)',
      getMovieUrl: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
      getTvUrl: (id, s = 1, e = 1) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`
    }
  ];

  window.CineStream.VideoClientProvider = {
    EMBED_SERVERS,

    async getPlaybackSource(movieId, mediaType = 'movie') {
      if (DIRECT_SOURCES[movieId]) {
        return DIRECT_SOURCES[movieId];
      }

      const isTV = mediaType === 'tv';
      const defaultServer = EMBED_SERVERS[0];
      const initialUrl = isTV ? defaultServer.getTvUrl(movieId) : defaultServer.getMovieUrl(movieId);

      const servers = EMBED_SERVERS.map(srv => ({
        id: srv.id,
        name: srv.name,
        url: isTV ? srv.getTvUrl(movieId) : srv.getMovieUrl(movieId)
      }));

      return {
        type: 'embed',
        url: initialUrl,
        servers,
        subtitles: [],
        trailerUrl: null
      };
    }
  };
})();
