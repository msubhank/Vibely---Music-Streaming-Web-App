import { supabase } from './supabaseClient';
import { getArtwork } from './audiusService';

// ─── Liked Tracks ────────────────────────────────────────────────────────────

/**
 * Fetch all liked tracks for a user
 */
export const fetchLikedTracks = async (userId) => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('liked_tracks')
    .select('*')
    .eq('user_id', userId)
    .order('liked_at', { ascending: false });

  if (error) {
    console.error('Error fetching liked tracks:', error);
    throw error;
  }
  return data || [];
};

/**
 * Save a track to liked_tracks
 */
export const addLikedTrack = async (userId, track) => {
  if (!userId || !track) return null;
  const trackIdStr = String(track.id);
  const artwork = typeof track.artwork === 'string' ? track.artwork : getArtwork(track);

  const payload = {
    user_id: userId,
    audius_track_id: trackIdStr,
    track_title: track.title || 'Untitled Track',
    artist_name: track.user?.name || track.artist_name || 'Unknown Artist',
    artwork_url: artwork,
    duration: Math.round(track.duration || 0),
    liked_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('liked_tracks')
    .upsert(payload, { onConflict: 'user_id, audius_track_id' })
    .select()
    .single();

  if (error) {
    console.error('Error adding liked track:', error);
    throw error;
  }
  return data;
};

/**
 * Remove a track from liked_tracks
 */
export const removeLikedTrack = async (userId, audiusTrackId) => {
  if (!userId || !audiusTrackId) return;
  const { error } = await supabase
    .from('liked_tracks')
    .delete()
    .eq('user_id', userId)
    .eq('audius_track_id', String(audiusTrackId));

  if (error) {
    console.error('Error removing liked track:', error);
    throw error;
  }
};

// ─── Playlists ────────────────────────────────────────────────────────────────

/**
 * Fetch all playlists owned by a user
 */
export const fetchUserPlaylists = async (userId) => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('playlists')
    .select(`
      *,
      playlist_tracks (count)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching playlists:', error);
    throw error;
  }

  return (data || []).map((p) => ({
    ...p,
    track_count: p.playlist_tracks?.[0]?.count || 0,
  }));
};

/**
 * Create a new playlist
 */
export const createPlaylist = async (userId, { name, description = '', cover_url = null, is_public = true }) => {
  if (!userId || !name?.trim()) throw new Error('Playlist name is required');

  const { data, error } = await supabase
    .from('playlists')
    .insert({
      user_id: userId,
      name: name.trim(),
      description: description.trim(),
      cover_url,
      is_public,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating playlist:', error);
    throw error;
  }
  return data;
};

/**
 * Delete a playlist
 */
export const deletePlaylist = async (playlistId) => {
  const { error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', playlistId);

  if (error) {
    console.error('Error deleting playlist:', error);
    throw error;
  }
};

/**
 * Fetch details and tracks of a specific playlist
 */
export const fetchPlaylistDetails = async (playlistId) => {
  const { data: playlist, error: playlistError } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', playlistId)
    .single();

  if (playlistError) throw playlistError;

  const { data: tracks, error: tracksError } = await supabase
    .from('playlist_tracks')
    .select('*')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: true })
    .order('added_at', { ascending: true });

  if (tracksError) throw tracksError;

  return {
    ...playlist,
    tracks: tracks || [],
  };
};

/**
 * Add a track to a playlist
 */
export const addTrackToPlaylist = async (playlistId, track) => {
  if (!playlistId || !track) return null;
  const trackIdStr = String(track.id || track.audius_track_id);
  const artwork = typeof track.artwork === 'string' ? track.artwork : getArtwork(track);

  // Fetch highest position
  const { data: existing } = await supabase
    .from('playlist_tracks')
    .select('position')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: false })
    .limit(1);

  const nextPos = (existing?.[0]?.position ?? -1) + 1;

  const payload = {
    playlist_id: playlistId,
    audius_track_id: trackIdStr,
    track_title: track.title || track.track_title || 'Untitled Track',
    artist_name: track.user?.name || track.artist_name || 'Unknown Artist',
    artwork_url: artwork,
    duration: Math.round(track.duration || 0),
    position: nextPos,
  };

  const { data, error } = await supabase
    .from('playlist_tracks')
    .insert(payload)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Track is already in this playlist');
    }
    console.error('Error adding track to playlist:', error);
    throw error;
  }
  return data;
};

/**
 * Remove a track from a playlist
 */
export const removeTrackFromPlaylist = async (playlistId, audiusTrackId) => {
  const { error } = await supabase
    .from('playlist_tracks')
    .delete()
    .eq('playlist_id', playlistId)
    .eq('audius_track_id', String(audiusTrackId));

  if (error) {
    console.error('Error removing track from playlist:', error);
    throw error;
  }
};

// ─── Recently Played ──────────────────────────────────────────────────────────

/**
 * Record a played track to listening history
 */
export const recordRecentlyPlayed = async (userId, track) => {
  if (!userId || !track) return;
  const trackIdStr = String(track.id || track.audius_track_id);
  const artwork = typeof track.artwork === 'string' ? track.artwork : getArtwork(track);

  const payload = {
    user_id: userId,
    audius_track_id: trackIdStr,
    track_title: track.title || track.track_title || 'Untitled Track',
    artist_name: track.user?.name || track.artist_name || 'Unknown Artist',
    artwork_url: artwork,
    played_at: new Date().toISOString(),
  };

  try {
    await supabase.from('recently_played').insert(payload);
  } catch (err) {
    console.error('Failed to log recently played:', err);
  }
};

/**
 * Fetch recently played history
 */
export const fetchRecentlyPlayed = async (userId, limit = 50) => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('recently_played')
    .select('*')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recently played history:', error);
    throw error;
  }
  return data || [];
};

