/**
 * player.js - Video Player Controller
 * Handles direct HTML5 video playback with custom UI controls,
 * iframe embed fallback with server switcher and TV episode selector.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const provider = window.CineStream.MovieProvider;
  const storage = window.CineStream.Storage;

  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get('id') || 'tears-of-steel';
  const mediaType = urlParams.get('type') || null;

  const playerContainer = document.getElementById('playerContainer');
  const video = document.getElementById('mainVideoPlayer');
  const iframe = document.getElementById('mainIframePlayer');
  const playerTitle = document.getElementById('playerTitle');
  const playerControls = document.getElementById('playerControls');
  
  const playPauseBtn = document.getElementById('playPauseBtn');
  const skipBackBtn = document.getElementById('skipBackBtn');
  const skipForwardBtn = document.getElementById('skipForwardBtn');
  const muteBtn = document.getElementById('muteBtn');
  const volumeSlider = document.getElementById('volumeSlider');
  const seekbarWrapper = document.getElementById('seekbarWrapper');
  const seekbarFill = document.getElementById('seekbarFill');
  const timeDisplay = document.getElementById('timeDisplay');
  const speedSelect = document.getElementById('speedSelect');
  const subtitleSelect = document.getElementById('subtitleSelect');
  const pipBtn = document.getElementById('pipBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');

  let currentSeason = 1;
  let currentEpisode = 1;
  let currentServerIndex = 0;

  try {
    const watchData = await provider.getWatchDetails(movieId, mediaType);
    if (!watchData) return;

    playerTitle.textContent = `${watchData.title} (${watchData.year})`;
    document.title = `Watching ${watchData.title} - Mary.MattyMovies`;

    const playback = watchData.playback || {};

    if (playback.type === 'embed') {
      // Authorized Iframe Embed Mode
      iframe.style.display = 'block';
      iframe.src = playback.url;
      video.style.display = 'none';
      playerControls.style.display = 'none';

      setupServerSelector(iframe, playback.servers, watchData);
      setupEpisodeSelector(iframe, watchData);
    } else {
      // Direct HTML5 Video Player Mode
      video.style.display = 'block';
      playerControls.style.display = 'flex';
      iframe.style.display = 'none';

      setupDirectVideoPlayer(video, playback, watchData, storage);
    }
  } catch (err) {
    console.error('Failed to initialize video player', err);
  }

  function setupServerSelector(iframe, servers, watchData) {
    const serverBar = document.getElementById('serverSelectorBar');
    const serverList = document.getElementById('serverBtnList');
    if (!serverBar || !serverList || !servers || servers.length === 0) return;

    serverBar.style.display = 'flex';
    serverList.innerHTML = servers.map((srv, idx) => `
      <button class="server-btn ${idx === 0 ? 'active' : ''}" data-index="${idx}">
        <i class="fa-solid fa-play"></i> ${srv.name}
      </button>
    `).join('');

    const buttons = serverList.querySelectorAll('.server-btn');
    buttons.forEach(btn => {
      btn.onclick = () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentServerIndex = parseInt(btn.getAttribute('data-index'), 10);
        updateStreamUrl(iframe, watchData);
      };
    });
  }

  function setupEpisodeSelector(iframe, watchData) {
    const epBar = document.getElementById('tvEpisodeSelectorBar');
    const epList = document.getElementById('episodeBtnList');
    if (!epBar || !epList || watchData.mediaType !== 'tv') return;

    epBar.style.display = 'flex';
    const totalEps = 16;
    epList.innerHTML = Array.from({ length: totalEps }, (_, i) => i + 1).map(epNum => `
      <button class="episode-btn ${epNum === 1 ? 'active' : ''}" data-ep="${epNum}">
        Ep ${epNum}
      </button>
    `).join('');

    const epButtons = epList.querySelectorAll('.episode-btn');
    epButtons.forEach(btn => {
      btn.onclick = () => {
        epButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentEpisode = parseInt(btn.getAttribute('data-ep'), 10);
        updateStreamUrl(iframe, watchData);
      };
    });
  }

  function updateStreamUrl(iframe, watchData) {
    const servers = window.CineStream.VideoClientProvider.EMBED_SERVERS;
    const srv = servers[currentServerIndex] || servers[0];
    const isTV = watchData.mediaType === 'tv';
    const newUrl = isTV
      ? srv.getTvUrl(watchData.id, currentSeason, currentEpisode, watchData.imdbId)
      : srv.getMovieUrl(watchData.id, watchData.imdbId);
    iframe.src = newUrl;
  }

  function setupDirectVideoPlayer(video, playback, watchData, storage) {
    video.src = playback.url;

    // Attach Subtitle Tracks
    if (playback.subtitles && playback.subtitles.length > 0) {
      subtitleSelect.innerHTML = '<option value="off">Subtitles Off</option>';
      playback.subtitles.forEach((sub, idx) => {
        const track = document.createElement('track');
        track.kind = 'subtitles';
        track.label = sub.label;
        track.srclang = sub.srclang;
        track.src = sub.src;
        if (sub.default) track.default = true;
        video.appendChild(track);

        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = sub.label;
        if (sub.default) opt.selected = true;
        subtitleSelect.appendChild(opt);
      });
    }

    // Auto-Resume Progress Check
    const savedProgress = storage.getProgress(watchData.id);
    if (savedProgress && savedProgress.currentTime > 5) {
      video.currentTime = savedProgress.currentTime;
    }

    // Play / Pause Toggle
    function togglePlay() {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }

    playPauseBtn.onclick = togglePlay;
    video.onclick = togglePlay;

    video.addEventListener('play', () => {
      playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    });

    video.addEventListener('pause', () => {
      playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    });

    // Time Update & Seek Bar Fill
    video.addEventListener('timeupdate', () => {
      if (!video.duration) return;
      const pct = (video.currentTime / video.duration) * 100;
      seekbarFill.style.width = `${pct}%`;
      timeDisplay.textContent = `${storage.formatTime(video.currentTime)} / ${storage.formatTime(video.duration)}`;
    });

    // Save Progress every 5 seconds
    let lastSave = 0;
    video.addEventListener('timeupdate', () => {
      const now = Date.now();
      if (now - lastSave > 5000) {
        lastSave = now;
        storage.saveProgress(watchData.id, watchData, video.currentTime, video.duration);
      }
    });

    // Seekbar Interaction
    seekbarWrapper.onclick = (e) => {
      const rect = seekbarWrapper.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = clickX / rect.width;
      video.currentTime = pct * video.duration;
    };

    // Rewind / Fast-Forward 5s
    skipBackBtn.onclick = () => { video.currentTime = Math.max(0, video.currentTime - 5); };
    skipForwardBtn.onclick = () => { video.currentTime = Math.min(video.duration, video.currentTime + 5); };

    // Volume & Mute Controls
    volumeSlider.oninput = (e) => {
      video.volume = parseFloat(e.target.value);
      video.muted = (video.volume === 0);
      updateVolumeIcon();
    };

    muteBtn.onclick = () => {
      video.muted = !video.muted;
      updateVolumeIcon();
    };

    function updateVolumeIcon() {
      if (video.muted || video.volume === 0) {
        muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        volumeSlider.value = 0;
      } else if (video.volume < 0.5) {
        muteBtn.innerHTML = '<i class="fa-solid fa-volume-low"></i>';
        volumeSlider.value = video.volume;
      } else {
        muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        volumeSlider.value = video.volume;
      }
    }

    // Playback Speed Selector
    speedSelect.onchange = (e) => {
      video.playbackRate = parseFloat(e.target.value);
    };

    // Subtitle Track Selector
    subtitleSelect.onchange = (e) => {
      const val = e.target.value;
      for (let i = 0; i < video.textTracks.length; i++) {
        video.textTracks[i].mode = (val !== 'off' && parseInt(val, 10) === i) ? 'showing' : 'hidden';
      }
    };

    // Picture in Picture
    if (pipBtn && document.pictureInPictureEnabled) {
      pipBtn.onclick = async () => {
        try {
          if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
          } else {
            await video.requestPictureInPicture();
          }
        } catch (e) {
          console.error('PiP failed', e);
        }
      };
    }

    // Fullscreen Toggle
    fullscreenBtn.onclick = () => {
      if (!document.fullscreenElement) {
        playerContainer.requestFullscreen().catch(err => console.error(err));
      } else {
        document.exitFullscreen();
      }
    };

    // Auto-hide controls overlay on idle
    let idleTimeout = null;
    function resetIdleTimer() {
      playerContainer.classList.add('controls-visible');
      clearTimeout(idleTimeout);
      if (!video.paused) {
        idleTimeout = setTimeout(() => {
          playerContainer.classList.remove('controls-visible');
        }, 3500);
      }
    }
    playerContainer.onmousemove = resetIdleTimer;
    resetIdleTimer();

    // Hotkey Controls
    document.addEventListener('keydown', (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT') return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          resetIdleTimer();
          break;
        case 'f':
          e.preventDefault();
          fullscreenBtn.click();
          break;
        case 'm':
          e.preventDefault();
          muteBtn.click();
          resetIdleTimer();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackBtn.click();
          resetIdleTimer();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForwardBtn.click();
          resetIdleTimer();
          break;
        case 'ArrowUp':
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          volumeSlider.value = video.volume;
          updateVolumeIcon();
          resetIdleTimer();
          break;
        case 'ArrowDown':
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          volumeSlider.value = video.volume;
          updateVolumeIcon();
          resetIdleTimer();
          break;
      }
    });

    // Auto-start video when loaded
    video.play().catch(() => {
      // Autoplay blocked by browser policy; user can click play
    });
  }
});
