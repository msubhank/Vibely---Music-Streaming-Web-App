import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../supabase.js';

const router = Router();

/**
 * GET /api/playlists
 * Fetch all playlists owned by the authenticated user
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { data: playlists, error } = await supabaseAdmin
      .from('playlists')
      .select('*, playlist_tracks(count)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching playlists:', error);
      return res.status(400).json({ error: error.message });
    }

    const formatted = (playlists || []).map((p) => ({
      ...p,
      track_count: p.playlist_tracks?.[0]?.count || 0,
    }));

    res.json({ playlists: formatted });
  } catch (err) {
    console.error('Playlists GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/playlists
 * Create a new playlist
 */
router.post('/', requireAuth, async (req, res) => {
  const { name, description = '', cover_url = null, is_public = true } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Playlist name is required' });
  }

  try {
    const { data: newPlaylist, error } = await supabaseAdmin
      .from('playlists')
      .insert({
        user_id: req.user.id,
        name: name.trim(),
        description: description.trim(),
        cover_url,
        is_public,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating playlist:', error);
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ playlist: { ...newPlaylist, track_count: 0 } });
  } catch (err) {
    console.error('Playlist POST error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/playlists/:id
 * Get playlist details and tracks
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data: playlist, error: playlistErr } = await supabaseAdmin
      .from('playlists')
      .select('*')
      .eq('id', id)
      .single();

    if (playlistErr || !playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const { data: tracks, error: tracksErr } = await supabaseAdmin
      .from('playlist_tracks')
      .select('*')
      .eq('playlist_id', id)
      .order('position', { ascending: true })
      .order('added_at', { ascending: true });

    if (tracksErr) {
      return res.status(400).json({ error: tracksErr.message });
    }

    res.json({ playlist: { ...playlist, tracks: tracks || [] } });
  } catch (err) {
    console.error('Playlist details error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/playlists/:id
 * Delete a playlist
 */
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabaseAdmin
      .from('playlists')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Error deleting playlist:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Playlist delete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/playlists/:id/tracks
 * Add track to a playlist
 */
router.post('/:id/tracks', requireAuth, async (req, res) => {
  const { id: playlistId } = req.params;
  const { audius_track_id, track_title, artist_name, artwork_url, duration } = req.body;

  if (!audius_track_id) {
    return res.status(400).json({ error: 'audius_track_id is required' });
  }

  try {
    // Verify user owns the playlist
    const { data: playlist, error: plErr } = await supabaseAdmin
      .from('playlists')
      .select('id')
      .eq('id', playlistId)
      .eq('user_id', req.user.id)
      .single();

    if (plErr || !playlist) {
      return res.status(403).json({ error: 'Not authorized to modify this playlist' });
    }

    const { data: existing } = await supabaseAdmin
      .from('playlist_tracks')
      .select('position')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: false })
      .limit(1);

    const nextPos = (existing?.[0]?.position ?? -1) + 1;

    const { data: track, error: insertErr } = await supabaseAdmin
      .from('playlist_tracks')
      .insert({
        playlist_id: playlistId,
        audius_track_id: String(audius_track_id),
        track_title: track_title || 'Untitled Track',
        artist_name: artist_name || 'Unknown Artist',
        artwork_url,
        duration: Math.round(duration || 0),
        position: nextPos,
      })
      .select()
      .single();

    if (insertErr) {
      if (insertErr.code === '23505') {
        return res.status(409).json({ error: 'Track is already in this playlist' });
      }
      return res.status(400).json({ error: insertErr.message });
    }

    res.status(201).json({ track });
  } catch (err) {
    console.error('Add track to playlist error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/playlists/:id/tracks/:trackId
 * Remove track from a playlist
 */
router.delete('/:id/tracks/:trackId', requireAuth, async (req, res) => {
  const { id: playlistId, trackId } = req.params;

  try {
    // Verify user owns the playlist
    const { data: playlist, error: plErr } = await supabaseAdmin
      .from('playlists')
      .select('id')
      .eq('id', playlistId)
      .eq('user_id', req.user.id)
      .single();

    if (plErr || !playlist) {
      return res.status(403).json({ error: 'Not authorized to modify this playlist' });
    }

    const { error: delErr } = await supabaseAdmin
      .from('playlist_tracks')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('audius_track_id', String(trackId));

    if (delErr) {
      return res.status(400).json({ error: delErr.message });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Remove track from playlist error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

