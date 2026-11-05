import { useState, useEffect } from 'react';
import { Globe, Radio, Sparkles, RefreshCw } from 'lucide-react';
import { getTrendingTracks, AUDIUS_GENRES } from '../services/audiusService';
import { getSaavnTrending, SAAVN_CATEGORIES } from '../services/saavnService';
import TrackCard from '../components/music/TrackCard';

const SkeletonCard = () => (
  <div className="flex flex-col gap-3">
    <div className="skeleton w-full aspect-square rounded-lg" />
    <div className="skeleton h-4 w-3/4 rounded" />
    <div className="skeleton h-3 w-1/2 rounded" />
  </div>
);

const Home = () => {
  const [source, setSource] = useState('jiosaavn'); // 'jiosaavn' | 'audius'
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saavnCategory, setSaavnCategory] = useState('global');
  const [genre, setGenre] = useState('All');
  const [time, setTime] = useState('week');
  const [visibleCount, setVisibleCount] = useState(24);
  const [error, setError] = useState(null);

  const loadTracks = async () => {
    setLoading(true);
    setError(null);
    setVisibleCount(24);
    try {
      if (source === 'jiosaavn') {
        const data = await getSaavnTrending(saavnCategory, 50);
        setTracks(data || []);
      } else {
        const data = await getTrendingTracks(genre === 'All' ? '' : genre, time);
        setTracks(data || []);
      }
    } catch (err) {
      console.error('Failed to load tracks:', err);
      setError('Could not load tracks right now. Please try again or switch sources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTracks();
  }, [source, saavnCategory, genre, time]);

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      {/* Hero Header with Source Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-1">
            Good {getGreeting()} 👋
          </h1>
          <p className="text-muted text-sm">
            {source === 'jiosaavn'
              ? '80M+ Billboard, Pop, Hip-Hop & Global Chartbusters'
              : 'Decentralized Indie, Electronic & Community Beats'}
          </p>
        </div>

        {/* Music Source Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-elevated rounded-xl border border-border w-fit shrink-0">
          <button
            type="button"
            onClick={() => setSource('jiosaavn')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              source === 'audius'
                ? 'bg-primary text-white shadow'
                : 'text-muted hover:text-white'
            }`}
          >
            <Radio size={14} />
            <span>Indie & Remixes</span>
          </button>
        </div>
      </div>

      {/* Categories / Genre Filters */}
      {source === 'jiosaavn' ? (
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          {SAAVN_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSaavnCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all duration-200 border ${
                saavnCategory === cat.id
                  ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                  : 'bg-elevated border-border text-muted-fg hover:text-white hover:border-muted'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
            {AUDIUS_GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all duration-200 border ${
                  genre === g
                    ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                    : 'bg-elevated border-border text-muted-fg hover:text-white hover:border-muted'
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
                className={`text-xs px-3 py-1 rounded-lg transition-colors font-medium ${
                  time === val ? 'text-white bg-elevated' : 'text-muted hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Track Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <h2 className="text-xl font-bold text-white">
              {source === 'jiosaavn'
                ? SAAVN_CATEGORIES.find((c) => c.id === saavnCategory)?.label || 'Trending Tracks'
                : `Trending ${genre === 'All' ? '' : genre} Tracks`}
            </h2>
          </div>
          {!loading && tracks.length > 0 && (
            <span className="text-xs text-muted">
              Showing {Math.min(visibleCount, tracks.length)} of {tracks.length} tracks
            </span>
          )}
        </div>

        {error && !loading && (
          <div className="p-8 text-center bg-elevated/40 border border-border rounded-2xl my-6">
            <p className="text-sm text-red-400 mb-3">{error}</p>
            <button
              onClick={loadTracks}
              className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover inline-flex items-center gap-2"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

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
