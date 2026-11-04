# 🎵 Vibely — Your Music, Your Vibe

Vibely is a modern, full-stack music streaming platform powered by the [Audius](https://audius.co/) API. It delivers seamless, full-track audio playback with a responsive dark-mode UI, playlist management, and user authentication backed by Supabase.

---

## 🚀 Features

- **Decentralized Music Streaming**: Free, uninterrupted full-length track streaming powered by the Audius REST API.
- **Persistent Player Bar**:
  - Global audio engine powered by **Howler.js** and **Zustand**.
  - Play/pause, track seeking with continuous progress bar.
  - Next/previous navigation, shuffle, and repeat modes (`off`, `all`, `one`).
  - Volume slider and one-click mute toggle.
  - Interactive queue management.
- **Music Discovery & Search**:
  - **Home**: Trending tracks with genre pills (*Electronic, Hip-Hop, Pop, Rock, Lo-Fi, etc.*) and time range filters (*Week, Month, All-Time*).
  - **Trending**: Top 50 ranked charts with animated equalizer indicator for active tracks.
  - **Search**: Fast search across tracks and artists.
- **Auth & Cloud Persistence (Supabase)**:
  - User signup/login via Supabase Auth.
  - Profile generation on registration.
  - Database schema with Row Level Security (RLS) for playlists, liked tracks, and listening history.
- **Backend API**:
  - Node.js & Express REST API with security middleware (Helmet, CORS, rate limiting, and Morgan logging).

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
- [ ] **Phase 4: Optimization, Expanded Catalog & Deployment** *(Current)*
  - Expand Audius search/discovery limits & optional YouTube music streaming
  - Audio pre-buffering & caching
  - Production build & cloud deployment (Vercel / Render / Supabase)

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).

