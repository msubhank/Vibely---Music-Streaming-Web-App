import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Trash2, Music, Clock, Heart, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchPlaylistDetails } from '../services/libraryService';
import { formatDuration } from '../services/audiusService';
import usePlayerStore from '../store/playerStore';
import useLibraryStore from '../store/libraryStore';
import { useAuth } from '../context/AuthContext';

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const { playTrack, currentTrack, isPlaying } = usePlayerStore();
  const {
    isLiked,
    toggleLike,
    deletePlaylist,
    removeTrackFromPlaylist,
  } = useLibraryStore();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchPlaylistDetails(id);
        setPlaylist(data);
      } catch (err) {
        console.error('Failed to load playlist:', err);
        toast.error('Failed to load playlist');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Music size={48} className="text-muted mb-4" />
        <h2 className="text-xl font-bold text-white">Playlist not found</h2>
        <button
          onClick={() => navigate('/library')}
          className="btn-primary mt-4 flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to Library
        </button>
      </div>
    );
  }

  // Convert playlist tracks to player-compatible format
  const playableTracks = playlist.tracks.map((t) => ({
    id: t.audius_track_id,
    title: t.track_title,
    duration: t.duration,
    artwork: { '480x480': t.artwork_url, '150x150': t.artwork_url },
    user: { name: t.artist_name },
  }));

  const handlePlayAll = () => {
    if (playableTracks.length === 0) return;
    playTrack(playableTracks[0], playableTracks);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${playlist.name}"?`)) return;
    setIsDeleting(true);
    try {
      await deletePlaylist(playlist.id);
      toast.success('Playlist deleted');
      navigate('/library');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete playlist');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRemoveTrack = async (e, trackId) => {
    e.stopPropagation();
    try {
      await removeTrackFromPlaylist(playlist.id, trackId);
      setPlaylist((prev) => ({
        ...prev,
        tracks: prev.tracks.filter((t) => t.audius_track_id !== trackId),
      }));
      toast.success('Removed from playlist');
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove track');
    }
  };

  const handleToggleLike = async (e, track) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal('signin');
      return;
    }
    try {
      const res = await toggleLike(user.id, {
        id: track.audius_track_id,
        title: track.track_title,
        artist_name: track.artist_name,
        artwork: track.artwork_url,
        duration: track.duration,
      });
      if (res.liked) {
        toast.success('Added to Liked Songs ❤️');
      } else {
        toast('Removed from Liked Songs', { icon: '💔' });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update liked songs');
    }
  };

  const isCurrentPlaylistPlaying =
    playableTracks.some((t) => t.id === currentTrack?.id) && isPlaying;

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Playlist Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 mb-8">
        <div className="w-44 h-44 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-2xl">
          {playlist.cover_url ? (
            <img
              src={playlist.cover_url}
              alt={playlist.name}
              className="w-full h-full rounded-2xl object-cover"
            />
          ) : (
            <Music size={54} className="text-white/80" />
          )}
        </div>

        <div className="flex flex-col gap-2 min-w-0">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Playlist
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white truncate">
            {playlist.name}
          </h1>
          {playlist.description && (
            <p className="text-sm text-muted line-clamp-2 max-w-xl">
              {playlist.description}
            </p>
          )}
          <p className="text-xs text-muted mt-1">
            {playlist.tracks.length} {playlist.tracks.length === 1 ? 'track' : 'tracks'}
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handlePlayAll}
          disabled={playlist.tracks.length === 0}
          className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg disabled:opacity-40"
          title="Play All"
        >
          {isCurrentPlaylistPlaying ? (
            <Pause size={22} fill="currentColor" />
          ) : (
            <Play size={22} fill="currentColor" className="ml-0.5" />
          )}
        </button>

        {user && user.id === playlist.user_id && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete Playlist"
            className="p-2.5 rounded-full text-muted hover:text-red-400 hover:bg-elevated transition-colors"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      {/* Tracks Table */}
      {playlist.tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-elevated flex items-center justify-center mb-4 text-muted">
            <Music size={28} />
          </div>
          <p className="text-base font-semibold text-white">This playlist is empty</p>
          <p className="text-sm text-muted mt-1 max-w-sm">
            Find songs you love and click "+ Add to Playlist" to build your collection.
          </p>
          <button
            onClick={() => navigate('/trending')}
            className="btn-primary mt-4 text-sm"
          >
            Explore Trending
          </button>
        </div>
      ) : (
        <div className="flex flex-col">
          {/* Header */}
          <div className="track-row text-xs text-muted uppercase tracking-wider pb-2 border-b border-border mb-2">
            <span>#</span>
            <span>Title</span>
            <span className="hidden md:block">Artist</span>
            <span className="text-right">Time</span>
          </div>

          {/* Rows */}
          {playlist.tracks.map((track, idx) => {
            const isPlayingThis = currentTrack?.id === track.audius_track_id && isPlaying;
            const liked = isLiked(track.audius_track_id);

            return (
              <div
                key={track.id || track.audius_track_id}
                onClick={() => playTrack(playableTracks[idx], playableTracks)}
                className={`track-row group cursor-pointer ${
                  currentTrack?.id === track.audius_track_id ? 'bg-elevated/60' : ''
                }`}
              >
                <span className={`text-sm font-medium ${
                  currentTrack?.id === track.audius_track_id ? 'text-primary' : 'text-muted'
                }`}>
                  {isPlayingThis ? (
                    <span className="flex gap-0.5 items-end h-4">
                      <span className="w-0.5 bg-primary animate-eq-1 rounded-full" />
                      <span className="w-0.5 bg-primary animate-eq-2 rounded-full" />
                      <span className="w-0.5 bg-primary animate-eq-3 rounded-full" />
                    </span>
                  ) : (
                    idx + 1
                  )}
                </span>

                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={track.artwork_url || '/placeholder-art.png'}
                    alt={track.track_title}
                    className="w-10 h-10 rounded object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      currentTrack?.id === track.audius_track_id ? 'text-primary' : 'text-white'
                    }`}>
                      {track.track_title}
                    </p>
                    <p className="text-xs text-muted truncate md:hidden">
                      {track.artist_name}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted truncate hidden md:block">
                  {track.artist_name}
                </p>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={(e) => handleToggleLike(e, track)}
                    className={`transition-colors ${liked ? 'text-accent' : 'text-muted hover:text-white opacity-0 group-hover:opacity-100'}`}
                  >
                    <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                  </button>

                  <span className="text-sm text-muted tabular-nums">
                    {formatDuration(track.duration)}
                  </span>

                  {user && user.id === playlist.user_id && (
                    <button
                      onClick={(e) => handleRemoveTrack(e, track.audius_track_id)}
                      title="Remove from playlist"
                      className="text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlaylistDetail;

