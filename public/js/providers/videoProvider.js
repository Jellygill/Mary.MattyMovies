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

  // Curated Asian Drama direct stream mappings (KissCloud / MyAsianTV CDN)
  const ASIAN_DRAMA_SOURCES = {
    // Resident Playbook (TMDB 235355)
    '235355': {
      1: {
        1: 'https://kisscloud.online/video/52947e0ade57a09e4a1386d08f17b656',
        2: 'https://kisscloud.online/video/69d658d0b2859e32cd4dc3b970c8496c',
        3: 'https://kisscloud.online/video/e9fd7c2c6623306db59b6aef5c0d5cac',
        4: 'https://kisscloud.online/video/71a58e8cb75904f24cde464161c3e766',
        5: 'https://kisscloud.online/video/36ac8e558ac7690b6f44e2cb5ef93322',
        6: 'https://kisscloud.online/video/92bbd31f8e0e43a7da8a6295b251725f',
        7: 'https://kisscloud.online/video/70c445ee64b1ed0583367a12a79a9ef2',
        8: 'https://kisscloud.online/video/9407c826d8e3c07ad37cb2d13d1cb641',
        9: 'https://kisscloud.online/video/2b64c2f19d868305aa8bbc2d72902cc5',
        10: 'https://kisscloud.online/video/f6b5f8c32c65fee991049a55dc97d1ce',
        11: 'https://kisscloud.online/video/831b1ac54cc8db480e3babac5fa2256b',
        12: 'https://kisscloud.online/video/14e422f05b68cc0139988e128ee880df'
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
      id: 'kisscloud',
      name: 'Server 6 (KissCloud — Asian Drama Original Audio)',
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
