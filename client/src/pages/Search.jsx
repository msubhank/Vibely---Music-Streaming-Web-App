import { useState } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { searchTracks, searchArtists } from '../services/audiusService';
import TrackCard from '../components/music/TrackCard';
import { getArtwork } from '../services/audiusService';
import usePlayerStore from '../store/playerStore';

const Search = () => {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [tab, setTab] = useState('tracks');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { playTrack } = usePlayerStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const [t, a] = await Promise.all([
        searchTracks(query),
        searchArtists(query),
      ]);
      setTracks(t || []);
      setArtists(a || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
      <h1 className="text-3xl font-bold text-white mb-6">Search</h1>

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
          placeholder="Search tracks, artists, playlists…"
          className="w-full bg-elevated border border-border rounded-full py-3 pl-11 pr-12 text-white placeholder-muted focus:outline-none focus:border-primary transition-colors"
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
        <div className="flex flex-col items-center justify-center mt-20 text-center">
          <SearchIcon size={48} className="text-muted mb-4" />
          <p className="text-lg text-muted-fg font-medium">Find your next favorite track</p>
          <p className="text-muted text-sm mt-1">Search songs, artists, or playlists from Audius</p>
        </div>
      )}

      {searched && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-elevated rounded-lg p-1 w-fit">
            {['tracks', 'artists'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                  tab === t ? 'bg-surface text-white shadow' : 'text-muted hover:text-white'
                }`}
              >
                {t} {t === 'tracks' ? `(${tracks.length})` : `(${artists.length})`}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="skeleton w-full aspect-square rounded-lg" />
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : tab === 'tracks' ? (
            tracks.length === 0 ? (
              <p className="text-muted text-center mt-12">No tracks found for "{query}"</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {tracks.map((track) => (
                  <TrackCard key={track.id} track={track} queue={tracks} />
                ))}
              </div>
            )
          ) : (
            artists.length === 0 ? (
              <p className="text-muted text-center mt-12">No artists found for "{query}"</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {artists.map((artist) => (
                  <div key={artist.id} className="card flex flex-col items-center text-center gap-3">
                    <img
                      src={getArtwork({ artwork: artist.profile_picture }, '480x480')}
                      alt={artist.name}
                      className="w-full aspect-square rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-white text-sm truncate w-full">{artist.name}</p>
                      <p className="text-xs text-muted">{artist.follower_count?.toLocaleString()} followers</p>
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
