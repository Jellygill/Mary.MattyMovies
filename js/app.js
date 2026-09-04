/**
 * app.js - Home Page Controller
 * Handles hero banner initialization, movie row rendering,
 * watchlist sync, and continue watching progress.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const provider = window.CineStream.MovieProvider;
  const storage = window.CineStream.Storage;

  // Header scroll effect
  const siteHeader = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      siteHeader?.classList.add('scrolled');
    } else {
      siteHeader?.classList.remove('scrolled');
    }
  });

  // Load Home Data
  await initHero(provider, storage);
  await initRows(provider);
  renderContinueWatching(storage);
  renderWatchlist(storage);
  initCinematicMotion();

  // Carousel Buttons Listener
  setupCarouselControls('trendingPrev', 'trendingNext', 'trendingGrid');
  setupCarouselControls('popularPrev', 'popularNext', 'popularGrid');

  // Watchlist & Progress Updates Listeners
  window.addEventListener('cinestream:watchlist-updated', (e) => {
    renderWatchlist(storage);
    updateHeroWatchlistBtnState(storage);
  });

  window.addEventListener('cinestream:progress-updated', () => {
    renderContinueWatching(storage);
  });
});

function initCinematicMotion() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.getElementById('heroBanner');

  requestAnimationFrame(() => document.body.classList.add('cinema-ready'));

  if (!reduceMotion && hero) {
    let scheduled = false;
    window.addEventListener('scroll', () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        hero.style.setProperty('--hero-scroll', `${Math.min(window.scrollY * 0.04, 24)}px`);
        scheduled = false;
      });
    }, { passive: true });
  }

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16 });

    document.querySelectorAll('.category-section').forEach((section) => {
      section.classList.add('cinema-reveal');
      observer.observe(section);
    });
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[href]');
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin || !/(movie|watch|episodes)\.html$/.test(destination.pathname)) return;

    event.preventDefault();
    document.body.classList.add('cinema-leaving');
    window.setTimeout(() => { window.location.href = destination.href; }, reduceMotion ? 0 : 220);
  });
}

/**
 * Initialize Hero Banner
 */
async function initHero(provider, storage) {
  try {
    const featuredList = await provider.getFeatured();
    if (!featuredList || featuredList.length === 0) return;

    const hero = featuredList[0];
    const banner = document.getElementById('heroBanner');
    const titleEl = document.getElementById('heroTitle');
    const ratingEl = document.getElementById('heroRating');
    const yearEl = document.getElementById('heroYear');
    const runtimeEl = document.getElementById('heroRuntime');
    const genresEl = document.getElementById('heroGenres');
    const descEl = document.getElementById('heroDescription');
    const watchBtn = document.getElementById('heroWatchBtn');
    const infoBtn = document.getElementById('heroInfoBtn');
    const watchlistBtn = document.getElementById('heroWatchlistBtn');

    if (banner && hero.backdrop) {
      banner.style.backgroundImage = `url('${hero.backdrop}')`;
    }
    if (titleEl) titleEl.textContent = hero.title;
    if (ratingEl) ratingEl.textContent = hero.rating;
    if (yearEl) yearEl.textContent = hero.year;
    if (runtimeEl) runtimeEl.textContent = hero.runtime || '12 min';
    if (descEl) descEl.textContent = hero.description;

    if (genresEl && hero.genres) {
      genresEl.innerHTML = hero.genres.map(g => `<span class="genre-tag">${g}</span>`).join('');
    }

    const type = hero.mediaType || 'movie';
    if (watchBtn) {
      watchBtn.href = type === 'tv'
        ? `./episodes.html?id=${encodeURIComponent(hero.id)}&type=tv`
        : `./watch.html?id=${encodeURIComponent(hero.id)}&type=movie`;
    }
    if (infoBtn) infoBtn.href = `./movie.html?id=${encodeURIComponent(hero.id)}&type=${type}`;

    if (watchlistBtn) {
      watchlistBtn.onclick = () => {
        const added = storage.toggleWatchlist(hero);
        showCoupleToast(added ? `Added "${hero.title}" to Our Watchlist 💕` : `Removed from Our Watchlist 💕`);
      };
      updateHeroWatchlistBtnState(storage, hero.id);
    }
  } catch (e) {
    console.error('Failed to initialize hero', e);
  }
}

function updateHeroWatchlistBtnState(storage, heroId = 'tears-of-steel') {
  const watchlistBtn = document.getElementById('heroWatchlistBtn');
  if (!watchlistBtn) return;
  const inList = storage.isInWatchlist(heroId);
  if (inList) {
    watchlistBtn.innerHTML = '<i class="fa-solid fa-heart" style="color: var(--accent-pink);"></i>';
    watchlistBtn.title = 'In Our Watchlist 💕';
    watchlistBtn.setAttribute('aria-label', 'Remove from Our Watchlist');
  } else {
    watchlistBtn.innerHTML = '<i class="fa-solid fa-heart-crack"></i>';
    watchlistBtn.title = 'Add to Our Watchlist 💕';
    watchlistBtn.setAttribute('aria-label', 'Add to Our Watchlist');
  }
}

