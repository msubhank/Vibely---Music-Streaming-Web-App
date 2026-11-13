import { create } from 'zustand';
import { Howl } from 'howler';
import toast from 'react-hot-toast';
import { getStreamUrl } from '../services/audiusService';
import { getSaavnTrackById } from '../services/saavnService';
import {
  initYouTubePlayer,
  playYtVideo,
  pauseYtVideo,
  resumeYtVideo,
  stopYtVideo,
  seekYtVideo,
  setYtVolume,
  setYtQuality,
  getYtPlaybackState,
} from '../services/youtubePlayerBridge';
import { supabase } from '../services/supabaseClient';
import useLibraryStore from './libraryStore';

let howlInstance = null;

const isYouTubeTrack = (track) => {
  if (!track) return false;
  return (
    track.source === 'youtube' ||
    String(track.id).startsWith('yt_') ||
    Boolean(track.videoId)
  );
};

const usePlayerStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────
  currentTrack: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  isLoading: false,
  volume: 0.8,
  isMuted: false,
  shuffle: false,
  repeat: 'off', // 'off' | 'one' | 'all'
  progress: 0,      // 0–1
  duration: 0,      // seconds
  currentTime: 0,   // seconds
  showQueue: false,
  showVideo: false, // Floating video player toggle

  // ── Initialize YouTube Player Bridge ──────────────────
  initYouTube: (containerId = 'vibely-yt-iframe') => {
    initYouTubePlayer(containerId, (state, player, errorCode) => {
      // YouTube Player States:
      // -1: unstarted/error, 0: ended, 1: playing, 2: paused, 3: buffering, 5: cued
      if (state === 1) {
        // Playing
        set({
          isPlaying: true,
          isLoading: false,
          duration: player?.getDuration?.() || get().duration,
        });
        get()._startProgressTick();

        const track = get().currentTrack;
        if (track) {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
              useLibraryStore.getState().logTrackPlay(session.user.id, track);
            }
          });
        }
      } else if (state === 2) {
        // Paused
        set({ isPlaying: false });
      } else if (state === 3) {
        // Buffering
        set({ isLoading: true });
      } else if (state === 0) {
        // Ended
        get()._handleEnd();
      } else if (state === 5) {
        // Cued but not playing, which can happen when autoplay is blocked.
        const { currentTrack, isLoading } = get();
        set({ isLoading: false, isPlaying: false });
        if (isLoading && isYouTubeTrack(currentTrack)) {
          toast('YouTube is ready. Press Play to start playback.', { icon: '▶️' });
        }
      } else if (state === -1) {
        // -1 is YouTube's normal "unstarted" state; only onError provides an error code.
        if (!errorCode) return;

        set({ isLoading: false, isPlaying: false });
        const errorMessages = {
          2: 'YouTube rejected this video ID.',
          5: 'YouTube could not play this video in the HTML5 player.',
          100: 'This YouTube video is unavailable or private.',
          101: 'This video owner does not allow playback on other websites.',
          150: 'This video owner does not allow playback on other websites.',
          153: 'YouTube rejected the embed. Check the deployed site origin and referrer settings.',
        };
        toast.error(errorMessages[errorCode] || `YouTube playback failed (error ${errorCode}).`);
        console.warn('YouTube playback error:', errorCode);
        const { queue } = get();
        if (queue.length > 1) {
          get().next();
        }
      }
    });
  },

  // ── Internal: Init Track (Routes to YouTube or Howler) ──
  _initTrack: async (track) => {
    set({ isLoading: true, progress: 0, currentTime: 0 });

    if (isYouTubeTrack(track)) {
      // 1. YouTube Track
      if (howlInstance) {
        howlInstance.unload();
      }
      const videoId = track.videoId || track.rawId || String(track.id).replace('yt_', '');
      set({ duration: track.duration || 0 });
      const quality = get().showVideo ? 'hd720' : 'small';
      playYtVideo(videoId, quality);
      setYtVolume(get().volume, get().isMuted);
      get()._startProgressTick();
    } else {
      // 2. JioSaavn / Audius Track via Howler
      stopYtVideo();
      get()._initHowl(track);
    }
  },

  // ── Internal: Howler Audio Engine ──────────────────────
  _initHowl: async (track) => {
    if (howlInstance) {
      howlInstance.unload();
    }

    let streamUrls = Array.isArray(track.streamUrls) && track.streamUrls.length > 0
      ? track.streamUrls
      : (track.streamUrl ? [track.streamUrl] : []);

    if (streamUrls.length === 0 && String(track.id).startsWith('saavn_')) {
      const saavnTrack = await getSaavnTrackById(track.id);
      streamUrls = Array.isArray(saavnTrack?.streamUrls) && saavnTrack.streamUrls.length > 0
        ? saavnTrack.streamUrls
        : (saavnTrack?.streamUrl ? [saavnTrack.streamUrl] : []);
    }

    if (streamUrls.length === 0) {
      const audiusUrl = getStreamUrl(track.id);
      if (audiusUrl) streamUrls = [audiusUrl];
    }

    if (streamUrls.length === 0) {
      toast.error(`Stream unavailable for "${track.title}". Skipping to next...`);
      set({ isLoading: false, isPlaying: false });
      const { queue } = get();
      if (queue.length > 1) {
        get().next();
      }
      return;
    }

    howlInstance = new Howl({
      src: streamUrls,
      html5: true,
      format: ['mp3', 'aac', 'm4a', 'mp4', 'webm'],
      volume: get().isMuted ? 0 : get().volume,
      onload: () => {
        set({ duration: howlInstance.duration(), isLoading: false });
        get()._preloadNextTrack();
      },
      onplay: () => {
        set({ isPlaying: true });
        get()._startProgressTick();

        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            useLibraryStore.getState().logTrackPlay(session.user.id, track);
          }
        });
      },
      onpause: () => set({ isPlaying: false }),
      onend: () => {
        get()._handleEnd();
      },
      onloaderror: (_, err) => {
        console.error('Howler load error:', err);
        set({ isLoading: false, isPlaying: false });
        toast.error(`Playback failed for "${track.title}". Skipping...`);
        const { queue } = get();
        if (queue.length > 1) {
          setTimeout(() => {
            get().next();
          }, 1000);
        }
      },
    });

    howlInstance.play();
  },

  // ── Unified Progress Ticker ─────────────────────────────
  _progressInterval: null,
  _startProgressTick: () => {
    if (get()._progressInterval) clearInterval(get()._progressInterval);

    const interval = setInterval(() => {
      const { currentTrack } = get();
      if (!currentTrack) return;

      if (isYouTubeTrack(currentTrack)) {
        const { current, duration } = getYtPlaybackState();
        const total = duration || get().duration || 1;
        set({
          currentTime: current,
          duration: total,
          progress: total > 0 ? current / total : 0,
        });
      } else {
        if (!howlInstance || !howlInstance.playing()) return;
        const current = howlInstance.seek();
        const total = howlInstance.duration() || 1;
        set({ currentTime: current, progress: current / total });
      }
    }, 500);

    set({ _progressInterval: interval });
  },

  // ── Next Track Preload ─────────────────────────────────
  _preloadNextTrack: async () => {
    const { queue, queueIndex } = get();
    if (queueIndex < queue.length - 1) {
      const nextTrack = queue[queueIndex + 1];
      if (nextTrack?.id && !isYouTubeTrack(nextTrack) && typeof document !== 'undefined') {
        let streamUrl = nextTrack.streamUrl;
        if (!streamUrl && String(nextTrack.id).startsWith('saavn_')) {
          const saavnTrack = await getSaavnTrackById(nextTrack.id);
          streamUrl = saavnTrack?.streamUrl;
        }
        if (!streamUrl) {
          streamUrl = getStreamUrl(nextTrack.id);
        }
        if (streamUrl) {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = streamUrl;
          link.as = 'fetch';
          document.head.appendChild(link);
        }
      }
    }
  },

  // ── End of Track Handling ──────────────────────────────
  _handleEnd: () => {
    const { repeat, queue, queueIndex, shuffle, currentTrack } = get();
    if (repeat === 'one') {
      if (isYouTubeTrack(currentTrack)) {
        seekYtVideo(0);
        resumeYtVideo();
      } else if (howlInstance) {
        howlInstance.seek(0);
        howlInstance.play();
      }
      return;
    }

    if (shuffle) {
      const nextIdx = Math.floor(Math.random() * queue.length);
      get().playAtIndex(nextIdx);
      return;
    }

    if (queueIndex < queue.length - 1) {
      get().next();
    } else if (repeat === 'all') {
      get().playAtIndex(0);
    } else {
      set({ isPlaying: false, progress: 0, currentTime: 0 });
    }
  },

  // ── Public Player Controls ─────────────────────────────
  playTrack: (track, newQueue = null) => {
    const queue = newQueue || [track];
    const idx = queue.findIndex((t) => t.id === track.id);
    set({ currentTrack: track, queue, queueIndex: idx >= 0 ? idx : 0 });
    get()._initTrack(track);
  },

  playAtIndex: (index) => {
    const { queue } = get();
    if (index < 0 || index >= queue.length) return;
    const track = queue[index];
    set({ currentTrack: track, queueIndex: index });
    get()._initTrack(track);
  },

  togglePlay: () => {
    const { currentTrack, isPlaying } = get();
    if (!currentTrack) return;

    if (isYouTubeTrack(currentTrack)) {
      if (isPlaying) {
        pauseYtVideo();
        set({ isPlaying: false });
      } else {
        resumeYtVideo();
        set({ isPlaying: true });
      }
      return;
    }

    if (!howlInstance) return;
    if (howlInstance.playing()) {
      howlInstance.pause();
    } else {
      howlInstance.play();
    }
  },

  next: () => {
    const { queueIndex, queue, shuffle } = get();
    if (shuffle) {
      get().playAtIndex(Math.floor(Math.random() * queue.length));
      return;
    }
    if (queueIndex < queue.length - 1) {
      get().playAtIndex(queueIndex + 1);
    }
  },

  prev: () => {
    const { currentTime, queueIndex, currentTrack } = get();
    if (currentTime > 3) {
      if (isYouTubeTrack(currentTrack)) {
        seekYtVideo(0);
      } else {
        howlInstance?.seek(0);
      }
      return;
    }
    if (queueIndex > 0) get().playAtIndex(queueIndex - 1);
  },

  seek: (fraction) => {
    const { currentTrack, duration } = get();
    const dur = duration || currentTrack?.duration || 1;
    const targetSeconds = fraction * dur;

    if (isYouTubeTrack(currentTrack)) {
      seekYtVideo(targetSeconds);
    } else {
      howlInstance?.seek(targetSeconds);
    }
    set({ progress: fraction, currentTime: targetSeconds });
  },

  setVolume: (vol) => {
    howlInstance?.volume(vol);
    setYtVolume(vol, get().isMuted);
    set({ volume: vol, isMuted: vol === 0 });
  },

  toggleMute: () => {
    const { isMuted, volume } = get();
    const newMuted = !isMuted;
    howlInstance?.volume(newMuted ? 0 : volume);
    setYtVolume(volume, newMuted);
    set({ isMuted: newMuted });
  },

  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

  toggleRepeat: () => {
    const { repeat } = get();
    const next = repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off';
    set({ repeat: next });
  },

  toggleQueue: () => set((s) => ({ showQueue: !s.showQueue })),

  toggleVideo: () => {
    const next = !get().showVideo;
    set({ showVideo: next });
    setYtQuality(next ? 'hd720' : 'small');
  },

  addToQueue: (track) =>
    set((s) => ({ queue: [...s.queue, track] })),
}));

export default usePlayerStore;
