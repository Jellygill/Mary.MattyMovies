/**
 * videoProvider.js - Client-Side Multi-Server Embed Provider
 * Embedded playback sources. Their subtitle, audio, and quality controls are
 * provided by each source and are not guaranteed by this application.
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

  // Verified servers with subtitle + multi-audio support (tested Sept 2026)
  const EMBED_SERVERS = [
    {
      id: 'videasy',
      name: 'Server 1 (Videasy)',
      getMovieUrl: (id) => `https://player.videasy.net/movie/${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://player.videasy.net/tv/${id}/${s}/${e}`
    },
    {
      id: 'vidsrcpm',
      name: 'Server 2 (VidSrc — Subs + Multi-Audio)',
      getMovieUrl: (id) => `https://vidsrc.pm/embed/movie?tmdb=${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://vidsrc.pm/embed/tv?tmdb=${id}&season=${s}&episode=${e}`
    },
    {
      id: 'multiembed',
      name: 'Server 3 (MultiEmbed — Subs + Multi-Audio)',
      getMovieUrl: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
      getTvUrl: (id, s = 1, e = 1) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`
    },
    {
      id: 'vidlink',
      name: 'Server 4 (VidLink — Subs + Multi-Audio)',
      getMovieUrl: (id) => `https://vidlink.pro/movie/${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://vidlink.pro/tv/${id}/${s}/${e}`
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