/**
 * Initialize Movie Row Grids
 */
async function initRows(provider) {
  try {
    const trending = await provider.getTrending();
    const popular = await provider.getPopular();

    renderMovieRow('trendingGrid', trending);
    renderMovieRow('popularGrid', popular);
  } catch (e) {
    console.error('Failed to load movie rows', e);
  }
}

function renderMovieRow(containerId, movies) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!movies || movies.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); padding: 20px;">No movies found.</p>';
    return;
  }

  container.innerHTML = movies.map(m => createMovieCardHTML(m)).join('');
}

/**
 * Render Continue Watching Row
 */
function renderContinueWatching(storage) {
  const container = document.getElementById('continueWatchingGrid');
  const section = document.getElementById('continue-watching-section');
  if (!container || !section) return;

  const progressData = storage.getAllProgress();
  const items = Object.values(progressData).sort((a, b) => b.updatedAt - a.updatedAt);

  if (items.length === 0) {
    section.style.display = 'none';
    container.innerHTML = '';
    return;
  }

  section.style.display = 'block';
  container.innerHTML = items.map(item => `
    <a class="movie-card progress-card" href="./watch.html?id=${encodeURIComponent(item.id)}">
      <div class="card-poster-wrapper">
        <img class="card-poster" src="${item.backdrop || item.poster}" alt="${item.title}" loading="lazy">
        <div class="card-overlay">
          <div class="card-play-icon"><i class="fa-solid fa-play"></i></div>
        </div>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar-fill" style="width: ${item.percent}%"></div>
      </div>
      <div class="card-info">
        <div class="card-title">${item.title}</div>
        <div class="card-sub">
          <span class="resume-tag"><i class="fa-solid fa-rotate-left"></i> Resume ${storage.formatTime(item.currentTime)}</span>
          <span>${item.percent}%</span>
        </div>
      </div>
    </a>
  `).join('');
}

/**
 * Render Watchlist Row
 */
function renderWatchlist(storage) {
  const container = document.getElementById('watchlistGrid');
  if (!container) return;

  const watchlist = storage.getWatchlist();

  if (watchlist.length === 0) {
    container.innerHTML = `
      <div class="empty-watchlist-box">
        <img src="./assets/images/my melody gif5.gif" alt="My Melody Watchlist" class="empty-watchlist-img" style="width: 130px; height: auto;">
        <p style="font-size: 1.15rem; color: var(--text-primary); font-weight: 700; margin-top: 8px;">Our Watchlist is currently empty 💕</p>
        <p style="color: var(--text-muted); font-size: 0.95rem; max-width: 420px; margin: 0 auto;">
          Click <strong><i class="fa-solid fa-heart" style="color: var(--accent-pink);"></i> Add to Our Watchlist</strong> on any movie to save it for Mary & Matty's next date night!
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = watchlist.map(m => createMovieCardHTML(m)).join('');
}

/**
 * Generate Movie Card HTML string
 */
function createMovieCardHTML(m) {
  const type = m.mediaType || 'movie';
  return `
    <a class="movie-card" href="./movie.html?id=${encodeURIComponent(m.id)}&type=${type}">
      <div class="card-poster-wrapper">
        <img class="card-poster" src="${m.poster}" alt="${m.title}" loading="lazy">
        <div class="card-badge-rating"><i class="fa-solid fa-star"></i> ${m.rating}</div>
        <div class="card-overlay">
          <div class="card-play-icon"><i class="fa-solid fa-play"></i></div>
        </div>
      </div>
      <div class="card-info">
        <div class="card-title">${m.title}</div>
        <div class="card-sub">
          <span>${m.year}</span>
          <span>${m.genres ? m.genres[0] : 'Film'}</span>
        </div>
      </div>
    </a>
  `;
}

/**
 * Setup Horizontal Carousel Controls
 */
function setupCarouselControls(prevBtnId, nextBtnId, containerId) {
  const prev = document.getElementById(prevBtnId);
  const next = document.getElementById(nextBtnId);
  const container = document.getElementById(containerId);

  if (!prev || !next || !container) return;

  prev.onclick = () => {
    container.scrollBy({ left: -460, behavior: 'smooth' });
  };

  next.onclick = () => {
    container.scrollBy({ left: 460, behavior: 'smooth' });
  };
}

/**
 * Toast Notification Popup Helper
 */
function showCoupleToast(message) {
  const toast = document.getElementById('coupleToast');
  const msgEl = document.getElementById('toastMessage');
  if (!toast || !msgEl) return;

  msgEl.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}
