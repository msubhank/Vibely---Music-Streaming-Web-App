import { useState, useEffect } from 'react';
import { getTrendingTracks, AUDIUS_GENRES } from '../services/audiusService';
import TrackCard from '../components/music/TrackCard';

const SkeletonCard = () => (
  <div className="flex flex-col gap-3">
    <div className="skeleton w-full aspect-square rounded-lg" />
    <div className="skeleton h-4 w-3/4 rounded" />
    <div className="skeleton h-3 w-1/2 rounded" />
  </div>
);

const Home = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState('All');
  const [time, setTime] = useState('week');
  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setVisibleCount(24);
      try {
        const data = await getTrendingTracks(genre === 'All' ? '' : genre, time);
        setTracks(data || []);
      } catch (err) {
        console.error('Failed to load trending:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [genre, time]);

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">
          Good {getGreeting()} 👋
        </h1>
        <p className="text-muted">Discover what's trending right now</p>
      </div>

      {/* Genre Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        {AUDIUS_GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium shrink-0 transition-all duration-200
              ${genre === g
                ? 'bg-primary text-white'
                : 'bg-elevated text-muted-fg hover:text-white'
              }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Time Filter */}
      <div className="flex gap-2 mb-6">
        {[
          { val: 'week', label: 'This Week' },
          { val: 'month', label: 'This Month' },
          { val: 'allTime', label: 'All Time' },
        ].map(({ val, label }) => (
          <button
            key={val}
            onClick={() => setTime(val)}
            className={`text-sm px-3 py-1 rounded-lg transition-colors ${
              time === val ? 'text-white bg-elevated' : 'text-muted hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Track Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            🔥 Trending {genre === 'All' ? '' : genre} Tracks
          </h2>
          {!loading && tracks.length > 0 && (
            <span className="text-xs text-muted">
              Showing {Math.min(visibleCount, tracks.length)} of {tracks.length} tracks
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
            : tracks.slice(0, visibleCount).map((track) => (
                <TrackCard key={track.id} track={track} queue={tracks} />
              ))}
        </div>

        {/* Load More Button */}
        {!loading && tracks.length > visibleCount && (
          <div className="flex justify-center mt-8 mb-4">
            <button
              onClick={() => setVisibleCount((prev) => prev + 24)}
              className="px-6 py-2.5 rounded-full bg-elevated hover:bg-elevated/80 border border-border text-sm font-semibold text-white transition-colors"
            >
              Load More Tracks
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

export default Home;
