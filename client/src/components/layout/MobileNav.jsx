import { NavLink } from 'react-router-dom';
import { Home, Search, TrendingUp, Library } from 'lucide-react';

const mobileNavLinks = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/trending', icon: TrendingUp, label: 'Trending' },
  { to: '/library', icon: Library, label: 'Library' },
];

const MobileNav = () => {
  return (
    <nav className="sm:hidden flex items-center justify-around bg-surface border-t border-border/60 py-2 px-1 z-30 shrink-0">
      {mobileNavLinks.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
              isActive ? 'text-primary font-semibold' : 'text-muted hover:text-white'
            }`
          }
        >
          <Icon size={18} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileNav;

