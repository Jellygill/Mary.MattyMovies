document.addEventListener('DOMContentLoaded', async () => {
  const provider = window.CineStream.MovieProvider;
  const storage = window.CineStream.Storage;
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get('id') || 'tears-of-steel';
  const mediaType = params.get('type') || null;
  let season = Math.max(1, Number(params.get('season')) || 1);
  let episode = Math.max(1, Number(params.get('episode')) || 1);
  let serverIndex = Math.max(0, Number(params.get('server')) || 0);
  const player = document.getElementById('playerContainer');
  const video = document.getElementById('mainVideoPlayer');
  const iframe = document.getElementById('mainIframePlayer');
  const controls = document.getElementById('playerControls');
  const episodesButton = document.getElementById('openEpisodesBtn');
  const serversButton = document.getElementById('openServersBtn');
  const episodeDrawer = document.getElementById('episodeDrawer');
  const serverMenu = document.getElementById('serverMenu');
  const scrim = document.getElementById('playerMenuScrim');
  let watchData;
  let seasonData;
  let servers = [];

  const escapeHTML = (value) => {
    const element = document.createElement('div');
    element.textContent = value || '';
    return element.innerHTML;
  };

  const closeMenus = () => {
    [episodeDrawer, serverMenu].forEach((menu) => { menu.hidden = true; menu.classList.remove('is-open'); });
    scrim.hidden = true;
    episodesButton.setAttribute('aria-expanded', 'false');
    serversButton.setAttribute('aria-expanded', 'false');
  };
  const openMenu = (menu, button) => {
    closeMenus();
    menu.hidden = false;
    scrim.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    button.setAttribute('aria-expanded', 'true');
    player.classList.add('controls-visible');
  };
  const persistState = () => {
    const next = new URL(window.location.href);
    next.searchParams.set('id', movieId);
    next.searchParams.set('type', watchData.mediaType || mediaType || 'movie');
    next.searchParams.set('server', serverIndex);
    if (watchData.mediaType === 'tv') {
      next.searchParams.set('season', season);
      next.searchParams.set('episode', episode);
    }
    history.replaceState({}, '', next);
  };
  const updateEmbed = () => {
    const server = servers[serverIndex] || servers[0];
    if (!server) return;
    iframe.src = watchData.mediaType === 'tv'
      ? server.getTvUrl(watchData.id, season, episode, watchData.imdbId)
      : server.getMovieUrl(watchData.id, watchData.imdbId);
    persistState();
  };
  const renderServers = () => {
    const list = document.getElementById('serverBtnList');
    list.innerHTML = servers.map((server, index) => `
      <button class="player-server-option ${index === serverIndex ? 'is-selected' : ''}" type="button" data-server="${index}">
        <i class="fa-solid fa-${index === serverIndex ? 'circle-check' : 'server'}"></i><span>${escapeHTML(server.name)}</span>
      </button>`).join('');
    list.querySelectorAll('[data-server]').forEach((button) => button.onclick = () => {
      serverIndex = Number(button.dataset.server);
      renderServers();
      updateEmbed();
      closeMenus();
    });
  };
  const renderEpisodes = () => {
    document.getElementById('drawerShowTitle').textContent = watchData.title;
    document.getElementById('drawerSeasonLabel').textContent = seasonData.name || `Season ${season}`;
    const list = document.getElementById('drawerEpisodeList');
    list.innerHTML = seasonData.episodes.map((item) => `
      <button class="player-episode-option ${item.number === episode ? 'is-selected' : ''}" type="button" data-episode="${item.number}">
        ${item.image ? `<img src="${item.image}" alt="">` : '<span class="player-episode-placeholder"><i class="fa-solid fa-film"></i></span>'}
        <span><small>Episode ${item.number}</small><strong>${escapeHTML(item.title)}</strong></span>
        ${item.number === episode ? '<i class="fa-solid fa-play"></i>' : ''}
      </button>`).join('');
    list.querySelectorAll('[data-episode]').forEach((button) => button.onclick = () => {
      episode = Number(button.dataset.episode);
      renderEpisodes();
      updateEmbed();
      closeMenus();
    });
  };

  try {
    const streamUrl = params.get('streamUrl');
    const subUrl = params.get('subUrl');

    watchData = await provider.getWatchDetails(movieId, mediaType);
    if (!watchData) return;

    if (streamUrl) {
      watchData.playback = {
        type: 'direct',
        url: streamUrl,
        subtitles: subUrl ? [{ label: 'English', srclang: 'en', src: subUrl, default: true }] : []
      };
    }

    document.getElementById('playerTitle').textContent = `${watchData.title} (${watchData.year})`;
    document.title = `Watching ${watchData.title} - Mary.MattyMovies`;
    if (watchData.playback?.type === 'embed') {
      iframe.style.display = 'block';
      video.style.display = 'none';
      controls.style.display = 'none';
      servers = window.CineStream.VideoClientProvider.EMBED_SERVERS;
      serverIndex = Math.min(serverIndex, Math.max(0, servers.length - 1));
      serversButton.hidden = servers.length === 0;
      renderServers();
      if (watchData.mediaType === 'tv') {
        seasonData = await provider.getTvSeasonEpisodes(movieId, season);
        if (!seasonData.episodes.some((item) => item.number === episode)) episode = seasonData.episodes[0]?.number || 1;
        episodesButton.hidden = false;
        renderEpisodes();
      }
      updateEmbed();
    } else {
      video.style.display = 'block';
      controls.style.display = 'flex';
      iframe.style.display = 'none';
      setupDirectVideoPlayer(video, watchData.playback || {}, watchData, storage, player);
    }
  } catch (error) {
    console.error('Failed to initialize video player', error);
  }

  episodesButton.onclick = () => openMenu(episodeDrawer, episodesButton);
  serversButton.onclick = () => openMenu(serverMenu, serversButton);
  scrim.onclick = closeMenus;
  document.querySelectorAll('[data-close-menu]').forEach((button) => button.onclick = closeMenus);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenus(); });
});

