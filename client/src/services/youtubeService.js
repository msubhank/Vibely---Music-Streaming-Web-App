// YouTube Music Service
// Unlocks 100M+ songs, covers, live versions, and remixes using YouTube
// with backend endpoint + client-side Invidious/Piped public fallback.

const configuredBackendUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '');
const BACKEND_URL = configuredBackendUrl
  ? configuredBackendUrl.replace(/\/api$/i, '')
  : import.meta.env.DEV
    ? 'http://localhost:5000'
    : '';

const PUBLIC_INVIDIOUS_HOSTS = [
  'https://invidious.nerdvpn.de',
  'https://inv.tux.pizza',
  'https://invidious.jing.rocks',
  'https://vid.priv.au',
];

const BACKEND_TIMEOUT_MS = 65000; // Render free tier can take 50s+ to cold-start
const FALLBACK_TIMEOUT_MS = 8000;

const fetchWithTimeout = async (url, timeoutMs) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

const getRequestError = (err, label) =>
  err.name === 'AbortError' ? new Error(`${label} timed out.`) : err;

/**
 * Format video into unified Vibely track
 */
export const formatYtTrack = (item) => {
  const videoId = item.videoId || item.id || (item.url ? item.url.replace('/watch?v=', '') : '');
  const artworkUrl =
    item.thumbnail ||
    item.videoThumbnails?.[0]?.url ||
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  const artist = item.author || item.uploaderName || item.artist_name || 'YouTube Music';
  const duration = parseInt(item.lengthSeconds || item.duration || item.seconds, 10) || 0;

  return {
    id: `yt_${videoId}`,
    rawId: videoId,
    videoId,
    title: item.title || 'Untitled Track',
    duration,
    artist_name: artist,
    user: {
      name: artist,
    },
    artwork: {
      '150x150': artworkUrl,
      '480x480': `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    },
    album: {
      album_name: 'YouTube Music',
    },
    source: 'youtube',
  };
};

/**
 * Search YouTube via backend. Falls back to Invidious (browser-side) if backend is unreachable.
 * Never throws — returns [] on total failure so the UI shows "0 results" instead of an error.
 */
export const searchYouTube = async (query, limit = 30) => {
  if (!query || !query.trim()) return [];

  // 1. Try backend (yt-search runs server-side, no CORS issues)
  if (BACKEND_URL) {
    try {
      const url = `${BACKEND_URL}/api/youtube/search?query=${encodeURIComponent(query)}&limit=${limit}`;
      const res = await fetchWithTimeout(url, BACKEND_TIMEOUT_MS);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('YouTube backend search failed, trying Invidious:', err.message);
    }
  } else {
    console.warn('VITE_API_URL not set — skipping backend, trying Invidious fallback.');
  }

  // 2. Browser-side Invidious fallback (may be blocked by CORS in some browsers/networks)
  for (const host of PUBLIC_INVIDIOUS_HOSTS) {
    try {
      const url = `${host}/api/v1/search?q=${encodeURIComponent(query + ' song')}&type=video`;
      const res = await fetchWithTimeout(url, FALLBACK_TIMEOUT_MS);
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.slice(0, limit).map(formatYtTrack);
      }
    } catch {
      continue; // try next host
    }
  }

  // 3. Total failure — return empty (no throw, so UI shows "0 results" cleanly)
  console.error('All YouTube sources failed for query:', query);
  return [];
};

export const YT_CATEGORIES = [
  { id: 'global', label: 'Top Global Hits', query: 'Top 50 Global Music Hits' },
  { id: 'pop', label: 'Pop Hits', query: 'Popular Pop Music Songs 2026' },
  { id: 'hiphop', label: 'Hip Hop & Rap', query: 'Top Hip Hop Rap Songs' },
  { id: 'rock', label: 'Rock Classics', query: 'Best Rock Songs Classic and Modern' },
  { id: 'electronic', label: 'EDM & Dance', query: 'EDM Electronic Dance Music Hits' },
  { id: 'chill', label: 'Lo-Fi & Chill', query: 'Lo-Fi Chill Beats to Relax' },
];

/**
 * Fetch YouTube trending music. Never throws — returns [] on failure.
 */
export const getYouTubeTrending = async (category = 'global', limit = 30) => {
  if (BACKEND_URL) {
    try {
      const res = await fetchWithTimeout(
        `${BACKEND_URL}/api/youtube/trending?category=${encodeURIComponent(category)}&limit=${limit}`,
        BACKEND_TIMEOUT_MS
      );
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('YouTube backend trending failed, falling back to search:', err.message);
    }
  }

  // Fallback: search by category query (also never throws)
  const cat = YT_CATEGORIES.find((c) => c.id === category) || YT_CATEGORIES[0];
  return searchYouTube(cat.query, limit);
};
