/**
 * videoProvider.js - Video Stream & Embed Provider
 * Resolves legal video playback streams or authorized embed URLs for movie IDs.
 */

const VIDEO_SOURCES = {
  'tears-of-steel': {
    type: 'direct',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    subtitles: [
      { label: 'English', srclang: 'en', src: './assets/subtitles/tears-en.vtt', default: true }
    ],
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
    subtitles: [
      { label: 'English', srclang: 'en', src: './assets/subtitles/sintel-en.vtt', default: true }
    ],
    trailerUrl: 'https://www.youtube-nocookie.com/embed/eRsGyueVLvQ'
  },
  'cosmos-laundromat': {
    type: 'embed',
    url: 'https://www.youtube-nocookie.com/embed/Y-rmzh0PI3c',
    subtitles: [],
    trailerUrl: 'https://www.youtube-nocookie.com/embed/Y-rmzh0PI3c'
  },
  'elephants-dream': {
    type: 'direct',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    subtitles: [],
    trailerUrl: 'https://www.youtube-nocookie.com/embed/TLkA0RELQ1g'
  },
  'caminandes-llamigos': {
    type: 'embed',
    url: 'https://www.youtube-nocookie.com/embed/SkVqJ1SGeL0',
    subtitles: [],
    trailerUrl: 'https://www.youtube-nocookie.com/embed/SkVqJ1SGeL0'
  }
};

class VideoProvider {
  /**
   * Get video stream schema for a given movie ID
   */
  async getPlaybackSource(movieId) {
    if (VIDEO_SOURCES[movieId]) {
      return VIDEO_SOURCES[movieId];
    }
    
    // Default fallback stream if specific ID is not mapped
    return {
      type: 'direct',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      subtitles: [],
      trailerUrl: 'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ'
    };
  }
}

module.exports = new VideoProvider();
module.exports.VIDEO_SOURCES = VIDEO_SOURCES;
