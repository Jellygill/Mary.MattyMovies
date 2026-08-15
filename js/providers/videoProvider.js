/**
 * videoProvider.js - Client-Side Multi-Server Embed Provider
 * Server 1 is Videasy (as preferred by user) followed by fast, reliable, verified mirrors
 * with full support for TV series (True Beauty, etc.) using TMDB & IMDb matching.
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

  // High-Speed Verified Stream Servers
  const EMBED_SERVERS = [
    {
      id: 'videasy',
      name: 'Server 1 (Videasy — Clean + Subtitles)',
      getMovieUrl: (id) => `https://player.videasy.net/movie/${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://player.videasy.net/tv/${id}/${s}/${e}`
    },
    {
      id: 'autoembed',
      name: 'Server 2 (AutoEmbed VIP — Ultra Fast)',
      getMovieUrl: (id, imdb) => imdb ? `https://autoembed.co/movie/imdb/${imdb}` : `https://autoembed.co/movie/tmdb/${id}`,
      getTvUrl: (id, s = 1, e = 1, imdb) => imdb ? `https://autoembed.co/tv/imdb/${imdb}-${s}-${e}` : `https://autoembed.co/tv/tmdb/${id}-${s}-${e}`
    },
    {
      id: 'vidsrc',
      name: 'Server 3 (VidSrc Pro — Fast Mirror)',
      getMovieUrl: (id, imdb) => imdb ? `https://vidsrc.me/embed/movie?imdb=${imdb}` : `https://vidsrc.pm/embed/movie?tmdb=${id}`,
      getTvUrl: (id, s = 1, e = 1, imdb) => imdb ? `https://vidsrc.me/embed/tv?imdb=${imdb}&season=${s}&episode=${e}` : `https://vidsrc.pm/embed/tv?tmdb=${id}&season=${s}&episode=${e}`
    },
    {
      id: 'twoembed',
      name: 'Server 4 (2Embed — 1080p Stream)',
      getMovieUrl: (id) => `https://www.2embed.cc/embed/${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`
    },
    {
      id: 'smashystream',
      name: 'Server 5 (SmashyStream — Multi-Source)',
      getMovieUrl: (id) => `https://embed.smashystream.com/playere.php?tmdb=${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${s}&episode=${e}`
    }
  ];

  window.CineStream.VideoClientProvider = {
    EMBED_SERVERS,

    async getPlaybackSource(movieId, mediaType = 'movie', imdbId = null) {
      if (DIRECT_SOURCES[movieId]) {
        return DIRECT_SOURCES[movieId];
      }

      const isTV = mediaType === 'tv';
      const defaultServer = EMBED_SERVERS[0];
      const initialUrl = isTV ? defaultServer.getTvUrl(movieId, 1, 1, imdbId) : defaultServer.getMovieUrl(movieId, imdbId);

      const servers = EMBED_SERVERS.map(srv => ({
        id: srv.id,
        name: srv.name,
        url: isTV ? srv.getTvUrl(movieId, 1, 1, imdbId) : srv.getMovieUrl(movieId, imdbId)
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
