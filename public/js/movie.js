/**
 * movie.js - Movie Details Controller
 * Loads movie details by URL param ?id=..., handles trailer preview,
 * watchlist toggles, and populates similar recommendations.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const provider = window.CineStream.MovieProvider;
  const storage = window.CineStream.Storage;

  // Extract ID & Type from URL
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get('id') || 'tears-of-steel';
  const mediaType = urlParams.get('type') || null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  requestAnimationFrame(() => document.body.classList.add('cinema-ready'));

  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[href]');
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin || !/watch\.html$/.test(destination.pathname)) return;

    event.preventDefault();
    document.body.classList.add('cinema-leaving');
    window.setTimeout(() => { window.location.href = destination.href; }, reduceMotion ? 0 : 220);
  });

  try {
    const movie = await provider.getById(movieId, mediaType);
    const watchDetails = await provider.getWatchDetails(movieId, mediaType);

    renderMovieDetails(movie, watchDetails, storage);
    loadSimilarMovies(provider, movie);
  } catch (err) {
    console.error('Failed to load movie details', err);
  }
});

function renderMovieDetails(movie, watchDetails, storage) {
  document.title = `${movie.title} - Mary.MattyMovies`;

  const hero = document.getElementById('detailsHero');
  const poster = document.getElementById('detailsPoster');
  const title = document.getElementById('detailsTitle');
  const rating = document.getElementById('detailsRating');
  const year = document.getElementById('detailsYear');
  const runtime = document.getElementById('detailsRuntime');
  const genres = document.getElementById('detailsGenres');
  const synopsis = document.getElementById('detailsSynopsis');
  const director = document.getElementById('detailsDirector');
  const cast = document.getElementById('detailsCast');
  const watchBtn = document.getElementById('watchNowBtn');
  const trailerIframe = document.getElementById('trailerIframe');
  const toggleWatchlistBtn = document.getElementById('toggleWatchlistBtn');
  const watchlistBtnLabel = document.getElementById('watchlistBtnLabel');

  if (hero && movie.backdrop) hero.style.backgroundImage = `url('${movie.backdrop}')`;
  if (poster) poster.src = movie.poster;
  if (title) title.textContent = movie.title;
  if (rating) rating.textContent = movie.rating;
  if (year) year.textContent = movie.year;
  if (runtime) runtime.textContent = movie.runtime || '110 min';
  if (synopsis) synopsis.textContent = movie.description;
  if (director) director.textContent = movie.director || 'N/A';
  if (cast) cast.textContent = movie.cast ? movie.cast.join(', ') : 'N/A';

  if (genres && movie.genres) {
    genres.innerHTML = movie.genres.map(g => `<span class="genre-tag">${g}</span>`).join('');
  }

  if (watchBtn) {
    const type = movie.mediaType || 'movie';
    watchBtn.href = `./watch.html?id=${encodeURIComponent(movie.id)}&type=${type}&v=1.0.1`;
  }

  if (trailerIframe && watchDetails.playback && watchDetails.playback.trailerUrl) {
    trailerIframe.src = watchDetails.playback.trailerUrl;
  }

  // Watchlist Toggle Logic
  function updateWatchlistUI() {
    const inList = storage.isInWatchlist(movie.id);
    if (inList) {
      toggleWatchlistBtn.innerHTML = '<i class="fa-solid fa-heart" style="color: var(--accent-pink);"></i> <span>In Our Watchlist 💕</span>';
      toggleWatchlistBtn.style.borderColor = 'var(--accent-pink)';
      toggleWatchlistBtn.style.color = 'var(--accent-pink)';
    } else {
      toggleWatchlistBtn.innerHTML = '<i class="fa-solid fa-plus"></i> <span>Add to Our Watchlist 💕</span>';
      toggleWatchlistBtn.style.borderColor = 'var(--border-subtle)';
      toggleWatchlistBtn.style.color = '#ffffff';
    }
  }

  if (toggleWatchlistBtn) {
    updateWatchlistUI();
    toggleWatchlistBtn.onclick = () => {
      storage.toggleWatchlist(movie);
      updateWatchlistUI();
    };
  }
}

async function loadSimilarMovies(provider, currentMovie) {
  const container = document.getElementById('similarGrid');
  if (!container) return;

  try {
    const popular = await provider.getPopular();
    const filtered = popular.filter(m => String(m.id) !== String(currentMovie.id));

    container.innerHTML = filtered.map(m => {
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
    }).join('');
  } catch (err) {
    console.error('Failed to load similar movies', err);
  }
}
