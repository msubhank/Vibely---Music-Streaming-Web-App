import { Play, Heart, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { getArtwork, formatDuration } from '../../services/audiusService';
import usePlayerStore from '../../store/playerStore';
import useLibraryStore from '../../store/libraryStore';
import { useAuth } from '../../context/AuthContext';

const TrackCard = ({ track, queue = [], variant = 'card' }) => {
  const { user, openAuthModal } = useAuth();
  const { playTrack, currentTrack, isPlaying } = usePlayerStore();
  const { isLiked, toggleLike, openAddToPlaylistModal } = useLibraryStore();

  const isActive = currentTrack?.id === track.id;
  const liked = isLiked(track.id);
  const artwork = getArtwork(track, '480x480');

  const handlePlay = (e) => {
    e.stopPropagation();
    playTrack(track, queue.length > 0 ? queue : [track]);
  };

  const handleToggleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal('signin');
      return;
    }
    try {
      const res = await toggleLike(user.id, track);
      if (res.liked) {
        toast.success('Added to Liked Songs ❤️');
      } else {
        toast('Removed from Liked Songs', { icon: '💔' });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update favorites');
    }
  };

  const handleAddToPlaylist = (e) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal('signin');
      return;
    }
    openAddToPlaylistModal(track);
  };

  if (variant === 'row') {
    return (
      <div
        onClick={handlePlay}
        className={`track-row ${isActive ? 'bg-elevated/60' : ''}`}
      >
        <span className={`text-sm ${isActive ? 'text-primary' : 'text-muted group-hover:hidden'}`}>
          {isActive && isPlaying ? (
            <span className="flex gap-0.5 items-end h-4">
              <span className="w-0.5 bg-primary animate-eq-1 rounded-full" />
              <span className="w-0.5 bg-primary animate-eq-2 rounded-full" />
              <span className="w-0.5 bg-primary animate-eq-3 rounded-full" />
            </span>
          ) : (
            <Play size={14} fill="currentColor" className="hidden group-hover:block text-white" />
          )}
        </span>

        <div className="flex items-center gap-3 min-w-0">
          <img src={artwork} alt={track.title} className="w-10 h-10 rounded object-cover shrink-0" />
          <div className="min-w-0">
            <p className={`text-sm font-medium truncate ${isActive ? 'text-primary' : 'text-white'}`}>
              {track.title}
            </p>
            <p className="text-xs text-muted truncate">{track.user?.name}</p>
          </div>
        </div>

        <p className="text-sm text-muted truncate hidden md:block">{track.album?.album_name || '—'}</p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleToggleLike}
            className={`transition-colors ${liked ? 'text-accent' : 'text-muted hover:text-white'}`}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleAddToPlaylist}
            title="Add to Playlist"
            className="text-muted hover:text-white transition-colors"
          >
            <Plus size={16} />
          </button>
          <span className="text-sm text-muted text-right tabular-nums">{formatDuration(track.duration)}</span>
        </div>
      </div>
    );
  }

  // Card variant (grid)
  return (
    <div className="card group relative">
      <div className="relative mb-3">
        <img
          src={artwork}
          alt={track.title}
          className="w-full aspect-square object-cover rounded-lg"
        />

        {track.source === 'youtube' && (
          <span className="absolute top-2 left-2 bg-red-600/90 backdrop-blur-sm text-[10px] font-black text-white px-1.5 py-0.5 rounded shadow">
            YouTube
          </span>
        )}

        {/* Quick action buttons on hover */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleToggleLike}
            title={liked ? 'Unlike' : 'Like'}
            className={`w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center transition-colors ${
              liked ? 'text-accent' : 'text-white hover:text-accent'
            }`}
          >
            <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleAddToPlaylist}
            title="Add to Playlist"
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-white hover:text-primary flex items-center justify-center transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Play button */}
        <button
          onClick={handlePlay}
          className={`absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg
            transition-all duration-200 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'}`}
        >
          <Play size={18} fill="white" className="text-white ml-0.5" />
        </button>
      </div>

      <p className={`text-sm font-semibold truncate ${isActive ? 'text-primary' : 'text-white'}`}>
        {track.title}
      </p>
      <p className="text-xs text-muted mt-0.5 truncate">{track.user?.name}</p>
    </div>
  );
};

export default TrackCard;
