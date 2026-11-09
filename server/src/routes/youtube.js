import express from 'express';
import ytSearch from 'yt-search';

const router = express.Router();

// Helper to format yt-search result into Vibely's unified track schema
const formatYtTrack = (item) => {
  const videoId = item.videoId;
  const artworkUrl = item.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const artist = item.author?.name || 'YouTube Music';

  return {
    id: `yt_${videoId}`,
    rawId: videoId,
    videoId,
    title: item.title || 'Untitled Track',
    duration: item.seconds || (item.duration ? parseInt(item.duration.seconds, 10) : 0),
    artist_name: artist,
    user: {
      name: artist,
    },
    artwork: {
      '150x150': artworkUrl,
      '480x480': item.image || artworkUrl,
    },
    album: {
      album_name: 'YouTube Music',
    },
    source: 'youtube',
    views: item.views,
    ago: item.ago,
  };
};

/**
 * GET /api/youtube/search?query=...&limit=30
 */
router.get('/search', async (req, res) => {
  try {
    const { query, limit = 30 } = req.query;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const r = await ytSearch(`${query.trim()} official audio song`);
    const videos = (r.videos || []).slice(0, parseInt(limit, 10));

    const tracks = videos.map(formatYtTrack);
    res.json({ success: true, count: tracks.length, data: tracks });
  } catch (err) {
    console.error('YouTube search error:', err);
    res.status(500).json({ error: 'Failed to search YouTube', details: err.message });
  }
});

/**
 * Curated trending queries
 */
const YT_TRENDING_QUERIES = {
  global: 'Top 50 Global Music Hits Official Audio',
  pop: 'Popular Pop Music Hits Songs 2026',
  hiphop: 'Top Hip Hop Rap Songs Official Audio',
  rock: 'Best Rock Songs Classic and Modern',
  electronic: 'EDM Electronic Dance Music Hits',
  chill: 'Lo-Fi Chill Beats to Relax/Study to',
  trending: 'Top Trending Songs Music Videos',
};

/**
 * GET /api/youtube/trending?category=global&limit=30
 */
router.get('/trending', async (req, res) => {
  try {
    const { category = 'global', limit = 30 } = req.query;
    const query = YT_TRENDING_QUERIES[category] || YT_TRENDING_QUERIES.global;

    const r = await ytSearch(query);
    const videos = (r.videos || []).slice(0, parseInt(limit, 10));

    const tracks = videos.map(formatYtTrack);
    res.json({ success: true, count: tracks.length, data: tracks });
  } catch (err) {
    console.error('YouTube trending error:', err);
    res.status(500).json({ error: 'Failed to fetch YouTube trending', details: err.message });
  }
});

/**
 * GET /api/youtube/video/:id
 */
router.get('/video/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const r = await ytSearch({ videoId: id });
    if (!r) {
      return res.status(404).json({ error: 'Video not found' });
    }
    res.json({ success: true, data: formatYtTrack(r) });
  } catch (err) {
    console.error('YouTube video detail error:', err);
    res.status(500).json({ error: 'Failed to fetch video detail' });
  }
});

export default router;

