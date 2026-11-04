import { useState } from 'react';
import { X, Plus, Music, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import useLibraryStore from '../../store/libraryStore';
import { getArtwork } from '../../services/audiusService';

const AddToPlaylistModal = () => {
  const { user, openAuthModal } = useAuth();
  const {
    isAddToPlaylistOpen,
    trackToAddToPlaylist,
    closeAddToPlaylistModal,
    playlists,
    addTrackToPlaylist,
    openCreatePlaylistModal,
  } = useLibraryStore();

  const [addingToId, setAddingToId] = useState(null);

  if (!isAddToPlaylistOpen || !trackToAddToPlaylist) return null;

  const trackArtwork = typeof trackToAddToPlaylist.artwork === 'string'
    ? trackToAddToPlaylist.artwork
    : getArtwork(trackToAddToPlaylist, '150x150');

  const handleSelectPlaylist = async (playlist) => {
    if (!user) {
      closeAddToPlaylistModal();
      openAuthModal('signin');
      return;
    }

    setAddingToId(playlist.id);
    try {
      await addTrackToPlaylist(playlist.id, trackToAddToPlaylist);
      toast.success(`Added to "${playlist.name}"! 🎵`);
      closeAddToPlaylistModal();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to add track to playlist');
    } finally {
      setAddingToId(null);
    }
  };

  const handleCreateNew = () => {
    closeAddToPlaylistModal();
    openCreatePlaylistModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={closeAddToPlaylistModal}
    >
      <div
        className="relative w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAddToPlaylistModal}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-muted hover:text-white hover:bg-elevated transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Track preview */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-border pr-8">
          <img
            src={trackArtwork}
            alt={trackToAddToPlaylist.title}
            className="w-12 h-12 rounded-lg object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs text-primary font-semibold uppercase tracking-wider">
              Add to Playlist
            </p>
            <p className="text-sm font-semibold text-white truncate">
              {trackToAddToPlaylist.title || trackToAddToPlaylist.track_title}
            </p>
            <p className="text-xs text-muted truncate">
              {trackToAddToPlaylist.user?.name || trackToAddToPlaylist.artist_name}
            </p>
          </div>
        </div>

        {/* Playlists List */}
        <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-1.5 no-scrollbar my-2">
          {playlists.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-elevated text-muted mx-auto flex items-center justify-center mb-2">
                <Music size={20} />
              </div>
              <p className="text-sm font-semibold text-white">No playlists yet</p>
              <p className="text-xs text-muted mt-0.5">Create your first playlist below</p>
            </div>
          ) : (
            playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => handleSelectPlaylist(playlist)}
                disabled={addingToId === playlist.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-elevated/70 transition-colors text-left group w-full"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-elevated border border-border flex items-center justify-center shrink-0 text-muted group-hover:text-primary transition-colors">
                    <Music size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-primary transition-colors">
                      {playlist.name}
                    </p>
                    <p className="text-xs text-muted">
                      {playlist.track_count || 0} {playlist.track_count === 1 ? 'track' : 'tracks'}
                    </p>
                  </div>
                </div>

                {addingToId === playlist.id ? (
                  <Loader2 size={16} className="text-primary animate-spin shrink-0" />
                ) : (
                  <Plus size={16} className="text-muted group-hover:text-white transition-colors shrink-0" />
                )}
              </button>
            ))
          )}
        </div>

        {/* Create New Button */}
        <div className="pt-3 border-t border-border mt-auto">
          <button
            onClick={handleCreateNew}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl"
          >
            <Plus size={16} />
            Create New Playlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;

