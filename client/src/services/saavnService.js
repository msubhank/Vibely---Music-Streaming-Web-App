// JioSaavn Open API Service
// Provides access to 80M+ mainstream global songs (Billboard, Pop, Hip-Hop, Indie, etc.)
// with high-bitrate direct MP3/AAC streams (320kbps / 160kbps).

const API_HOSTS = [
  'https://saavn.dev/api',
  'https://saavn.me/api',
  'https://jiosaavn-api-sigma.vercel.app/api',
  'https://jiosaavn-api-privatecvc2.vercel.app/api',
];

/**
 * Fetch with automatic fallback across healthy hosts
 */
const fetchWithFallback = async (endpoint, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const path = `${endpoint}${queryString ? `?${queryString}` : ''}`;

  let lastError = null;
  for (const host of API_HOSTS) {
    try {
      const url = `${host}${path}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const json = await res.json();
      if (json && (json.success !== false && json.status !== 'FAILED')) {
        return json.data || json;
      }
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('All JioSaavn API hosts failed to respond.');
};

/**
 * Extracts all audio stream URLs sorted by quality (highest to lowest) for fallback support
 */
export const getAllStreamUrls = (downloadUrl) => {
  if (!downloadUrl) return [];
  if (typeof downloadUrl === 'string') return [downloadUrl];

  if (Array.isArray(downloadUrl) && downloadUrl.length > 0) {
    const qualityPriority = ['320kbps', '320', '160kbps', '160', '96kbps', '96', '48kbps', '48', '12kbps', '12'];
    const results = [];

    for (const q of qualityPriority) {
      const match = downloadUrl.find((u) => u.quality === q);
      const link = match?.url || match?.link;
      if (link && !results.includes(link)) {
        results.push(link);
      }
    }

    for (const item of downloadUrl) {
      const link = item?.url || item?.link;
      if (link && !results.includes(link)) {
        results.push(link);
      }
    }

    return results;
  }

  if (typeof downloadUrl === 'object') {
    return Object.values(downloadUrl).filter(Boolean);
  }

  return [];
};

/**
 * Extracts the highest quality audio stream URL from JioSaavn downloadUrl array
 */
const getBestStreamUrl = (downloadUrl) => {
  const all = getAllStreamUrls(downloadUrl);
  return all[0] || '';
};

/**
 * Extracts best artwork URL from image array or object
 */
const getBestArtworkUrl = (images) => {
  if (!images) return '/placeholder-art.png';
  if (typeof images === 'string') return images;

  if (Array.isArray(images) && images.length > 0) {
    const high = images.find((i) => i.quality === '500x500');
    if (high?.url || high?.link) return high.url || high.link;

    const med = images.find((i) => i.quality === '150x150');
    if (med?.url || med?.link) return med.url || med.link;

    const last = images[images.length - 1];
    return last?.url || last?.link || '/placeholder-art.png';
  }

  if (typeof images === 'object') {
    return images['500x500'] || images['150x150'] || Object.values(images)[0] || '/placeholder-art.png';
  }

  return '/placeholder-art.png';
};

/**
 * Decode HTML entities like &quot; &#039; &amp; from titles safely in browser & SSR
 */
const decodeHtmlEntities = (str) => {
  if (!str) return '';
  if (typeof document === 'undefined') return str;
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
};

/**
 * Maps JioSaavn track schema to Vibely's unified track model
 */
export const mapSaavnTrack = (item) => {
  if (!item) return null;

  const title = decodeHtmlEntities(item.name || item.title || item.song || 'Untitled Track');

  let artist = 'Various Artists';
  if (typeof item.primaryArtists === 'string' && item.primaryArtists.trim()) {
    artist = item.primaryArtists;
  } else if (Array.isArray(item.artists?.primary) && item.artists.primary.length > 0) {
    artist = item.artists.primary.map((a) => a.name).join(', ');
  } else if (Array.isArray(item.primaryArtists) && item.primaryArtists.length > 0) {
    artist = item.primaryArtists.map((a) => (typeof a === 'string' ? a : a.name)).join(', ');
  } else if (item.artist) {
    artist = typeof item.artist === 'string' ? item.artist : item.artist.name;
  }
  artist = decodeHtmlEntities(artist);

  const artworkUrl = getBestArtworkUrl(item.image);
  const streamUrls = getAllStreamUrls(item.downloadUrl || item.media_url);
  const streamUrl = streamUrls[0] || '';

  const albumName = decodeHtmlEntities(
    typeof item.album === 'object' ? item.album?.name || '' : item.album || ''
  );

  return {
    id: `saavn_${item.id}`,
    rawId: item.id,
    title,
    duration: parseInt(item.duration, 10) || 0,
    streamUrl,
    streamUrls,
    artwork: {
      '150x150': artworkUrl,
      '480x480': artworkUrl,
    },
    user: {
      name: artist,
    },
    artist_name: artist,
    album: {
      album_name: albumName,
    },
    source: 'jiosaavn',
  };
};

/**
 * Search mainstream tracks by query
 */
export const searchSaavnTracks = async (query, page = 1, limit = 40) => {
  if (!query || !query.trim()) return [];
  try {
    const data = await fetchWithFallback('/search/songs', {
      query: query.trim(),
      page,
      limit,
    });

    const rawResults =
      data?.results ||
      data?.songs?.results ||
      data?.data?.results ||
      (Array.isArray(data) ? data : []);

    return rawResults.map(mapSaavnTrack).filter((t) => Boolean(t && t.streamUrl));
  } catch (err) {
    console.error('JioSaavn track search failed:', err);
    return [];
  }
};

/**
 * Search artists
 */
export const searchSaavnArtists = async (query, page = 1, limit = 20) => {
  if (!query || !query.trim()) return [];
  try {
    const data = await fetchWithFallback('/search/artists', {
      query: query.trim(),
      page,
      limit,
    });

    const rawResults =
      data?.results ||
      data?.artists?.results ||
      data?.data?.results ||
      (Array.isArray(data) ? data : []);

    return rawResults.map((a) => ({
      id: `saavn_artist_${a.id}`,
      rawId: a.id,
      name: decodeHtmlEntities(a.name || a.title),
      follower_count: a.followerCount || a.followers || 0,
      profile_picture: {
        '480x480': getBestArtworkUrl(a.image),
        '150x150': getBestArtworkUrl(a.image),
      },
      source: 'jiosaavn',
    }));
  } catch (err) {
    console.error('JioSaavn artist search failed:', err);
    return [];
  }
};

/**
 * Curated categories for trending songs
 */
export const SAAVN_CATEGORIES = [
  { id: 'global', label: 'Top Global Hits', query: 'Top Global Hits Billboard' },
  { id: 'pop', label: 'Global Pop', query: 'Top Pop English Hits' },
  { id: 'hiphop', label: 'Hip Hop & Rap', query: 'Top Hip Hop English' },
  { id: 'dance', label: 'EDM & Dance', query: 'Top Dance EDM English' },
  { id: 'rock', label: 'Rock Classics', query: 'Top Rock Hits' },
  { id: 'chill', label: 'Chill & Acoustic', query: 'Chill Acoustic Pop' },
  { id: 'bollywood', label: 'Bollywood Hits', query: 'Top Bollywood Hindi' },
];

/**
 * Get trending chart tracks
 */
export const getSaavnTrending = async (category = 'global', limit = 40) => {
  const cat = SAAVN_CATEGORIES.find((c) => c.id === category) || SAAVN_CATEGORIES[0];
  return searchSaavnTracks(cat.query, 1, limit);
};

/**
 * Fetch a single JioSaavn track by ID (used when playing from library/playlists)
 */
export const getSaavnTrackById = async (trackId) => {
  const cleanId = String(trackId).replace(/^saavn_/, '');
  try {
    const data = await fetchWithFallback('/songs', { id: cleanId });
    const rawResults =
      data?.results ||
      data?.songs ||
      (Array.isArray(data) ? data : [data]);
    const song = rawResults[0];
    return mapSaavnTrack(song);
  } catch (err) {
    console.error('Failed to fetch JioSaavn track by id:', err);
    return null;
  }
};

