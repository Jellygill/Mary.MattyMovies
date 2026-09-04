/**
 * search.js - Live Search Controller
 * Handles search modal open/close, debounced queries, and result rendering.
 */

document.addEventListener('DOMContentLoaded', () => {
  const provider = window.CineStream.MovieProvider;

  const searchModal = document.getElementById('searchModal');
  const searchInput = document.getElementById('searchInput');
  const searchResultsContainer = document.getElementById('searchResultsContainer');
  const openSearchBtn = document.getElementById('openSearchBtn');
  const closeSearchBtn = document.getElementById('closeSearchBtn');

  if (!searchModal || !searchInput) return;

  // Open Modal
  function openSearch() {
    searchModal.classList.add('open');
    searchInput.value = '';
    searchResultsContainer.innerHTML = '';
    setTimeout(() => searchInput.focus(), 100);
  }

  // Close Modal
  function closeSearch() {
    searchModal.classList.remove('open');
  }

  if (openSearchBtn) openSearchBtn.onclick = openSearch;
  if (closeSearchBtn) closeSearchBtn.onclick = closeSearch;

  // Keyboard Shortcuts: '/' or Ctrl+K opens search; Escape closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchModal.classList.contains('open')) {
      closeSearch();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSearch();
    }
  });

  // Debounced Search Input Handler
  let debounceTimeout = null;
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    clearTimeout(debounceTimeout);

    if (!query) {
      searchResultsContainer.innerHTML = '';
      return;
    }

    searchResultsContainer.innerHTML = '<div style="color: var(--text-muted); padding: 16px; text-align: center;">Searching...</div>';

    debounceTimeout = setTimeout(async () => {
      try {
        const results = await provider.search(query);
        renderSearchResults(results, query);
      } catch (err) {
        console.error('Search error', err);
        searchResultsContainer.innerHTML = '<div style="color: var(--accent-red); padding: 16px; text-align: center;">Failed to perform search.</div>';
      }
    }, 300);
  });

  function renderSearchResults(results, query) {
    if (!results || results.length === 0) {
      searchResultsContainer.innerHTML = `
        <div style="color: var(--text-muted); padding: 24px; text-align: center;">
          No movies found matching "<strong>${escapeHTML(query)}</strong>".
        </div>
      `;
      return;
    }

    searchResultsContainer.innerHTML = results.map(item => `
      <a class="search-result-item" href="./movie.html?id=${encodeURIComponent(item.id)}&type=${item.mediaType || 'movie'}" aria-label="View ${escapeHTML(item.title)}">
        <img class="search-result-thumb" src="${item.poster}" alt="${escapeHTML(item.title)}">
        <div class="search-result-info">
          <div class="search-result-title">${escapeHTML(item.title)}</div>
          <div class="search-result-meta">
            <span class="genre-tag" style="padding: 2px 6px; font-size: 0.7rem; background: var(--accent-pink); color: #fff; border-radius: 4px; font-weight: 700;">${item.mediaType === 'tv' ? 'TV Show' : 'Movie'}</span> •
            <span><i class="fa-solid fa-star" style="color: #ffc107;"></i> ${item.rating}</span> •
            <span>${item.year}</span> •
            <span>${item.genres ? item.genres.slice(0, 2).join(', ') : ''}</span>
          </div>
        </div>
      </a>
    `).join('');
  }

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }
});
