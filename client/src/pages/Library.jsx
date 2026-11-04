import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Library as LibraryIcon, Plus, Heart, Clock, Play, Music
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useLibraryStore from '../store/libraryStore';
import usePlayerStore from '../store/playerStore';
import { formatDuration } from '../services/audiusService';

const Library = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const {
    playlists,
    likedTracks,
    recentlyPlayed,
    openCreatePlaylistModal,
    toggleLike,
  } = useLibraryStore();
  const { playTrack, currentTrack, isPlaying } = usePlayerStore();

  const getTabFromPath = () => {
    if (location.pathname === '/liked') return 'liked';
    if (location.pathname === '/history') return 'history';
    return 'playlists';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-elevated flex items-center justify-center text-primary mb-2 shadow-inner">
          <LibraryIcon size={40} />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Your Library</h1>
        <p className="text-muted max-w-sm text-sm">
          Sign in to create playlists, save your favorite tracks with the heart icon, and track your listening history.
        </p>
        <button
          onClick={() => openAuthModal('signin')}
          className="btn-primary mt-2 px-6 py-2.5 font-semibold text-sm rounded-xl"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  // Playable format for liked songs
  const playableLiked = likedTracks.map((t) => ({
    id: t.audius_track_id,
    title: t.track_title,
    duration: t.duration,
    artwork: { '480x480': t.artwork_url, '150x150': t.artwork_url },
    user: { name: t.artist_name },
  }));

  // Playable format for history
  const playableHistory = recentlyPlayed.map((t) => ({
    id: t.audius_track_id,
    title: t.track_title,
    duration: t.duration || 0,
    artwork: { '480x480': t.artwork_url, '150x150': t.artwork_url },
    user: { name: t.artist_name },
  }));

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Your Library</h1>
          <p className="text-xs text-muted mt-1">Manage your music, playlists, and favorites</p>
        </div>

        <button
          onClick={openCreatePlaylistModal}
          className="btn-primary flex items-center gap-2 text-sm px-4 py-2 rounded-xl shrink-0"
        >
          <Plus size={16} />
          New Playlist
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-elevated p-1 rounded-xl w-fit">
        {[
          { id: 'playlists', label: 'Playlists', icon: Music, count: playlists.length },
          { id: 'liked', label: 'Liked Songs', icon: Heart, count: likedTracks.length },
          { id: 'history', label: 'History', icon: Clock, count: recentlyPlayed.length },
        ].map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => {
              setActiveTab(id);
              if (id === 'playlists') navigate('/library');
              if (id === 'liked') navigate('/liked');
              if (id === 'history') navigate('/history');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === id
                ? 'bg-surface text-white shadow'
                : 'text-muted hover:text-white'
            }`}
          >
            <Icon size={16} className={id === 'liked' && activeTab === id ? 'text-accent' : ''} />
            <span>{label}</span>
            <span className="text-xs opacity-60">({count})</span>
          </button>
        ))}
      </div>

      {/* Tab: Playlists */}
      {activeTab === 'playlists' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {/* Liked Songs Featured Card */}
          <div
            onClick={() => {
              setActiveTab('liked');
              navigate('/liked');
            }}
            className="card group cursor-pointer bg-gradient-to-br from-primary/80 to-accent/90 p-4 flex flex-col justify-between col-span-2 aspect-[2/1] rounded-2xl shadow-xl hover:scale-[1.02] transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <Heart size={20} fill="currentColor" />
            </div>
            <div>
              <p className="text-xl font-bold text-white mb-0.5">Liked Songs</p>
              <p className="text-xs text-white/80">
                {likedTracks.length} {likedTracks.length === 1 ? 'favorite track' : 'favorite tracks'}
              </p>
            </div>
          </div>

          {/* Create New Card */}
          <div
            onClick={openCreatePlaylistModal}
            className="card flex flex-col items-center justify-center text-center gap-3 border-dashed border-2 border-border/80 hover:border-primary/60 cursor-pointer min-h-[190px] group transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-elevated group-hover:bg-primary group-hover:text-white text-muted transition-colors flex items-center justify-center">
              <Plus size={24} />
            </div>
            <p className="text-sm font-semibold text-white">Create Playlist</p>
          </div>

          {/* User Playlists */}
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => navigate(`/playlist/${playlist.id}`)}
              className="card group cursor-pointer flex flex-col gap-3"
            >
              <div className="relative aspect-square w-full rounded-xl bg-gradient-to-br from-elevated to-surface border border-border flex items-center justify-center overflow-hidden">
                {playlist.cover_url ? (
                  <img
                    src={playlist.cover_url}
                    alt={playlist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <Music size={32} className="text-muted group-hover:text-primary transition-colors" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white text-sm truncate group-hover:text-primary transition-colors">
                  {playlist.name}
                </p>
                <p className="text-xs text-muted truncate">
                  {playlist.track_count || 0} {playlist.track_count === 1 ? 'track' : 'tracks'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Liked Songs */}
      {activeTab === 'liked' && (
        <div>
          {likedTracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-elevated flex items-center justify-center mb-4 text-accent">
                <Heart size={32} />
              </div>
              <p className="text-lg font-semibold text-white">No liked songs yet</p>
              <p className="text-sm text-muted mt-1 max-w-xs">
                Tap the heart on any song to save it to your favorites.
              </p>
              <button
                onClick={() => navigate('/trending')}
                className="btn-primary mt-4 text-sm"
              >
                Discover Music
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => playTrack(playableLiked[0], playableLiked)}
                  className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg"
                >
                  <Play size={18} fill="currentColor" /> Play All
                </button>
                <span className="text-xs text-muted">
                  {likedTracks.length} {likedTracks.length === 1 ? 'song' : 'songs'}
                </span>
              </div>

              {/* Table */}
              <div className="flex flex-col">
                <div className="track-row text-xs text-muted uppercase tracking-wider pb-2 border-b border-border mb-2">
                  <span>#</span>
                  <span>Title</span>
                  <span className="hidden md:block">Artist</span>
                  <span className="text-right">Action</span>
                </div>

                {likedTracks.map((track, idx) => {
                  const isPlayingThis = currentTrack?.id === track.audius_track_id && isPlaying;

                  return (
                    <div
                      key={track.id || track.audius_track_id}
                      onClick={() => playTrack(playableLiked[idx], playableLiked)}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(user.id, { id: track.audius_track_id });
                          }}
                          title="Remove from Liked Songs"
                          className="text-accent hover:scale-110 transition-transform"
                        >
                          <Heart size={16} fill="currentColor" />
                        </button>
                        <span className="text-sm text-muted tabular-nums">
                          {formatDuration(track.duration)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: History */}
      {activeTab === 'history' && (
        <div>
          {recentlyPlayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-elevated flex items-center justify-center mb-4 text-muted">
                <Clock size={32} />
              </div>
              <p className="text-lg font-semibold text-white">No listening history yet</p>
              <p className="text-sm text-muted mt-1 max-w-xs">
                Songs you stream will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="track-row text-xs text-muted uppercase tracking-wider pb-2 border-b border-border mb-2">
                <span>#</span>
                <span>Title</span>
                <span className="hidden md:block">Artist</span>
                <span className="text-right">Played</span>
              </div>

              {recentlyPlayed.map((track, idx) => {
                const isPlayingThis = currentTrack?.id === track.audius_track_id && isPlaying;

                return (
                  <div
                    key={`${track.audius_track_id}-${track.played_at || idx}`}
                    onClick={() => playTrack(playableHistory[idx], playableHistory)}
                    className={`track-row group cursor-pointer ${
                      currentTrack?.id === track.audius_track_id ? 'bg-elevated/60' : ''
                    }`}
                  >
                    <span className="text-sm text-muted">{idx + 1}</span>

                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={track.artwork_url || '/placeholder-art.png'}
                        alt={track.track_title}
                        className="w-10 h-10 rounded object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          isPlayingThis ? 'text-primary' : 'text-white'
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

                    <p className="text-xs text-muted text-right">
                      {track.played_at ? new Date(track.played_at).toLocaleDateString() : 'Recent'}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Library;
