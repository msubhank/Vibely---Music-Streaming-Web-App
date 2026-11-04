import { useState, useEffect } from 'react';
import { X, Music, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import useLibraryStore from '../../store/libraryStore';

const CreatePlaylistModal = () => {
  const { user, openAuthModal } = useAuth();
  const { isCreatePlaylistOpen, closeCreatePlaylistModal, createPlaylist } = useLibraryStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCreatePlaylistOpen) {
        closeCreatePlaylistModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreatePlaylistOpen, closeCreatePlaylistModal]);

  // Reset fields when closing
  useEffect(() => {
    if (!isCreatePlaylistOpen) {
      setName('');
      setDescription('');
      setIsSubmitting(false);
    }
  }, [isCreatePlaylistOpen]);

  if (!isCreatePlaylistOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      closeCreatePlaylistModal();
      openAuthModal('signin');
      return;
    }

    if (!name.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPlaylist(user.id, {
        name: name.trim(),
        description: description.trim(),
      });
      toast.success(`Playlist "${name.trim()}" created! 🎵`);
      closeCreatePlaylistModal();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to create playlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={closeCreatePlaylistModal}
    >
      <div
        className="relative w-full max-w-md bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeCreatePlaylistModal}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-muted hover:text-white hover:bg-elevated transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center">
            <Music size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Create Playlist</h2>
            <p className="text-xs text-muted">Build a collection of your favorite tunes</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-fg mb-1">
              Playlist Name <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Late Night Vibes, Workout Mix"
              maxLength={60}
              required
              autoFocus
              className="w-full bg-elevated border border-border rounded-xl py-2.5 px-4 text-sm text-white placeholder-muted focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-fg mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's the vibe of this playlist?"
              rows={3}
              maxLength={200}
              className="w-full bg-elevated border border-border rounded-xl py-2.5 px-4 text-sm text-white placeholder-muted focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={closeCreatePlaylistModal}
              className="px-4 py-2 text-sm font-medium text-muted hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="btn-primary flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlaylistModal;

