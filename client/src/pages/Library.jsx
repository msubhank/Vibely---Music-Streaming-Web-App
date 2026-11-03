import { Library as LibraryIcon, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Library = () => {
  const { user, openAuthModal } = useAuth();

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <LibraryIcon size={48} className="text-muted" />
        <h1 className="text-2xl font-bold text-white">Your Library</h1>
        <p className="text-muted max-w-xs">
          Sign in to access your playlists, liked songs, and listening history.
        </p>
        <button
          onClick={() => openAuthModal('signin')}
          className="btn-primary mt-2"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">My Library</h1>
        <button className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} />
          New Playlist
        </button>
      </div>

      {/* Coming soon placeholder */}
      <div className="flex flex-col items-center justify-center mt-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-elevated flex items-center justify-center mb-4">
          <LibraryIcon size={36} className="text-muted" />
        </div>
        <p className="text-lg font-semibold text-white">No playlists yet</p>
        <p className="text-muted text-sm mt-1">Create a playlist to get started</p>
        <button className="btn-primary mt-4 flex items-center gap-2">
          <Plus size={16} />
          Create Playlist
        </button>
      </div>
    </div>
  );
};

export default Library;
