import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, X, Globe, Radio, Sparkles } from 'lucide-react';
import { searchTracks, searchArtists } from '../services/audiusService';
import { searchSaavnTracks, searchSaavnArtists } from '../services/saavnService';
import TrackCard from '../components/music/TrackCard';
import { getArtwork } from '../services/audiusService';
import usePlayerStore from '../store/playerStore';

const QUICK_SEARCH_CHIPS = [
  'The Weeknd',
  'Taylor Swift',
  'Coldplay',
  'Drake',
  'Dua Lipa',
  'Arijit Singh',
  'Billie Eilish',
  'Ed Sheeran',
  'Bruno Mars',
  'Eminem',
];

const Search = () => {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [tab, setTab] = useState('tracks');
  const [source, setSource] = useState('jiosaavn'); // 'jiosaavn' | 'audius'
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { playTrack } = usePlayerStore();
  const navigate = useNavigate();

  const executeSearch = async (searchQuery, musicSource = source) => {
    if (!searchQuery?.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      if (musicSource === 'jiosaavn') {
        const [t, a] = await Promise.all([
          searchSaavnTracks(searchQuery, 1, 40),
          searchSaavnArtists(searchQuery, 1, 20),
        ]);
        setTracks(t || []);
        setArtists(a || []);
      } else {
        const [t, a] = await Promise.all([
          searchTracks(searchQuery, 40),
          searchArtists(searchQuery, 20),
        ]);
        setTracks(t || []);
        setArtists(a || []);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    executeSearch(query, source);
  };

  const handleChipClick = (chip) => {
    setQuery(chip);
    executeSearch(chip, source);
  };

  const handleSourceChange = (newSource) => {
    setSource(newSource);
    if (query.trim()) {
      executeSearch(query, newSource);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setTracks([]);
    setArtists([]);
    setSearched(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Search</h1>
          <p className="text-xs text-muted mt-1">Discover tracks, artists, and global hits</p>
        </div>

        {/* Music Source Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-elevated rounded-xl border border-border w-fit">
          <button
            type="button"
            onClick={() => handleSourceChange('jiosaavn')}
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
            onClick={() => handleSourceChange('audius')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative mb-6">
        <SearchIcon
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            source === 'jiosaavn'
              ? 'Search any mainstream song, album, or artist (e.g. The Weeknd, Drake, Coldplay)...'
              : 'Search indie tracks, remixes, and beats on Audius...'
          }
          className="w-full bg-elevated border border-border rounded-full py-3.5 pl-11 pr-12 text-sm text-white placeholder-muted focus:outline-none focus:border-primary transition-colors shadow-inner"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </form>

      {!searched && (
        <div className="flex flex-col items-center justify-center mt-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-elevated flex items-center justify-center text-primary mb-4">
            <SearchIcon size={32} />
          </div>
          <p className="text-lg text-white font-bold">Find your next favorite track</p>
          <p className="text-muted text-xs mt-1 max-w-sm mb-6">
            {source === 'jiosaavn'
              ? 'Search through 80+ million high-quality global hits from top artists around the world.'
              : 'Search decentralized, community-uploaded tracks and electronic remixes.'}
          </p>

          {/* Quick Search Chips */}
          <div className="max-w-xl">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
              Popular Searches
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_SEARCH_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleChipClick(chip)}
                  className="px-3.5 py-1.5 rounded-full bg-elevated hover:bg-elevated/70 border border-border text-xs text-muted-fg hover:text-white transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {searched && (
        <>
          {/* Tabs */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-1 bg-elevated rounded-lg p-1 w-fit">
              {['tracks', 'artists'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold capitalize transition-all ${
                    tab === t ? 'bg-surface text-white shadow' : 'text-muted hover:text-white'
                  }`}
                >
                  {t} {t === 'tracks' ? `(${tracks.length})` : `(${artists.length})`}
                </button>
              ))}
            </div>

            <span className="text-xs text-muted">
              Source: {source === 'jiosaavn' ? 'JioSaavn Global' : 'Audius Indie'}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="skeleton w-full aspect-square rounded-lg" />
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : tab === 'tracks' ? (
            tracks.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-muted text-sm">No tracks found for "{query}"</p>
                <p className="text-xs text-muted-fg mt-1">
                  Try switching the source to {source === 'jiosaavn' ? 'Indie (Audius)' : 'Global Hits (JioSaavn)'}.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {tracks.map((track) => (
                  <TrackCard key={track.id} track={track} queue={tracks} />
                ))}
              </div>
            )
          ) : (
            artists.length === 0 ? (
              <p className="text-muted text-center mt-12 text-sm">No artists found for "{query}"</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {artists.map((artist) => (
                  <div
                    key={artist.id}
                    onClick={() => {
                      if (artist.source === 'audius') {
                        navigate(`/artist/${artist.id}`);
                      } else {
                        // For JioSaavn artists, trigger search on their name
                        setQuery(artist.name);
                        setTab('tracks');
                        executeSearch(artist.name, 'jiosaavn');
                      }
                    }}
                    className="card flex flex-col items-center text-center gap-3 cursor-pointer hover:border-primary/50 hover:scale-[1.02] transition-all"
                  >
                    <img
                      src={getArtwork({ artwork: artist.profile_picture }, '480x480')}
                      alt={artist.name}
                      className="w-full aspect-square rounded-full object-cover shadow-lg"
                    />
                    <div className="w-full min-w-0">
                      <p className="font-semibold text-white text-sm truncate w-full group-hover:text-primary transition-colors">
                        {artist.name}
                      </p>
                      {artist.follower_count ? (
                        <p className="text-xs text-muted">
                          {artist.follower_count.toLocaleString()} followers
                        </p>
                      ) : (
                        <p className="text-xs text-primary font-medium">View Tracks</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default Search;
