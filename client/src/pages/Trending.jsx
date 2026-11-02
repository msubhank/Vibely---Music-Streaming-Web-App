import { useState, useEffect } from 'react';
import { getTrendingTracks, AUDIUS_GENRES, formatDuration, getArtwork } from '../services/audiusService';
import TrackCard from '../components/music/TrackCard';
import { TrendingUp } from 'lucide-react';
import usePlayerStore from '../store/playerStore';

const Trending = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState('week');
  const { playTrack, currentTrack, isPlaying } = usePlayerStore();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getTrendingTracks('', time);
        setTracks(data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [time]);

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp size={28} className="text-primary" />
          <h1 className="text-3xl font-bold text-white">Trending</h1>
        </div>

        <div className="flex gap-1 bg-elevated rounded-lg p-1">
          {[
            { val: 'week', label: 'Week' },
            { val: 'month', label: 'Month' },
            { val: 'allTime', label: 'All Time' },
          ].map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setTime(val)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                time === val ? 'bg-surface text-white' : 'text-muted hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Ranked list */}
      <div className="flex flex-col">
        {/* Header row */}
        <div className="track-row text-xs text-muted uppercase tracking-wider pb-2 border-b border-border mb-2">
          <span>#</span>
          <span>Title</span>
          <span className="hidden md:block">Album</span>
          <span className="text-right">Duration</span>
        </div>

        {loading
          ? Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-2 px-4">
                <div className="skeleton w-4 h-4 rounded" />
                <div className="skeleton w-10 h-10 rounded" />
                <div className="flex flex-col gap-1 flex-1">
                  <div className="skeleton h-3.5 w-40 rounded" />
                  <div className="skeleton h-3 w-24 rounded" />
                </div>
              </div>
            ))
          : tracks.slice(0, 50).map((track, index) => (
              <div
                key={track.id}
                onClick={() => playTrack(track, tracks)}
                className={`track-row group cursor-pointer ${
                  currentTrack?.id === track.id ? 'bg-elevated/60' : ''
                }`}
              >
                <span className={`text-sm font-medium ${
                  currentTrack?.id === track.id ? 'text-primary' : 'text-muted'
                }`}>
                  {currentTrack?.id === track.id && isPlaying ? (
                    <span className="flex gap-0.5 items-end h-4">
                      <span className="w-0.5 bg-primary animate-eq-1 rounded-full" />
                      <span className="w-0.5 bg-primary animate-eq-2 rounded-full" />
                      <span className="w-0.5 bg-primary animate-eq-3 rounded-full" />
                    </span>
                  ) : index + 1}
                </span>

                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={getArtwork(track, '150x150')}
                    alt={track.title}
                    className="w-10 h-10 rounded object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      currentTrack?.id === track.id ? 'text-primary' : 'text-white'
                    }`}>
                      {track.title}
                    </p>
                    <p className="text-xs text-muted truncate">{track.user?.name}</p>
                  </div>
                </div>

                <p className="text-sm text-muted truncate hidden md:block">
                  {track.album?.album_name || '—'}
                </p>
                <p className="text-sm text-muted text-right tabular-nums">
                  {formatDuration(track.duration)}
                </p>
              </div>
            ))}
      </div>
    </div>
  );
};

export default Trending;
