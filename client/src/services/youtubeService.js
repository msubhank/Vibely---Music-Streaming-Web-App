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
 * Search YouTube via backend or public fallback
 */
export const searchYouTube = async (query, limit = 30) => {
  if (!query || !query.trim()) return [];

  let backendError = null;
  if (BACKEND_URL) {
    try {
      const url = `${BACKEND_URL}/api/youtube/search?query=${encodeURIComponent(query)}&limit=${limit}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`YouTube backend returned HTTP ${res.status}`);
      }

      const json = await res.json();
      if (!json.success || !Array.isArray(json.data)) {
        throw new Error('YouTube backend returned an unexpected response.');
      }
      if (json.data.length > 0) {
        return json.data;
      }
    } catch (err) {
      backendError = err;
      console.error('YouTube backend search failed:', err);
    }
  } else {
    backendError = new Error('VITE_API_URL is not set for the production frontend.');
    console.error(backendError.message);
  }

  let fallbackError = null;
  for (const host of PUBLIC_INVIDIOUS_HOSTS) {
    try {
      const url = `${host}/api/v1/search?q=${encodeURIComponent(query + ' song')}&type=video`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.slice(0, limit).map(formatYtTrack);
      }
    } catch (err) {
      fallbackError = err;
      console.warn(`YouTube public search failed at ${host}:`, err);
    }
  }

  if (backendError || fallbackError) {
    throw new Error(
      backendError
        ? `YouTube search failed: ${backendError.message}`
        : 'YouTube search is currently unavailable. Please try again later.'
    );
  }

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
 * Fetch YouTube trending music
 */
export const getYouTubeTrending = async (category = 'global', limit = 30) => {
  if (BACKEND_URL) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/youtube/trending?category=${encodeURIComponent(category)}&limit=${limit}`);
      if (!res.ok) {
        throw new Error(`YouTube backend returned HTTP ${res.status}`);
      }
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    } catch (err) {
      console.error('YouTube backend trending request failed:', err);
    }
  } else if (!import.meta.env.DEV) {
    console.error('VITE_API_URL is not set for the production frontend.');
  }

  // 2. Fallback to search
  const cat = YT_CATEGORIES.find((c) => c.id === category) || YT_CATEGORIES[0];
  return searchYouTube(cat.query, limit);
};
