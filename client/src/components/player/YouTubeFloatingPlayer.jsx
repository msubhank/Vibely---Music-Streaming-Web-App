import { useEffect, useRef } from 'react';
import { X, Tv, Maximize2, ExternalLink } from 'lucide-react';
import usePlayerStore from '../../store/playerStore';

const YouTubeFloatingPlayer = () => {
  const containerRef = useRef(null);
  const isInitialized = useRef(false);

  const {
    currentTrack,
    showVideo,
    toggleVideo,
    initYouTube,
  } = usePlayerStore();

  const isYt =
    currentTrack?.source === 'youtube' ||
    String(currentTrack?.id || '').startsWith('yt_') ||
    Boolean(currentTrack?.videoId);

  useEffect(() => {
    if (!isInitialized.current && containerRef.current) {
      isInitialized.current = true;

      // Create an isolated mount div so React Virtual DOM never touches YouTube's iframe
      let mountEl = document.getElementById('vibely-yt-mount');
      if (!mountEl) {
        mountEl = document.createElement('div');
        mountEl.id = 'vibely-yt-mount';
        mountEl.style.width = '100%';
        mountEl.style.height = '100%';
        containerRef.current.appendChild(mountEl);
      }

      initYouTube('vibely-yt-mount');
    }
  }, [initYouTube]);

  const videoId =
    currentTrack?.videoId ||
    currentTrack?.rawId ||
    String(currentTrack?.id || '').replace('yt_', '');

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ease-out ${
        showVideo && isYt
          ? 'bottom-24 right-4 sm:right-6 w-[340px] sm:w-[420px] opacity-100 scale-100 pointer-events-auto'
          : 'fixed -left-[9999px] -top-[9999px] w-[340px] opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-surface/95 backdrop-blur-md rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col">
        {/* Floating Player Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-elevated/80 border-b border-border/60">
          <div className="flex items-center gap-2 min-w-0">
            <Tv size={14} className="text-red-500 shrink-0" />
            <span className="text-xs font-semibold text-white truncate max-w-[200px]">
              {currentTrack?.title || 'YouTube Video'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {videoId && (
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noreferrer"
                title="Open on YouTube"
                className="p-1 rounded-md text-muted hover:text-white transition-colors"
              >
                <ExternalLink size={13} />
              </a>
            )}
            <button
              onClick={toggleVideo}
              title="Close Video (Audio Still Plays)"
              className="p-1 rounded-md text-muted hover:text-white hover:bg-surface transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Video Canvas Container (Fixed 16:9 Aspect Ratio) */}
        <div
          ref={containerRef}
          className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden"
        >
          {/* YouTube IFrame will mount here */}
        </div>

        {/* Footer info pill */}
        <div className="px-3 py-1.5 bg-surface text-[11px] text-muted flex items-center justify-between">
          <span className="truncate">{currentTrack?.user?.name || 'YouTube Music'}</span>
          <span className="text-[10px] text-primary font-medium shrink-0">Now Playing</span>
        </div>
      </div>
    </div>
  );
};

export default YouTubeFloatingPlayer;

