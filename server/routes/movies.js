/**
 * movies.js - Movie metadata API endpoints
 */

const express = require('express');
const router = express.Router();
const movieProvider = require('../providers/movieProvider');

// GET /api/movies/featured
router.get('/featured', async (req, res) => {
  try {
    const movies = await movieProvider.getFeatured();
    res.json({ success: true, data: movies });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/movies/trending
router.get('/trending', async (req, res) => {
  try {
    const movies = await movieProvider.getTrending();
    res.json({ success: true, data: movies });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/movies/popular
router.get('/popular', async (req, res) => {
  try {
    const movies = await movieProvider.getPopular();
    res.json({ success: true, data: movies });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/movies/search?q=...&genre=...
router.get('/search', async (req, res) => {
  try {
    const { q, genre } = req.query;
    const movies = await movieProvider.search(q || '', genre || '');
    res.json({ success: true, count: movies.length, data: movies });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/movies/:id
router.get('/:id', async (req, res) => {
  try {
    const movie = await movieProvider.getById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }
    res.json({ success: true, data: movie });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
