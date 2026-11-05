import { NavLink } from 'react-router-dom';
import {
  Home, Search, Library, Heart, Clock, Plus, Music2, TrendingUp, LogIn, LogOut, Music
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import useLibraryStore from '../../store/libraryStore';

const navLinks = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/trending', icon: TrendingUp, label: 'Trending' },
];

const libraryLinks = [
  { to: '/library', icon: Library, label: 'My Library' },
  { to: '/liked', icon: Heart, label: 'Liked Songs' },
  { to: '/history', icon: Clock, label: 'Recently Played' },
];

const Sidebar = () => {
  const { user, profile, signOut, openAuthModal } = useAuth();
  const { playlists, openCreatePlaylistModal } = useLibraryStore();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out');
    } catch (err) {
      console.error(err);
      toast.error('Failed to sign out');
    }
  };

  return (
    <aside className="hidden sm:flex w-60 shrink-0 h-full bg-surface flex-col py-6 px-3 gap-6 overflow-y-auto no-scrollbar">
      {/* Logo */}
      <div className="px-3 mb-2 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Music2 size={18} className="text-white" />
        </div>
        <span className="text-xl font-bold text-gradient">Vibely</span>
      </div>

      {/* Main Nav */}
      <nav className="flex flex-col gap-1">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Library */}
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider px-3 mb-1">
          Your Library
        </p>
        {libraryLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}

        {/* User Playlists list */}
        {user && playlists.length > 0 && (
          <div className="flex flex-col gap-0.5 mt-2 pt-2 border-t border-border/40 max-h-36 overflow-y-auto no-scrollbar">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider px-3 mb-1">
              Playlists
            </p>
            {playlists.map((p) => (
              <NavLink
                key={p.id}
                to={`/playlist/${p.id}`}
                className={({ isActive }) =>
                  `sidebar-link py-1.5 text-xs ${isActive ? 'active text-primary' : ''}`
                }
              >
                <Music size={14} className="shrink-0 text-muted" />
                <span className="truncate">{p.name}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* Auth / Profile Footer */}
      <div className="mt-auto pt-3 border-t border-border flex flex-col gap-2">
        {user ? (
          <>
            <button
              onClick={openCreatePlaylistModal}
              className="sidebar-link"
            >
              <div className="w-5 h-5 bg-muted-fg rounded flex items-center justify-center">
                <Plus size={14} className="text-bg" />
              </div>
              Create Playlist
            </button>

            <div className="flex items-center justify-between p-2 rounded-xl bg-elevated/60">
              <div className="flex items-center gap-2.5 min-w-0">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name || user.email}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs shrink-0">
                    {(profile?.display_name || profile?.username || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {profile?.display_name || profile?.username || user.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-muted truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-1.5 text-muted hover:text-white hover:bg-elevated rounded-lg transition-colors shrink-0"
              >
                <LogOut size={15} />
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => openAuthModal('signin')}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl"
          >
            <LogIn size={16} />
            Sign In
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
