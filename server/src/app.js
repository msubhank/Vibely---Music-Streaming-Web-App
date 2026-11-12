import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (Render, Heroku, etc.) for rate limiting & secure cookies
app.set('trust proxy', 1);

// ── Middleware ────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// ── Routes ────────────────────────────────────────────────────────
import authRouter from './routes/auth.js';
import playlistsRouter from './routes/playlists.js';

app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'Vibely API', timestamp: new Date().toISOString() });
});

// Phase 2: Auth & User profile routes
app.use('/api/auth', authRouter);

// Phase 3: Playlists routes
app.use('/api/playlists', playlistsRouter);

// YouTube Music & Video routes (Option A: 100M+ songs)
import youtubeRouter from './routes/youtube.js';
app.use('/api/youtube', youtubeRouter);

// ── 404 & Error handlers ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🎵 Vibely API running on http://localhost:${PORT}`);
});

export default app;
