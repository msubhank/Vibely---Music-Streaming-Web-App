import { Music2, LogIn, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const MobileHeader = () => {
  const { user, profile, signOut, openAuthModal } = useAuth();

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
    <header className="sm:hidden flex items-center justify-between px-4 py-2.5 bg-surface border-b border-border/60 z-30 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
          <Music2 size={16} className="text-white" />
        </div>
        <span className="text-lg font-bold text-gradient">Vibely</span>
      </div>

      {/* Account / Auth */}
      {user ? (
        <div className="flex items-center gap-2">
          {/* User info pill */}
          <div className="flex items-center gap-2 bg-elevated/70 py-1 px-2.5 rounded-full border border-border/50 max-w-[160px]">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name || user.email}
                className="w-5 h-5 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-[10px] shrink-0">
                {(profile?.display_name || profile?.username || user.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <span className="text-xs font-medium text-white truncate">
              {profile?.display_name || profile?.username || user.email?.split('@')[0]}
            </span>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            title="Sign Out"
            className="p-1.5 text-muted hover:text-white hover:bg-elevated rounded-lg transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => openAuthModal('signin')}
          className="btn-primary flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-lg shadow-sm"
        >
          <LogIn size={14} />
          <span>Sign In</span>
        </button>
      )}
    </header>
  );
};

export default MobileHeader;
