import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import useLibraryStore from './store/libraryStore';
import Sidebar from './components/layout/Sidebar';
import Player from './components/layout/Player';
import AuthModal from './components/auth/AuthModal';
import CreatePlaylistModal from './components/library/CreatePlaylistModal';
import AddToPlaylistModal from './components/library/AddToPlaylistModal';
import QueueDrawer from './components/layout/QueueDrawer';
import MobileNav from './components/layout/MobileNav';
import YouTubeFloatingPlayer from './components/player/YouTubeFloatingPlayer';
import Home from './pages/Home';
import Search from './pages/Search';
import Trending from './pages/Trending';
import Library from './pages/Library';
import PlaylistDetail from './pages/PlaylistDetail';
import ArtistDetail from './pages/ArtistDetail';

function AppLayout() {
  const { user } = useAuth();
  const { loadUserLibrary } = useLibraryStore();

  useEffect(() => {
    loadUserLibrary(user?.id);
  }, [user?.id, loadUserLibrary]);

  return (
    <div className="flex flex-col h-screen bg-bg text-white overflow-hidden">
      {/* Main layout: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        {/* Page content */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/library" element={<Library />} />
            <Route path="/liked" element={<Library />} />
            <Route path="/history" element={<Library />} />
            <Route path="/playlist/:id" element={<PlaylistDetail />} />
            <Route path="/artist/:id" element={<ArtistDetail />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Persistent player bar */}
      <Player />

      {/* Global Modals & Drawers */}
      <AuthModal />
      <CreatePlaylistModal />
      <AddToPlaylistModal />
      <QueueDrawer />
      <YouTubeFloatingPlayer />

      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#27272A',
            color: '#fff',
            border: '1px solid #3F3F46',
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
