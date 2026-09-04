## 🩷 I love you my Honey. This website is for you so you won't have a hard time with watching movies hehe!

# Mary.MattyMovies 🎬

A modern, responsive, dark-cinematic personal movie streaming interface designed for my Mary Iris Martinez.

Inspired by premium streaming platforms like Netflix with smooth card hover scale effects, continuous watching progress tracking, watchlist storage, and a custom HTML5 video player.

---

## 🌟 Key Features

- **Dark Cinematic Interface**: Deep obsidian dark palette (`#08090c`), glassmorphic header, crimson red accents (`#e50914`), and smooth micro-animations.
- **Dual Compatibility**:
  - **Local Development**: Runs as an Express.js Node app (`npm start` -> `http://localhost:3000`).
  - **Static Hosting**: Ready for **GitHub Pages** deployment with zero build step required.
- **Modular Provider Adapter System**:
  - Decoupled metadata provider (`tmdbProvider.js`) supporting TMDB API integration or offline Creative Commons film dataset (*Big Buck Bunny*, *Tears of Steel*, *Sintel*, *Elephants Dream*, *Cosmos Laundromat*, etc.).
  - Decoupled stream provider (`videoProvider.js`) supporting direct HTML5 video (`.mp4`) and authorized iframe embeds (`YouTube`/`Vimeo`).
- **Custom HTML5 Video Player**:
  - Custom UI: Play/Pause, Seekbar with hover timestamp tooltip, Time formatting, Volume slider & Mute, Playback Speed (0.5x, 1x, 1.25x, 1.5x, 2x), Subtitle selector, Picture-in-Picture, Fullscreen.
  - Keyboard shortcuts (`Space`, `F`, `M`, `←`/`→` arrows).
  - Auto-resume playback from saved position.
- **Continue Watching & Watchlist**:
  - Playback progress tracking ("Resume at mm:ss").
  - Persistent watchlist via LocalStorage.
- **Real-Time Movie Search**:
  - Debounced search dropdown with poster previews and filter by genre.

---

## 🚀 Quick Start (Local Node.js Server)

1. Clone or navigate to the project directory:
   ```bash
   cd movie-site
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

---

## 🌐 GitHub Pages Deployment

To host this project on GitHub Pages:

1. Create a GitHub repository and push this codebase:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of CineStream"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

2. In your repository settings on GitHub:
   - Navigate to **Settings** > **Pages**.
   - Under **Build and deployment**, select **Deploy from a branch**.
   - Choose the `main` branch and `/public` folder (or root `/` if serving root).
   - Click **Save**.

Your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`!

---

## 🔑 Environment Variables (Optional TMDB API)

To enable live TMDB API metadata:
Create a `.env` file in the root directory:
```env
PORT=3000
TMDB_API_KEY=your_tmdb_api_key_here
```
When no TMDB key is present, CineStream seamlessly falls back to its built-in Creative Commons high-definition catalog.

---

## 📁 File Structure

```text
movie-site/
│
├── server/
│   ├── server.js               # Express Server launcher
│   ├── routes/
│   │   ├── movies.js           # REST routes for movies search & details
│   │   └── watch.js            # REST routes for playback stream schemas
│   └── providers/
│       ├── tmdbProvider.js     # Server TMDB & CC Metadata provider
│       └── videoProvider.js    # Server Video Stream provider
│
├── public/                     # Static files (Served by Express & GitHub Pages)
│   ├── index.html              # Home page with hero, rows, search overlay
│   ├── movie.html              # Movie details view
│   ├── watch.html              # Custom video player watch page
│   ├── css/
│   │   └── style.css           # Dark cinematic design system & styles
│   └── js/
│       ├── app.js              # Home page UI renderer
│       ├── search.js           # Debounced search controller
│       ├── movie.js            # Movie details controller
│       ├── player.js           # Custom video player & keybindings controller
│       ├── storage.js          # LocalStorage manager (Watchlist & Progress)
│       └── providers/          # Client-side provider layer (GitHub Pages)
│           ├── tmdbProvider.js
│           ├── videoProvider.js



│           └── movieProvider.js
│
├── package.json
└── README.md
```
