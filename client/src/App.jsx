import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Player from './components/layout/Player';
import Home from './pages/Home';
import Search from './pages/Search';
import Trending from './pages/Trending';
import Library from './pages/Library';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
              </Routes>
            </main>
          </div>

          {/* Persistent player bar */}
          <Player />
        </div>

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
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
