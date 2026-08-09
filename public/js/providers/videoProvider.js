/**
 * videoProvider.js - Client-Side Multi-Server Embed Provider
 * Default server prioritizes clean playback and built-in subtitles (Videasy, VidPhantom, VidFast).
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

  // Clean embed servers — default first; subtitles are handled inside each player UI.
  const EMBED_SERVERS = [
    {
      id: 'videasy',
      name: 'Server 1 (Videasy — Clean + Subtitles)',
      getMovieUrl: (id) => `https://player.videasy.net/movie/${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://player.videasy.net/tv/${id}/${s}/${e}`
    },
    {
      id: 'vidphantom',
      name: 'Server 2 (VidPhantom — Ad-Free)',
      getMovieUrl: (id) => `https://vidphantom.com/movie/${id}?autoplay=false&subShadow=true`,
      getTvUrl: (id, s = 1, e = 1) => `https://vidphantom.com/tv/${id}/${s}/${e}?autoplay=false&subShadow=true`
    },
    {
      id: 'vidfast',
      name: 'Server 3 (VidFast — English Subs)',
      getMovieUrl: (id) => `https://vidfast.vc/movie/${id}?autoPlay=false&sub=en&hideServer=true&theme=141414`,
      getTvUrl: (id, s = 1, e = 1) => `https://vidfast.vc/tv/${id}/${s}/${e}?autoPlay=false&sub=en&hideServer=true&theme=141414`
    },
    {
      id: 'vidsrcfyi',
      name: 'Server 4 (VidSrc Pro — Multi-Sub)',
      getMovieUrl: (id) => `https://vidsrc.fyi/embed/movie/${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://vidsrc.fyi/embed/tv/${id}/${s}/${e}`
    },
    {
      id: 'vidlink',
      name: 'Server 5 (VidLink — Backup 1080p)',
      getMovieUrl: (id) => `https://vidlink.pro/movie/${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://vidlink.pro/tv/${id}/${s}/${e}`
    },
    {
      id: 'goated',
      name: 'Server 6 (Goated — HD + Subtitles)',
      getMovieUrl: (id) => `https://goated.cx/movie/${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://goated.cx/tv/${id}/${s}/${e}`
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
