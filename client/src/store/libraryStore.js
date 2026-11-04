import { create } from 'zustand';
import {
  fetchLikedTracks,
  addLikedTrack,
  removeLikedTrack,
  fetchUserPlaylists,
  createPlaylist as apiCreatePlaylist,
  deletePlaylist as apiDeletePlaylist,
  addTrackToPlaylist as apiAddTrackToPlaylist,
  removeTrackFromPlaylist as apiRemoveTrackFromPlaylist,
  recordRecentlyPlayed,
  fetchRecentlyPlayed,
} from '../services/libraryService';

const useLibraryStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────
  likedTracks: [],
  likedTrackIds: new Set(),
  playlists: [],
  recentlyPlayed: [],
  isLoading: false,

  // Modal states
  isCreatePlaylistOpen: false,
  isAddToPlaylistOpen: false,
  trackToAddToPlaylist: null,

  // ── Modal Actions ──────────────────────────────────────
  openCreatePlaylistModal: () => set({ isCreatePlaylistOpen: true }),
  closeCreatePlaylistModal: () => set({ isCreatePlaylistOpen: false }),

  openAddToPlaylistModal: (track) =>
    set({ isAddToPlaylistOpen: true, trackToAddToPlaylist: track }),
  closeAddToPlaylistModal: () =>
    set({ isAddToPlaylistOpen: false, trackToAddToPlaylist: null }),

  // ── Library Loading ────────────────────────────────────
  loadUserLibrary: async (userId) => {
    if (!userId) {
      set({ likedTracks: [], likedTrackIds: new Set(), playlists: [], recentlyPlayed: [] });
      return;
    }

    set({ isLoading: true });
    try {
      const [liked, playlists, history] = await Promise.all([
        fetchLikedTracks(userId).catch(() => []),
        fetchUserPlaylists(userId).catch(() => []),
        fetchRecentlyPlayed(userId).catch(() => []),
      ]);

      const likedIds = new Set(liked.map((t) => String(t.audius_track_id)));
      set({
        likedTracks: liked,
        likedTrackIds: likedIds,
        playlists,
        recentlyPlayed: history,
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to load user library:', err);
      set({ isLoading: false });
    }
  },

  // ── Liked Tracks ───────────────────────────────────────
  isLiked: (trackId) => {
    if (!trackId) return false;
    return get().likedTrackIds.has(String(trackId));
  },

  toggleLike: async (userId, track) => {
    if (!userId || !track) return { liked: false };
    const trackIdStr = String(track.id || track.audius_track_id);
    const wasLiked = get().likedTrackIds.has(trackIdStr);

    // Optimistic update
    const nextSet = new Set(get().likedTrackIds);
    let nextList = [...get().likedTracks];

    if (wasLiked) {
      nextSet.delete(trackIdStr);
      nextList = nextList.filter((t) => String(t.audius_track_id) !== trackIdStr);
    } else {
      nextSet.add(trackIdStr);
      nextList.unshift({
        audius_track_id: trackIdStr,
        track_title: track.title || track.track_title,
        artist_name: track.user?.name || track.artist_name,
        artwork_url: typeof track.artwork === 'string' ? track.artwork : null,
        duration: track.duration,
        liked_at: new Date().toISOString(),
      });
    }

    set({ likedTrackIds: nextSet, likedTracks: nextList });

    try {
      if (wasLiked) {
        await removeLikedTrack(userId, trackIdStr);
        return { liked: false };
      } else {
        await addLikedTrack(userId, track);
        return { liked: true };
      }
    } catch (err) {
      // Rollback on failure
      set({ likedTrackIds: get().likedTrackIds, likedTracks: get().likedTracks });
      throw err;
    }
  },

  // ── Playlists ──────────────────────────────────────────
  createPlaylist: async (userId, { name, description, cover_url }) => {
    const newPlaylist = await apiCreatePlaylist(userId, { name, description, cover_url });
    set((state) => ({
      playlists: [{ ...newPlaylist, track_count: 0 }, ...state.playlists],
    }));
    return newPlaylist;
  },

  deletePlaylist: async (playlistId) => {
    await apiDeletePlaylist(playlistId);
    set((state) => ({
      playlists: state.playlists.filter((p) => p.id !== playlistId),
    }));
  },

  addTrackToPlaylist: async (playlistId, track) => {
    const added = await apiAddTrackToPlaylist(playlistId, track);
    set((state) => ({
      playlists: state.playlists.map((p) =>
        p.id === playlistId ? { ...p, track_count: (p.track_count || 0) + 1 } : p
      ),
    }));
    return added;
  },

  removeTrackFromPlaylist: async (playlistId, audiusTrackId) => {
    await apiRemoveTrackFromPlaylist(playlistId, audiusTrackId);
    set((state) => ({
      playlists: state.playlists.map((p) =>
        p.id === playlistId ? { ...p, track_count: Math.max(0, (p.track_count || 1) - 1) } : p
      ),
    }));
  },

  // ── History ────────────────────────────────────────────
  logTrackPlay: async (userId, track) => {
    if (!userId || !track) return;
    await recordRecentlyPlayed(userId, track);
    set((state) => {
      const trackIdStr = String(track.id || track.audius_track_id);
      const filtered = state.recentlyPlayed.filter(
        (t) => String(t.audius_track_id) !== trackIdStr
      );
      return {
        recentlyPlayed: [
          {
            audius_track_id: trackIdStr,
            track_title: track.title || track.track_title,
            artist_name: track.user?.name || track.artist_name,
            artwork_url: typeof track.artwork === 'string' ? track.artwork : null,
            played_at: new Date().toISOString(),
          },
          ...filtered,
        ].slice(0, 50),
      };
    });
  },
}));

export default useLibraryStore;

