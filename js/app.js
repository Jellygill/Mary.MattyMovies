/**
 * app.js - Home Page Controller
 * Handles hero banner initialization, movie row rendering,
 * watchlist sync, continue watching progress, date night movie spinner,
 * and My Melody floating companion widget.
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

  // Carousel Buttons Listener
  setupCarouselControls('trendingPrev', 'trendingNext', 'trendingGrid');
  setupCarouselControls('popularPrev', 'popularNext', 'popularGrid');

  // Interactive Features
  initDateNightSpinner(provider);
  initMelodyCompanion(provider);

  // Watchlist & Progress Updates Listeners
  window.addEventListener('cinestream:watchlist-updated', (e) => {
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
  } else {
    watchlistBtn.innerHTML = '<i class="fa-solid fa-heart-crack"></i>';
    watchlistBtn.title = 'Add to Our Watchlist 💕';
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

/**
 * Date Night Random Movie Spinner Logic
 */
function initDateNightSpinner(provider) {
  const openBtn = document.getElementById('openSpinnerBtn');
  const closeBtn = document.getElementById('closeSpinnerBtn');
  const spinAgainBtn = document.getElementById('spinAgainBtn');
  const modal = document.getElementById('spinnerModal');
  const wheel = document.getElementById('spinnerWheel');
  const resultTitle = document.getElementById('spinnerResultTitle');
  const resultSub = document.getElementById('spinnerResultSub');
  const watchBtn = document.getElementById('watchSpinResultBtn');

  if (!openBtn || !modal) return;

  const openModalAndSpin = async () => {
    modal.classList.add('open');
    await runSpinnerAnimation(provider);
  };

  openBtn.onclick = openModalAndSpin;
  spinAgainBtn.onclick = () => runSpinnerAnimation(provider);
  closeBtn.onclick = () => modal.classList.remove('open');

  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('open');
  };
}

async function runSpinnerAnimation(provider) {
  const wheel = document.getElementById('spinnerWheel');
  const resultTitle = document.getElementById('spinnerResultTitle');
  const resultSub = document.getElementById('spinnerResultSub');
  const watchBtn = document.getElementById('watchSpinResultBtn');

  if (!wheel || !resultTitle) return;

  // Reset state
  wheel.classList.add('spinning');
  resultTitle.textContent = 'My Melody is picking a movie... 🎀';
  resultSub.textContent = 'Randomizing Mary & Matty\'s date night choice!';
  if (watchBtn) watchBtn.style.display = 'none';

  try {
    const trending = await provider.getTrending();
    const popular = await provider.getPopular();
    const pool = [...trending, ...popular];

    setTimeout(() => {
      wheel.classList.remove('spinning');
      if (pool.length > 0) {
        const picked = pool[Math.floor(Math.random() * pool.length)];
        resultTitle.innerHTML = `<i class="fa-solid fa-heart" style="color: var(--accent-pink);"></i> ${picked.title}`;
        resultSub.textContent = `${picked.year} • Rating ${picked.rating} • Perfect choice for tonight!`;
        if (watchBtn) {
          watchBtn.href = `./watch.html?id=${encodeURIComponent(picked.id)}`;
          watchBtn.style.display = 'inline-flex';
        }
      } else {
        resultTitle.textContent = 'Tears of Steel';
        resultSub.textContent = 'Our featured classic!';
      }
    }, 1200);
  } catch (e) {
    wheel.classList.remove('spinning');
    resultTitle.textContent = 'Ready for Date Night!';
    resultSub.textContent = 'Click below to watch our premiere movie.';
  }
}

/**
 * Interactive My Melody Floating Companion Widget
 */
function initMelodyCompanion(provider) {
  const btn = document.getElementById('melodyBtn');
  const card = document.getElementById('melodyCard');
  const closeBtn = document.getElementById('closeMelodyCard');
  const body = document.getElementById('melodyCardBody');
  const spinAction = document.getElementById('melodySpinActionBtn');

  if (!btn || !card) return;

  const melodyQuotes = [
    `"Ready for movie night, Mary & Matty? Don't forget to grab the popcorn and cozy up together! 🎀🍿"`,
    `"My Melody says: Every date night with you two is full of love and magic! 💕"`,
    `"Can't decide what to watch? Use the Date Night Spinner for a surprise movie! 🎲"`,
    `"Remember to add your favorite movies to Our Watchlist so we never run out of date night ideas! 💖"`
  ];

  let currentQuoteIdx = 0;

  btn.onclick = () => {
    currentQuoteIdx = (currentQuoteIdx + 1) % melodyQuotes.length;
    if (body) body.textContent = melodyQuotes[currentQuoteIdx];
    card.classList.toggle('open');
  };

  if (closeBtn) {
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      card.classList.remove('open');
    };
  }

  if (spinAction) {
    spinAction.onclick = () => {
      card.classList.remove('open');
      const openSpinner = document.getElementById('openSpinnerBtn');
      if (openSpinner) openSpinner.click();
    };
  }
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
