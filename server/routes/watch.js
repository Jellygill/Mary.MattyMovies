/**
 * watch.js - Video stream playback endpoint
 */

const express = require('express');
const router = express.Router();
const movieProvider = require('../providers/movieProvider');

// GET /api/watch/:id
router.get('/:id', async (req, res) => {
  try {
    const watchData = await movieProvider.getWatchDetails(req.params.id);
    if (!watchData) {
      return res.status(404).json({ success: false, error: 'Video stream not found' });
    }
    res.json({ success: true, data: watchData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
