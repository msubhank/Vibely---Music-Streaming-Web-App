import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Shuffle, Repeat, Repeat1, ListMusic, Heart
} from 'lucide-react';
import usePlayerStore from '../../store/playerStore';
import { formatDuration, getArtwork } from '../../services/audiusService';

const Player = () => {
  const {
    currentTrack, isPlaying, isLoading, volume, isMuted,
    shuffle, repeat, progress, currentTime, duration,
    togglePlay, next, prev, seek, setVolume, toggleMute,
    toggleShuffle, toggleRepeat, toggleQueue, showQueue,
  } = usePlayerStore();

  if (!currentTrack) {
    return (
      <footer className="h-20 bg-surface border-t border-border flex items-center justify-center">
        <p className="text-muted text-sm">No track selected — browse and play something 🎵</p>
      </footer>
    );
  }

  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat;
  const artworkUrl = getArtwork(currentTrack, '150x150');

  return (
    <footer className="h-20 bg-surface border-t border-border grid grid-cols-3 items-center px-4 gap-4 shrink-0">
      {/* Track Info */}
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={artworkUrl}
          alt={currentTrack.title}
          className="w-12 h-12 rounded-lg object-cover shrink-0"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{currentTrack.title}</p>
          <p className="text-xs text-muted truncate">{currentTrack.user?.name}</p>
        </div>
        <button className="text-muted hover:text-accent transition-colors ml-2 shrink-0">
          <Heart size={16} />
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            className={`transition-colors ${shuffle ? 'text-primary' : 'text-muted hover:text-white'}`}
          >
            <Shuffle size={16} />
          </button>

          <button
            onClick={prev}
            className="text-muted-fg hover:text-white transition-colors"
          >
            <SkipBack size={20} />
          </button>

          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="w-9 h-9 rounded-full bg-white text-bg flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          <button
            onClick={next}
            className="text-muted-fg hover:text-white transition-colors"
          >
            <SkipForward size={20} />
          </button>

          <button
            onClick={toggleRepeat}
            className={`transition-colors ${repeat !== 'off' ? 'text-primary' : 'text-muted hover:text-white'}`}
          >
            <RepeatIcon size={16} />
          </button>
        </div>

        {/* Seekbar */}
        <div className="flex items-center gap-2 w-full max-w-sm">
          <span className="text-xs text-muted w-8 text-right tabular-nums">
            {formatDuration(Math.floor(currentTime))}
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={progress}
            onChange={(e) => seek(parseFloat(e.target.value))}
            className="flex-1 accent-white"
            style={{
              background: `linear-gradient(to right, white ${progress * 100}%, #3F3F46 ${progress * 100}%)`,
              height: '4px',
              borderRadius: '2px',
            }}
          />
          <span className="text-xs text-muted w-8 tabular-nums">
            {formatDuration(Math.floor(duration))}
          </span>
        </div>
      </div>

      {/* Volume & Queue */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={toggleQueue}
          className={`transition-colors ${showQueue ? 'text-primary' : 'text-muted hover:text-white'}`}
        >
          <ListMusic size={18} />
        </button>

        <button onClick={toggleMute} className="text-muted hover:text-white transition-colors">
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={isMuted ? 0 : volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-20"
          style={{
            background: `linear-gradient(to right, white ${(isMuted ? 0 : volume) * 100}%, #3F3F46 ${(isMuted ? 0 : volume) * 100}%)`,
            height: '4px',
            borderRadius: '2px',
          }}
        />
      </div>
    </footer>
  );
};

export default Player;
