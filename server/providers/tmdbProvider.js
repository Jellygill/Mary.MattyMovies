/**
 * tmdbProvider.js - Movie Metadata Provider
 * Supports TMDB API fetching when TMDB_API_KEY is configured,
 * with a fallback catalog of high-definition open films.
 */

const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Rich fallback catalog of legal open films with posters, backdrops, and details
const FALLBACK_CATALOG = [
  {
    id: 'tears-of-steel',
    title: 'Tears of Steel',
    originalTitle: 'Tears of Steel',
    year: 2012,
    rating: 7.8,
    voteCount: 1420,
    runtime: '12 min',
    genres: ['Sci-Fi', 'Action', 'Cyberpunk'],
    director: 'Ian Hubert',
    cast: ['Derek de Lint', 'Sergio Hasselbaink', 'Rogier Schippers', 'Denise Rebergen'],
    tagline: 'Explore a dystopian future where passion and tech collide.',
    description: 'In a dystopian future in Amsterdam, a group of warriors and scientists gather at the Oude Kerk to stage a crucial desperate intervention to save the world from destructive robotic machines.',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1920&auto=format&fit=crop',
    isFeatured: true,
    isTrending: true,
    isPopular: true
  },
  {
    id: 'big-buck-bunny',
    title: 'Big Buck Bunny',
    originalTitle: 'Big Buck Bunny',
    year: 2008,
    rating: 8.4,
    voteCount: 3200,
    runtime: '10 min',
    genres: ['Animation', 'Comedy', 'Family'],
    director: 'Sacha Goedegebure',
    cast: ['Bunny', 'Frank the Chinchilla', 'Rinky the Squirrel', 'Gimera the Flying Squirrel'],
    tagline: 'A giant rabbit with a heart of gold... until pushed too far.',
    description: 'A large and lovable rabbit deals with three bullying rodents in a lush forest who enjoy harassing helpless forest creatures. When they cross the line, Big Buck Bunny plans an epic comedic payback.',
    poster: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop',
    isFeatured: false,
    isTrending: true,
    isPopular: true
  },
  {
    id: 'sintel',
    title: 'Sintel',
    originalTitle: 'Sintel',
    year: 2010,
    rating: 8.1,
    voteCount: 2890,
    runtime: '15 min',
    genres: ['Fantasy', 'Adventure', 'Animation'],
    director: 'Colin Levy',
    cast: ['Halina Reijn', 'Thom Hoffman'],
    tagline: 'Her search will lead her across the world and beyond.',
    description: 'A lonely young woman named Sintel rescues a wounded baby dragon and names him Scales. When a ferocious adult dragon snatches Scales away, Sintel embarks on a dangerous quest across icy mountains and harsh deserts to rescue her friend.',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1920&auto=format&fit=crop',
    isFeatured: false,
    isTrending: true,
    isPopular: true
  },
  {
    id: 'cosmos-laundromat',
    title: 'Cosmos Laundromat',
    originalTitle: 'Cosmos Laundromat: First Cycle',
    year: 2015,
    rating: 8.6,
    voteCount: 1950,
    runtime: '12 min',
    genres: ['Sci-Fi', 'Mystery', 'Animation'],
    director: 'Mathieu Auvray',
    cast: ['Pierre Bokma', 'Reinout Scholten van Aschat'],
    tagline: 'On a desolate island, a suicidal sheep meets a quirky salesman.',
    description: 'On a desolate island, a depressed sheep named Franck meets Victor, a eccentric salesman who offers him the deal of a lifetime: a journey through cosmic washing machines to experience different lives.',
    poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1920&auto=format&fit=crop',
    isFeatured: false,
    isTrending: false,
    isPopular: true
  },
  {
    id: 'elephants-dream',
    title: 'Elephants Dream',
    originalTitle: 'Elephants Dream',
    year: 2006,
    rating: 7.2,
    voteCount: 1100,
    runtime: '11 min',
    genres: ['Surreal', 'Sci-Fi', 'Animation'],
    director: 'Bassam Kurdali',
    cast: ['Tygo Gernandt', 'Cas Jansen'],
    tagline: 'Inside the vast, organic machine of human perception.',
    description: 'Two friends, Proog and Emo, explore a strange surreal machine world called the Machine, where Proog acts as an eccentric guide while Emo begins to question the dangerous reality around them.',
    poster: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?q=80&w=800&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop',
    isFeatured: false,
    isTrending: false,
    isPopular: false
  },
  {
    id: 'caminandes-llamigos',
    title: 'Caminandes 3: Llamigos',
    originalTitle: 'Caminandes 3: Llamigos',
    year: 2016,
    rating: 8.3,
    voteCount: 1580,
    runtime: '3 min',
    genres: ['Comedy', 'Animation', 'Short'],
    director: 'Pablo Vazquez',
    cast: ['Kero the Llama', 'Tito the Armadillo'],
    tagline: 'High altitude laughs in Patagonia!',
    description: 'Kero the llama encounters Tito the armadillo while trying to eat a delicious berry patch across a precarious fence in the breathtaking wild landscapes of Patagonia.',
    poster: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1920&auto=format&fit=crop',
    isFeatured: false,
    isTrending: true,
    isPopular: false
  }
];

