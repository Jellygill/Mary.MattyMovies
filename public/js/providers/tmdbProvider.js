/**
 * tmdbProvider.js - Client-Side Metadata Provider
 * Provides movie metadata for static browser execution (e.g. GitHub Pages)
 */

window.CineStream = window.CineStream || {};

(function() {
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

  window.CineStream.TMDBClientProvider = {
    async getFeaturedMovies() {
      return FALLBACK_CATALOG.filter(m => m.isFeatured || m.rating >= 8.0);
    },
    async getTrendingMovies() {
      return FALLBACK_CATALOG.filter(m => m.isTrending || m.rating >= 7.5);
    },
    async getPopularMovies() {
      return FALLBACK_CATALOG;
    },
    async searchMovies(query = '', genre = '') {
      const q = query.toLowerCase().trim();
      return FALLBACK_CATALOG.filter(m => {
        const matchesQuery = !q || m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.genres.some(g => g.toLowerCase().includes(q));
        const matchesGenre = !genre || m.genres.some(g => g.toLowerCase() === genre.toLowerCase());
        return matchesQuery && matchesGenre;
      });
    },
    async getMovieById(id) {
      const found = FALLBACK_CATALOG.find(m => String(m.id) === String(id));
      return found || FALLBACK_CATALOG[0];
    },
    getAllMovies() {
      return FALLBACK_CATALOG;
    }
  };
})();
