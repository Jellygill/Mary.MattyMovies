document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const type = params.get('type');
  const season = Math.max(1, Number(params.get('season')) || 1);
  let selectedEpisode = Math.max(1, Number(params.get('episode')) || 1);

  if (!id || type !== 'tv') {
    window.location.replace(`./watch.html?id=${encodeURIComponent(id || 'tears-of-steel')}&type=movie`);
    return;
  }

  const provider = window.CineStream.MovieProvider;
  const selection = document.getElementById('episodeSelection');
  const poster = document.getElementById('episodeShowPoster');
  const title = document.getElementById('episodeShowTitle');
  const meta = document.getElementById('episodeShowMeta');
  const description = document.getElementById('episodeShowDescription');
  const seasonLabel = document.getElementById('episodeSeasonLabel');
  const grid = document.getElementById('episodeGrid');
  const startButton = document.getElementById('startEpisodeBtn');

  try {
    const [show, seasonData] = await Promise.all([
      provider.getById(id, 'tv'),
      provider.getTvSeasonEpisodes(id, season)
    ]);

    selection.style.backgroundImage = `url('${show.backdrop}')`;
    poster.src = show.poster;
    poster.alt = `${show.title} poster`;
    title.textContent = show.title;
    meta.textContent = [show.year, show.runtime, show.rating ? `${show.rating} rating` : ''].filter(Boolean).join('  ·  ');
    description.textContent = show.description || '';
    seasonLabel.textContent = seasonData.name || `Season ${season}`;

    const episodes = seasonData.episodes || [];
    if (!episodes.some((episode) => episode.number === selectedEpisode)) {
      selectedEpisode = episodes[0]?.number || 1;
    }

    const render = () => {
      grid.innerHTML = episodes.map((episode) => `
        <button class="episode-choice ${episode.number === selectedEpisode ? 'is-selected' : ''}" type="button" data-episode="${episode.number}">
          ${episode.image ? `<img src="${episode.image}" alt="">` : '<span class="episode-choice-placeholder"><i class="fa-solid fa-film"></i></span>'}
          <span class="episode-choice-copy">
            <span class="episode-choice-number">Episode ${episode.number}</span>
            <strong>${escapeHTML(episode.title)}</strong>
            ${episode.runtime ? `<small>${escapeHTML(episode.runtime)}</small>` : ''}
          </span>
          <i class="fa-solid fa-play episode-choice-play"></i>
        </button>
      `).join('');

      grid.querySelectorAll('[data-episode]').forEach((button) => {
        button.addEventListener('click', () => {
          selectedEpisode = Number(button.dataset.episode);
          render();
          updateStartButton();
        });
      });
    };

    const updateStartButton = () => {
      startButton.href = `./watch.html?id=${encodeURIComponent(id)}&type=tv&season=${season}&episode=${selectedEpisode}`;
      startButton.querySelector('span').textContent = `Watch Episode ${selectedEpisode}`;
    };

    render();
    updateStartButton();
    startButton.addEventListener('click', (event) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      event.preventDefault();
      document.body.classList.add('episode-selection-leaving');
      window.setTimeout(() => { window.location.href = startButton.href; }, 260);
    });
    requestAnimationFrame(() => document.body.classList.add('episode-selection-ready'));
  } catch (error) {
    console.error('Failed to load episode selection', error);
    title.textContent = 'Unable to load episodes';
    description.textContent = 'Please return to the series page and try again.';
  }
});

function escapeHTML(value) {
  const element = document.createElement('div');
  element.textContent = value || '';
  return element.innerHTML;
}
