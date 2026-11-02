import { NavLink } from 'react-router-dom';
import {
  Home, Search, Library, Heart, Clock, Plus, Music2, TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
  const { user, profile } = useAuth();

  return (
    <aside className="w-60 shrink-0 h-full bg-surface flex flex-col py-6 px-3 gap-6 overflow-y-auto no-scrollbar">
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
      </div>

      {/* Create playlist */}
      {user && (
        <button className="sidebar-link mt-auto">
          <div className="w-5 h-5 bg-muted-fg rounded flex items-center justify-center">
            <Plus size={14} className="text-bg" />
          </div>
          Create Playlist
        </button>
      )}
    </aside>
  );
};

export default Sidebar;
