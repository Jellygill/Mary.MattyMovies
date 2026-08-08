/**
 * videoProvider.js - Client-Side Multi-Server Embed Provider
 * Provides multiple fast stream servers (Embed.su, VidSrc, VidLink, AutoEmbed, 2Embed, Videasy).
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

  // High-availability embed stream providers
  const EMBED_SERVERS = [
    {
      id: 'embedsu',
      name: 'Server 1 (EmbedSu)',
      getMovieUrl: (id) => `https://embed.su/embed/movie/${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://embed.su/embed/tv/${id}/${s}/${e}`
    },
    {
      id: 'vidsrc',
      name: 'Server 2 (VidSrc)',
      getMovieUrl: (id) => `https://vidsrc.to/embed/movie/${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`
    },
    {
      id: 'vidsrcme',
      name: 'Server 3 (VidSrc.me)',
      getMovieUrl: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`
    },
    {
      id: 'vidlink',
      name: 'Server 4 (VidLink)',
      getMovieUrl: (id) => `https://vidlink.pro/movie/${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://vidlink.pro/tv/${id}/${s}/${e}`
    },
    {
      id: 'autoembed',
      name: 'Server 5 (AutoEmbed)',
      getMovieUrl: (id) => `https://player.autoembed.cc/embed/movie/${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`
    },
    {
      id: 'twoembed',
      name: 'Server 6 (2Embed)',
      getMovieUrl: (id) => `https://www.2embed.cc/embed/${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`
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
