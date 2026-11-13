// YouTube Player Bridge
// Manages the hidden/floating YouTube IFrame player instance
// providing play, pause, seek, volume, and event callbacks for playerStore.

let ytPlayer = null;
let isYtReady = false;
let pendingVideoId = null;
let stateChangeCallback = null;

/**
 * Initialize YouTube IFrame API
 */
export const initYouTubePlayer = (containerId, onStateChange) => {
  stateChangeCallback = onStateChange;

  if (window.YT && window.YT.Player) {
    createPlayer(containerId);
    return;
  }

  // Load YouTube IFrame API script safely
  if (!document.getElementById('yt-iframe-api-script')) {
    const tag = document.createElement('script');
    tag.id = 'yt-iframe-api-script';
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }

  window.onYouTubeIframeAPIReady = () => {
    createPlayer(containerId);
  };
};

const createPlayer = (containerId) => {
  if (ytPlayer) return;

  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    ytPlayer = new window.YT.Player(containerId, {
      height: '100%',
      width: '100%',
      playerVars: {
        autoplay: 1,
        controls: 1,
        enablejsapi: 1,
        fs: 1,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: () => {
          isYtReady = true;
          if (pendingVideoId) {
            playYtVideo(pendingVideoId);
            pendingVideoId = null;
          }
        },
        onStateChange: (event) => {
          if (stateChangeCallback) {
            stateChangeCallback(event.data, ytPlayer);
          }
        },
        onError: (event) => {
          console.warn('YouTube Player Event code:', event.data);
          if (stateChangeCallback) {
            stateChangeCallback(-1, ytPlayer, event.data);
          }
        },
      },
    });
  } catch (err) {
    console.error('Error creating YouTube player:', err);
  }
};

/**
 * Play a YouTube video by ID with optional suggested quality
 * ('small' for background audio to save battery/data, 'hd720' for visible video)
 */
export const playYtVideo = (videoId, quality = 'small') => {
  if (!videoId) return;

  if (!isYtReady || !ytPlayer || typeof ytPlayer.loadVideoById !== 'function') {
    pendingVideoId = videoId;
    return;
  }

  try {
    ytPlayer.loadVideoById({
      videoId,
      startSeconds: 0,
      suggestedQuality: quality,
    });
    ytPlayer.playVideo();
    setYtQuality(quality);
  } catch (err) {
    console.error('Failed to play YouTube video:', err);
  }
};

/**
 * Switch playback quality ('small' / 144p for battery savings, 'hd720' for crisp video)
 */
export const setYtQuality = (quality = 'small') => {
  if (ytPlayer && typeof ytPlayer.setPlaybackQuality === 'function') {
    try {
      ytPlayer.setPlaybackQuality(quality);
    } catch {}
  }
};

/**
 * Pause YouTube video
 */
export const pauseYtVideo = () => {
  if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
    try {
      ytPlayer.pauseVideo();
    } catch {}
  }
};

/**
 * Resume YouTube video
 */
export const resumeYtVideo = () => {
  if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
    try {
      ytPlayer.playVideo();
    } catch {}
  }
};

/**
 * Stop YouTube video
 */
export const stopYtVideo = () => {
  if (ytPlayer && typeof ytPlayer.stopVideo === 'function') {
    try {
      ytPlayer.stopVideo();
    } catch {}
  }
};

/**
 * Seek to specific seconds
 */
export const seekYtVideo = (seconds) => {
  if (ytPlayer && typeof ytPlayer.seekTo === 'function') {
    try {
      ytPlayer.seekTo(seconds, true);
    } catch {}
  }
};

/**
 * Set YouTube volume (0 to 1)
 */
export const setYtVolume = (volume, isMuted = false) => {
  if (ytPlayer) {
    try {
      if (isMuted) {
        if (typeof ytPlayer.mute === 'function') ytPlayer.mute();
      } else {
        if (typeof ytPlayer.unMute === 'function') ytPlayer.unMute();
        if (typeof ytPlayer.setVolume === 'function') {
          ytPlayer.setVolume(Math.round(volume * 100));
        }
      }
    } catch {}
  }
};

/**
 * Get current playback time & duration
 */
export const getYtPlaybackState = () => {
  if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
    try {
      const current = ytPlayer.getCurrentTime() || 0;
      const duration = ytPlayer.getDuration() || 0;
      return { current, duration };
    } catch {
      return { current: 0, duration: 0 };
    }
  }
  return { current: 0, duration: 0 };
};
