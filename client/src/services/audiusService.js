// Audius API Service
// Docs: https://docs.audius.co
// Full tracks streamed via /v1/tracks/{id}/stream — no limitations

const APP_NAME = 'Vibely';
const BASE_URL = 'https://api.audius.co/v1';

const withAppName = (params = {}) => ({
  ...params,
  app_name: APP_NAME,
});

const buildUrl = (path, params = {}) => {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(withAppName(params)).forEach(([k, v]) => {
    if (v !== undefined && v !== '') url.searchParams.append(k, v);
  });
  return url.toString();
};

const apiFetch = async (path, params = {}) => {
  const url = buildUrl(path, params);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Audius API error: ${res.status}`);
  const data = await res.json();
  return data.data;
};

// ─── Tracks ────────────────────────────────────────────────────────────────

/**
 * Get trending tracks
 * @param {string} genre - e.g. 'Electronic', 'Hip-Hop', 'Pop'
 * @param {string} time  - 'week' | 'month' | 'allTime'
 */
export const getTrendingTracks = (genre = '', time = 'week') =>
  apiFetch('/tracks/trending', { genre, time });

/**
 * Search for tracks by query string
 */
export const searchTracks = (query, limit = 20) =>
  apiFetch('/tracks/search', { query, limit });

/**
 * Get a single track by its Audius ID
 */
export const getTrack = (trackId) =>
  apiFetch(`/tracks/${trackId}`);

/**
 * Get the full-length stream URL for a track
 * Plug directly into Howler.js or <audio src>
 */
export const getStreamUrl = (trackId) =>
  buildUrl(`/tracks/${trackId}/stream`);

// ─── Artists (Users) ────────────────────────────────────────────────────────

/**
 * Search for artists
 */
export const searchArtists = (query, limit = 20) =>
  apiFetch('/users/search', { query, limit });

/**
 * Get an artist's profile by Audius user ID
 */
export const getArtist = (userId) =>
  apiFetch(`/users/${userId}`);

/**
 * Get all tracks by an artist
 */
export const getArtistTracks = (userId, limit = 20) =>
  apiFetch(`/users/${userId}/tracks`, { limit });

// ─── Playlists ──────────────────────────────────────────────────────────────

/**
 * Get trending playlists on Audius
 */
export const getTrendingPlaylists = (time = 'week') =>
  apiFetch('/playlists/trending', { time });

/**
 * Search for playlists
 */
export const searchPlaylists = (query, limit = 20) =>
  apiFetch('/playlists/search', { query, limit });

/**
 * Get a specific playlist and its tracks
 */
export const getPlaylist = (playlistId) =>
  apiFetch(`/playlists/${playlistId}`);

export const getPlaylistTracks = (playlistId) =>
  apiFetch(`/playlists/${playlistId}/tracks`);

// ─── Genres ─────────────────────────────────────────────────────────────────

export const AUDIUS_GENRES = [
  'All',
  'Electronic',
  'Hip-Hop/Rap',
  'Alternative',
  'Pop',
  'R&B/Soul',
  'Rock',
  'Metal',
  'Jazz',
  'Country',
  'Lo-Fi',
  'Classical',
  'Podcasts',
];

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Format track duration from seconds to m:ss
 */
export const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

/**
 * Get the best available artwork URL from an Audius track
 */
export const getArtwork = (track, size = '480x480') => {
  return track?.artwork?.[size] || track?.artwork?.['150x150'] || '/placeholder-art.png';
};