function setupDirectVideoPlayer(video, playback, watchData, storage, player) {
  const $ = (id) => document.getElementById(id);
  const playPause = $('playPauseBtn');
  const skipBack = $('skipBackBtn');
  const skipForward = $('skipForwardBtn');
  const mute = $('muteBtn');
  const volume = $('volumeSlider');
  const seekbar = $('seekbarWrapper');
  const fill = $('seekbarFill');
  const time = $('timeDisplay');
  const speed = $('speedSelect');
  const subtitles = $('subtitleSelect');
  const audioGroup = $('audioGroup');
  const audioSelect = $('audioSelect');
  const pip = $('pipBtn');
  const fullscreen = $('fullscreenBtn');
  let hlsInstance = null;

  const isHls = playback.url && playback.url.includes('.m3u8');

  if (isHls && window.Hls && window.Hls.isSupported()) {
    hlsInstance = new window.Hls();
    hlsInstance.loadSource(playback.url);
    hlsInstance.attachMedia(video);

    // Audio tracks management
    hlsInstance.on(window.Hls.Events.AUDIO_TRACKS_UPDATED, (event, data) => {
      if (data.audioTracks && data.audioTracks.length > 1) {
        audioGroup.style.display = 'flex';
        audioSelect.innerHTML = data.audioTracks.map((track, i) =>
          `<option value="${i}" ${i === hlsInstance.audioTrack ? 'selected' : ''}>${track.name || track.lang || `Track ${i + 1}`}</option>`
        ).join('');
      }
    });

    audioSelect.onchange = (e) => {
      if (hlsInstance) {
        hlsInstance.audioTrack = Number(e.target.value);
      }
    };

    // HLS subtitles management
    hlsInstance.on(window.Hls.Events.SUBTITLE_TRACKS_UPDATED, (event, data) => {
      if (data.subtitleTracks && data.subtitleTracks.length > 0) {
        subtitles.innerHTML = '<option value="off">Subtitles Off</option>' +
          data.subtitleTracks.map((track, i) => `<option value="${i}">${track.name || track.lang || `Subtitle ${i + 1}`}</option>`).join('');
      }
    });

    subtitles.onchange = (e) => {
      if (hlsInstance) {
        hlsInstance.subtitleTrack = e.target.value === 'off' ? -1 : Number(e.target.value);
      }
    };
  } else {
    video.src = playback.url;
  }

  // Native HTML5 subtitle tracks
  (playback.subtitles || []).forEach((sub, index) => {
    const track = document.createElement('track');
    Object.assign(track, { kind: 'subtitles', label: sub.label, srclang: sub.srclang, src: sub.src, default: Boolean(sub.default) });
    video.appendChild(track);
    subtitles.insertAdjacentHTML('beforeend', `<option value="${index}" ${sub.default ? 'selected' : ''}>${sub.label}</option>`);
  });

  if (!isHls) {
    subtitles.onchange = (event) => [...video.textTracks].forEach((track, index) => {
      track.mode = event.target.value !== 'off' && Number(event.target.value) === index ? 'showing' : 'hidden';
    });
  }

  const saved = storage.getProgress(watchData.id);
  if (saved?.currentTime > 5) video.currentTime = saved.currentTime;
  const togglePlay = () => video.paused ? video.play() : video.pause();
  const updateVolume = () => {
    mute.innerHTML = `<i class="fa-solid fa-volume-${video.muted || video.volume === 0 ? 'xmark' : video.volume < .5 ? 'low' : 'high'}"></i>`;
    volume.value = video.muted ? 0 : video.volume;
  };
  playPause.onclick = togglePlay;
  video.onclick = togglePlay;
  video.onplay = () => { playPause.innerHTML = '<i class="fa-solid fa-pause"></i>'; };
  video.onpause = () => { playPause.innerHTML = '<i class="fa-solid fa-play"></i>'; };
  video.ontimeupdate = () => {
    if (!video.duration) return;
    fill.style.width = `${video.currentTime / video.duration * 100}%`;
    time.textContent = `${storage.formatTime(video.currentTime)} / ${storage.formatTime(video.duration)}`;
  };
  let lastSaved = 0;
  video.addEventListener('timeupdate', () => {
    if (Date.now() - lastSaved > 5000) {
      lastSaved = Date.now();
      storage.saveProgress(watchData.id, watchData, video.currentTime, video.duration);
    }
  });
  seekbar.onclick = (event) => { const rect = seekbar.getBoundingClientRect(); video.currentTime = (event.clientX - rect.left) / rect.width * video.duration; };
  skipBack.onclick = () => { video.currentTime = Math.max(0, video.currentTime - 5); };
  skipForward.onclick = () => { video.currentTime = Math.min(video.duration, video.currentTime + 5); };
  volume.oninput = (event) => { video.volume = Number(event.target.value); video.muted = video.volume === 0; updateVolume(); };
  mute.onclick = () => { video.muted = !video.muted; updateVolume(); };
  speed.onchange = (event) => { video.playbackRate = Number(event.target.value); };
  if (pip && document.pictureInPictureEnabled) pip.onclick = () => document.pictureInPictureElement ? document.exitPictureInPicture() : video.requestPictureInPicture();
  fullscreen.onclick = () => document.fullscreenElement ? document.exitFullscreen() : player.requestFullscreen();
  let idleTimer;
  const resetIdleTimer = () => {
    player.classList.add('controls-visible');
    clearTimeout(idleTimer);
    if (!video.paused) idleTimer = setTimeout(() => player.classList.remove('controls-visible'), 3500);
  };
  player.onmousemove = resetIdleTimer;
  document.addEventListener('keydown', (event) => {
    if (['INPUT', 'SELECT'].includes(document.activeElement.tagName)) return;
    const action = { ' ': togglePlay, k: togglePlay, f: () => fullscreen.click(), m: () => mute.click(), ArrowLeft: () => skipBack.click(), ArrowRight: () => skipForward.click() }[event.key];
    if (action) { event.preventDefault(); action(); resetIdleTimer(); }
  });
  resetIdleTimer();
  video.play().catch(() => {});
}
