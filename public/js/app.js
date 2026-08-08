/**
 * app.js - Home Page Controller
 * Handles hero banner initialization, movie row rendering,
 * watchlist sync, continue watching progress, and carousel scrolling.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const provider = window.CineStream.MovieProvider;
  const storage = window.CineStream.Storage;

  // Header scroll effect
  const siteHeader = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  });

  // Load Home Data
  await initHero(provider, storage);
  await initRows(provider);
  renderContinueWatching(storage);
  renderWatchlist(storage);

  // Carousel Buttons Listener
  setupCarouselControls('trendingPrev', 'trendingNext', 'trendingGrid');
  setupCarouselControls('popularPrev', 'popularNext', 'popularGrid');

  // Watchlist & Progress Updates Listeners
  window.addEventListener('cinestream:watchlist-updated', () => {
    renderWatchlist(storage);
    updateHeroWatchlistBtnState(storage);
  });

  window.addEventListener('cinestream:progress-updated', () => {
    renderContinueWatching(storage);
  });
});

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

    if (watchBtn) watchBtn.href = `./watch.html?id=${encodeURIComponent(hero.id)}`;
    if (infoBtn) infoBtn.href = `./movie.html?id=${encodeURIComponent(hero.id)}`;

    if (watchlistBtn) {
      watchlistBtn.onclick = () => {
        storage.toggleWatchlist(hero);
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
    watchlistBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
    watchlistBtn.style.color = 'var(--accent-pink)';
  } else {
    watchlistBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
    watchlistBtn.style.color = '#ffffff';
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
    <div class="movie-card progress-card" onclick="window.location.href='./watch.html?id=${encodeURIComponent(item.id)}'">
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
    </div>
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
      <div style="padding: 24px; color: var(--text-muted); text-align: center; width: 100%;">
        <i class="fa-solid fa-bookmark" style="font-size: 1.8rem; margin-bottom: 8px; opacity: 0.5;"></i>
        <p>Your watchlist is currently empty. Click <strong>+ Watchlist</strong> on any movie to save it here!</p>
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
  return `
    <div class="movie-card" onclick="window.location.href='./movie.html?id=${encodeURIComponent(m.id)}'">
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
    </div>
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
