import { Play, Heart, MoreHorizontal } from 'lucide-react';
import { getArtwork, formatDuration } from '../../services/audiusService';
import usePlayerStore from '../../store/playerStore';

const TrackCard = ({ track, queue = [], variant = 'card' }) => {
  const { playTrack, currentTrack, isPlaying } = usePlayerStore();
  const isActive = currentTrack?.id === track.id;
  const artwork = getArtwork(track, '480x480');

  const handlePlay = (e) => {
    e.stopPropagation();
    playTrack(track, queue.length > 0 ? queue : [track]);
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
        <p className="text-sm text-muted text-right">{formatDuration(track.duration)}</p>
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
