# 🎵 Vibely — Your Music, Your Vibe

Vibely is a modern, full-stack music streaming platform powered by a **universal 3-way hybrid audio engine** combining **YouTube Music** (for access to 100M+ songs, live sessions, anime OSTs, and covers), **JioSaavn Open API** (for 80M+ mainstream studio audio streams at 320kbps), and the **Audius** API (for decentralized indie tracks and electronic beats). It delivers seamless playback with a responsive dark-mode UI, playlist management, floating video player, slide-out queue drawer, and user authentication backed by Supabase.

---

## 🚀 Features

- **Universal 3-Way Audio Engine**:
  - **YouTube Music (100M+ All Songs)**: Instant access to virtually every song ever recorded — studio tracks, unreleased songs, covers, live concerts, and video game/anime soundtracks. Includes background audio streaming and a floating Picture-in-Picture video toggle (`Tv` icon).
  - **Global Hits (JioSaavn Open API)**: 80M+ mainstream hits (*The Weeknd, Taylor Swift, Drake, Coldplay, Dua Lipa, Billie Eilish, Bollywood, etc.*) with 320kbps & 160kbps multi-bitrate fallback streams.
  - **Indie & Remixes (Audius API)**: Free, uninterrupted streaming of decentralized and community-uploaded electronic tracks.
  - Seamless 1-click source switcher across Home, Search, and Trending pages.
- **Persistent Player Bar & Queue Drawer**:
  - Hybrid audio controller powered by **Howler.js**, the official **YouTube IFrame Player**, and **Zustand**.
  - Play/pause, track seeking with continuous progress bar.
  - Next/previous navigation, shuffle, and repeat modes (`off`, `all`, `one`).
  - Next-track background audio pre-buffering for instant transitions.
  - Slide-out Queue Drawer with live track removal and animated equalizers.
  - Volume slider, one-click mute toggle, and floating video player modal.
- **Music Discovery & Search**:
  - **Home**: Curated category pills (*Top Global Hits, Pop, Hip-Hop, Rock, EDM, Lo-Fi Chill, Bollywood*) across YouTube, JioSaavn, and Audius.
  - **Trending**: Top 50 ranked charts with live audio playback.
  - **Search**: Fast unified search across 100M+ tracks with popular search chips.
- **Auth & Cloud Persistence (Supabase)**:
  - User signup/login via Supabase Auth.
  - Profile generation on registration.
  - Database schema with Row Level Security (RLS) for playlists, liked tracks, and listening history.
- **Backend API**:
  - Node.js & Express REST API with security middleware (Helmet, CORS, rate limiting, and Morgan logging).
  - Dedicated `/api/youtube` search and trending route.

---

## 🛠️ Tech Stack

### Frontend (`client/`)
- **Framework**: React + Vite
- **Styling**: Tailwind CSS, PostCSS, Lucide React icons
- **State Management**: Zustand
- **Audio Engine**: Howler.js
- **Routing**: React Router v7
- **Database Client**: `@supabase/supabase-js`
- **UI Enhancements**: React Hot Toast, React Loading Skeleton

### Backend (`server/`)
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 5
- **Security & Utilities**: Helmet, CORS, Morgan, `express-rate-limit`, `dotenv`
- **Database Client**: Supabase Service Role SDK

### Database & Auth
- **Provider**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Security**: Row Level Security (RLS) policies for user data isolation

---

## 📁 Project Structure

```text
Vibely/
├── client/                     # Frontend Vite + React application
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── assets/             # Images and branding assets
│   │   ├── components/
│   │   │   ├── layout/         # Persistent Player bar, Sidebar
│   │   │   └── music/          # TrackCard, music-related components
│   │   ├── context/            # AuthContext (Supabase Auth)
│   │   ├── pages/              # Home, Trending, Search, Library
│   │   ├── services/           # audiusService.js, supabaseClient.js
│   │   ├── store/              # playerStore.js (Zustand + Howler)
│   │   ├── App.jsx             # Main router and layout wrapper
│   │   ├── index.css           # Tailwind directives and custom utility classes
│   │   └── main.jsx            # Application mount entry point
│   ├── index.html              # HTML shell
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── server/                     # Backend Express API
│   ├── src/
│   │   └── app.js              # Express app, middleware, health check
│   ├── package.json
│   └── .env
├── supabase_schema.sql         # Database tables, triggers, and RLS policies
├── .gitignore
└── README.md
```

---

## ⚙️ Getting Started

### 1. Prerequisites
- **Node.js** (v18 or newer recommended)
- **npm** or **pnpm**
- A free **Supabase** account and project

---

### 2. Database Setup (Supabase)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and open the **SQL Editor**.
2. Copy and paste the contents of [`supabase_schema.sql`](./supabase_schema.sql) into the editor.
3. Run the script to provision:
   - `profiles` (with auto-create trigger on signup)
   - `playlists` & `playlist_tracks`
   - `liked_tracks`
   - `recently_played`
   - Row Level Security (RLS) policies and indexes

---

### 3. Environment Variables Configuration

#### Client (`client/.env`)
Create a `.env` file in the `client/` directory:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=http://localhost:5000
VITE_AUDIUS_APP_NAME=Vibely
```

#### Server (`server/.env`)
Create a `.env` file in the `server/` directory:
```env
PORT=5000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
CLIENT_URL=http://localhost:5173
```

---

### 4. Installation & Running

#### Start the Backend Server:
```bash
cd server
npm install
npm run dev
```
The server will start on `http://localhost:5000`. You can test health at `http://localhost:5000/health`.

#### Start the Frontend Client:
```bash
cd client
npm install
npm run dev
```
The client will start on `http://localhost:5173`.

### 5. Production Deployment

When deploying the client separately from the Express server (for example, on
Vercel and Render), set `VITE_API_URL` in the client hosting provider to the
public base URL of the deployed server, without a trailing slash. For example:

```env
VITE_API_URL=https://your-backend-name.onrender.com
```

Vite embeds this value at build time, so add or update it in the hosting
provider's environment-variable settings and redeploy the client. Do not use
`http://localhost:5000` in production. YouTube playback also requires the
deployed site's origin to be available to the YouTube IFrame Player API.

---

## 🗺️ Development Roadmap & Phases

- [x] **Phase 1: Core Audio Engine & Discovery UI**
  - Audius API integration & streaming pipeline
  - Zustand audio player store with Howler.js
  - Responsive dark-themed UI (Home, Trending charts, Search)
  - Supabase database schema & Express server foundation
- [x] **Phase 2: Authentication & User Accounts**
  - AuthModal with Sign In & Sign Up tabs (Email/Password + Google OAuth)
  - User session state, avatar, and Sign Out in Sidebar
  - Backend token verification middleware and profile routes (`/api/auth/me`, `/api/auth/profile`)
- [x] **Phase 3: Library, Playlists & Social**
  - Custom user playlists (Create, Add track, Remove track, Delete playlist)
  - Liked tracks collection with real-time toggle & Play All
  - Automatic recently played listening history sync
  - Dedicated `/playlist/:id` details view & multi-tab `/library` hub
- [x] **Phase 4: Player Enhancements, Expanded Catalog & Polish**
  - Interactive Queue Drawer panel (reorder, clear upcoming, now-playing indicator)
  - Expanded search & discovery limits with "Load More" pagination
  - Dedicated `/artist/:id` profile view with discography, follower counts & bio
  - Automatic next-track audio pre-buffering for gapless playback
  - Mobile bottom navigation bar for small screens
- [ ] **Phase 5: Cloud Deployment & CI/CD** *(Current)*
  - Production build & cloud hosting (Vercel / Render / Supabase)

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
