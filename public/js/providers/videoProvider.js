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

  // Curated Asian Drama direct stream mappings (K-VID / VidBasic / EmbedLoad)
  const ASIAN_DRAMA_SOURCES = {
    // Resident Playbook (TMDB 235355)
    '235355': {
      1: {
        1: 'https://embedload.cfd/watch?v=7204',
        2: 'https://embedload.cfd/watch?v=7301',
        3: 'https://vidbasic.top/embed/al2dnud4bdr',
        4: 'https://vidbasic.top/embed/e31qnswkazl',
        5: 'https://vidbasic.top/embed/m1av4ijem4q',
        6: 'https://vidbasic.top/embed/n6v9aunkg64',
        7: 'https://vidbasic.top/embed/n6v9aunkq3j',
        8: 'https://vidbasic.top/embed/34kwvhg19ln',
        9: 'https://vidbasic.top/embed/1bmd4sd1gvp',
        10: 'https://vidbasic.top/embed/1bmd4sd1grp',
        11: 'https://vidbasic.top/embed/wnljqswkmv3',
        12: 'https://vidbasic.top/embed/gqpjnfakjrw'
      }
    }
  };

  // Verified servers with subtitle + multi-audio support (tested Sept 2026)
  const EMBED_SERVERS = [
    {
      id: 'videasy',
      name: 'Server 1 (Videasy — Clean + Subtitles)',
      getMovieUrl: (id) => `https://player.videasy.net/movie/${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://player.videasy.net/tv/${id}/${s}/${e}`
    },
    {
      id: 'vidcore',
      name: 'Server 2 (VidCore — HLS + Multi-Track / ArtPlayer)',
      getMovieUrl: (id) => `https://vidcore.org/embed/movie/${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://vidcore.org/embed/tv/${id}/${s}/${e}`
    },
    {
      id: 'multiembed',
      name: 'Server 3 (MultiEmbed — Multi-Host / Original Audio)',
      getMovieUrl: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
      getTvUrl: (id, s = 1, e = 1) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`
    },
    {
      id: 'vidlink',
      name: 'Server 4 (VidLink — Fast CDN + Subtitles)',
      getMovieUrl: (id) => `https://vidlink.pro/movie/${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://vidlink.pro/tv/${id}/${s}/${e}`
    },
    {
      id: 'vidsrcpm',
      name: 'Server 5 (VidSrc.pm — Multi-Audio Options)',
      getMovieUrl: (id) => `https://vidsrc.pm/embed/movie?tmdb=${id}`,
      getTvUrl: (id, s = 1, e = 1) => `https://vidsrc.pm/embed/tv?tmdb=${id}&season=${s}&episode=${e}`
    },
    {
      id: 'kvid',
      name: 'Server 6 (K-VID — Asian Drama Original Audio)',
      getMovieUrl: (id) => `https://player.videasy.net/movie/${id}`,
      getTvUrl: (id, s = 1, e = 1) => {
        const drama = ASIAN_DRAMA_SOURCES[String(id)];
        if (drama && drama[s] && drama[s][e]) {
          return drama[s][e];
        }
        return `https://player.videasy.net/tv/${id}/${s}/${e}`;
      }
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
