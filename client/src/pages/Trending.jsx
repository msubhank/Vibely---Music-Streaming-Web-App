import { useState, useEffect } from 'react';
import { getTrendingTracks, formatDuration, getArtwork } from '../services/audiusService';
import { getSaavnTrending, SAAVN_CATEGORIES } from '../services/saavnService';
import { TrendingUp, Globe, Radio } from 'lucide-react';
import usePlayerStore from '../store/playerStore';

const Trending = () => {
  const [source, setSource] = useState('jiosaavn'); // 'jiosaavn' | 'audius'
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState('week');
  const [saavnCategory, setSaavnCategory] = useState('global');
  const { playTrack, currentTrack, isPlaying } = usePlayerStore();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (source === 'jiosaavn') {
          const data = await getSaavnTrending(saavnCategory, 50);
          setTracks(data || []);
        } else {
          const data = await getTrendingTracks('', time);
          setTracks(data || []);
        }
      } catch (err) {
        console.error('Trending fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [source, saavnCategory, time]);

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <TrendingUp size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Trending Charts</h1>
            <p className="text-xs text-muted mt-0.5">Top-ranked songs playing worldwide right now</p>
          </div>
        </div>

        {/* Music Source Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-elevated rounded-xl border border-border w-fit shrink-0">
          <button
            type="button"
            onClick={() => setSource('jiosaavn')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              source === 'jiosaavn'
                ? 'bg-primary text-white shadow'
                : 'text-muted hover:text-white'
            }`}
          >
            <Globe size={14} />
            <span>Global Hits (80M+)</span>
          </button>
          <button
            type="button"
            onClick={() => setSource('audius')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              source === 'audius'
                ? 'bg-primary text-white shadow'
                : 'text-muted hover:text-white'
            }`}
          >
            <Radio size={14} />
            <span>Indie Charts</span>
          </button>
        </div>
      </div>

      {/* Category or Time Filters */}
      <div className="mb-6 overflow-x-auto no-scrollbar pb-1">
        {source === 'jiosaavn' ? (
          <div className="flex gap-2">
            {SAAVN_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSaavnCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all border ${
                  saavnCategory === cat.id
                    ? 'bg-primary border-primary text-white shadow'
                    : 'bg-elevated border-border text-muted-fg hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex gap-1 bg-elevated rounded-lg p-1 w-fit">
            {[
              { val: 'week', label: 'This Week' },
              { val: 'month', label: 'This Month' },
              { val: 'allTime', label: 'All Time' },
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => setTime(val)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  time === val ? 'bg-surface text-white' : 'text-muted hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ranked list */}
      <div className="flex flex-col">
        {/* Header row */}
        <div className="track-row text-xs text-muted uppercase tracking-wider pb-2 border-b border-border mb-2 font-medium">
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
          : tracks.length === 0 ? (
              <div className="py-16 text-center text-muted text-sm">
                No trending tracks found for this selection. Try another category!
              </div>
            ) : (
              tracks.slice(0, 50).map((track, index) => (
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
              ))
            )}
      </div>
    </div>
  );
};

export default Trending;
