/**
 * server.js - Express server for CineStream
 */

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const moviesRouter = require('./routes/movies');
const watchRouter = require('./routes/watch');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from 'public' directory
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// API Routes
app.use('/api/movies', moviesRouter);
app.use('/api/watch', watchRouter);

// Fallback route serving index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🎬 Mary.MattyMovies Server is running on http://localhost:${PORT}`);
  console.log(`==================================================`);
});