class TMDBProvider {
  /**
   * Get list of featured movies
   */
  async getFeaturedMovies() {
    if (TMDB_API_KEY) {
      try {
        const res = await fetch(`${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          return data.results.slice(0, 5).map(m => this._formatTMDBMovie(m));
        }
      } catch (e) {
        console.warn('TMDB API fetch failed, falling back to local dataset', e.message);
      }
    }
    return FALLBACK_CATALOG.filter(m => m.isFeatured || m.rating >= 8.0);
  }

  /**
   * Get list of trending movies
   */
  async getTrendingMovies() {
    if (TMDB_API_KEY) {
      try {
        const res = await fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`);
        const data = await res.json();
        if (data.results) {
          return data.results.map(m => this._formatTMDBMovie(m));
        }
      } catch (e) {
        console.warn('TMDB API fetch failed', e.message);
      }
    }
    return FALLBACK_CATALOG.filter(m => m.isTrending || m.rating >= 7.5);
  }

  /**
   * Get popular movies
   */
  async getPopularMovies() {
    if (TMDB_API_KEY) {
      try {
        const res = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`);
        const data = await res.json();
        if (data.results) {
          return data.results.map(m => this._formatTMDBMovie(m));
        }
      } catch (e) {
        console.warn('TMDB API fetch failed', e.message);
      }
    }
    return FALLBACK_CATALOG;
  }

  /**
   * Search movies by query string and optional genre
   */
  async searchMovies(query = '', genre = '') {
    let results = [];
    if (TMDB_API_KEY && query.trim()) {
      try {
        const res = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.results) {
          results = data.results.map(m => this._formatTMDBMovie(m));
        }
      } catch (e) {
        console.warn('TMDB search failed', e.message);
      }
    }
    
    if (results.length === 0) {
      const q = query.toLowerCase().trim();
      results = FALLBACK_CATALOG.filter(m => {
        const matchesQuery = !q || m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.genres.some(g => g.toLowerCase().includes(q));
        const matchesGenre = !genre || m.genres.some(g => g.toLowerCase() === genre.toLowerCase());
        return matchesQuery && matchesGenre;
      });
    }

    return results;
  }

  /**
   * Get movie by ID
   */
  async getMovieById(id) {
    if (TMDB_API_KEY && !isNaN(id)) {
      try {
        const res = await fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}`);
        const data = await res.json();
        if (data && data.id) {
          return this._formatTMDBMovie(data);
        }
      } catch (e) {
        console.warn('TMDB getMovieById failed', e.message);
      }
    }

    const movie = FALLBACK_CATALOG.find(m => String(m.id) === String(id));
    return movie || FALLBACK_CATALOG[0]; // fallback to first movie if not found
  }

  /**
   * Format TMDB API result to normalized object
   */
  _formatTMDBMovie(m) {
    return {
      id: String(m.id),
      title: m.title || m.original_title,
      originalTitle: m.original_title,
      year: m.release_date ? new Date(m.release_date).getFullYear() : 2026,
      rating: m.vote_average ? Number(m.vote_average.toFixed(1)) : 7.5,
      voteCount: m.vote_count || 500,
      runtime: m.runtime ? `${m.runtime} min` : '110 min',
      genres: m.genres ? m.genres.map(g => g.name) : ['Drama', 'Action'],
      director: 'Famous Director',
      cast: ['Lead Actor', 'Supporting Actor'],
      tagline: m.tagline || 'Experience an incredible cinematic journey.',
      description: m.overview || 'No description available for this title.',
      poster: m.poster_path ? `${TMDB_IMAGE_BASE}/w500${m.poster_path}` : FALLBACK_CATALOG[0].poster,
      backdrop: m.backdrop_path ? `${TMDB_IMAGE_BASE}/w1280${m.backdrop_path}` : FALLBACK_CATALOG[0].backdrop,
      isFeatured: false,
      isTrending: true,
      isPopular: true
    };
  }
}

module.exports = new TMDBProvider();
module.exports.FALLBACK_CATALOG = FALLBACK_CATALOG;
