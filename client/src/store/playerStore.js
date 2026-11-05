import { create } from 'zustand';
import { Howl } from 'howler';
import { getStreamUrl } from '../services/audiusService';
import { supabase } from '../services/supabaseClient';
import useLibraryStore from './libraryStore';

let howlInstance = null;

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

  // ── Internal: init Howl ────────────────────────────────
  _initHowl: (track) => {
    if (howlInstance) {
      howlInstance.unload();
    }

    set({ isLoading: true, progress: 0, currentTime: 0 });

    const streamUrl = getStreamUrl(track.id);

    howlInstance = new Howl({
      src: [streamUrl],
      html5: true,
      volume: get().isMuted ? 0 : get().volume,
      onload: () => {
        set({ duration: howlInstance.duration(), isLoading: false });
        get()._preloadNextTrack();
      },
      onplay: () => {
        set({ isPlaying: true });
        get()._startProgressTick();

        // Automatically record to listening history if user is logged in
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
      },
    });

    howlInstance.play();
  },

  // ── Progress ticker ────────────────────────────────────
  _progressInterval: null,
  _startProgressTick: () => {
    if (get()._progressInterval) clearInterval(get()._progressInterval);
    const interval = setInterval(() => {
      if (!howlInstance || !howlInstance.playing()) return;
      const current = howlInstance.seek();
      const total = howlInstance.duration() || 1;
      set({ currentTime: current, progress: current / total });
    }, 500);
    set({ _progressInterval: interval });
  },

  // ── Next Track Preload ─────────────────────────────────
  _preloadNextTrack: () => {
    const { queue, queueIndex } = get();
    if (queueIndex < queue.length - 1) {
      const nextTrack = queue[queueIndex + 1];
      if (nextTrack?.id && typeof document !== 'undefined') {
        const streamUrl = getStreamUrl(nextTrack.id);
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = streamUrl;
        link.as = 'fetch';
        document.head.appendChild(link);
      }
    }
  },

  // ── End of track ───────────────────────────────────────
  _handleEnd: () => {
    const { repeat, queue, queueIndex, shuffle } = get();
    if (repeat === 'one') {
      howlInstance.seek(0);
      howlInstance.play();
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

  // ── Public Actions ─────────────────────────────────────
  playTrack: (track, newQueue = null) => {
    const queue = newQueue || [track];
    const idx = queue.findIndex((t) => t.id === track.id);
    set({ currentTrack: track, queue, queueIndex: idx >= 0 ? idx : 0 });
    get()._initHowl(track);
  },

  playAtIndex: (index) => {
    const { queue } = get();
    if (index < 0 || index >= queue.length) return;
    const track = queue[index];
    set({ currentTrack: track, queueIndex: index });
    get()._initHowl(track);
  },

  togglePlay: () => {
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
    const { currentTime, queueIndex } = get();
    if (currentTime > 3) {
      howlInstance?.seek(0);
      return;
    }
    if (queueIndex > 0) get().playAtIndex(queueIndex - 1);
  },

  seek: (fraction) => {
    if (!howlInstance) return;
    const dur = howlInstance.duration();
    howlInstance.seek(fraction * dur);
    set({ progress: fraction, currentTime: fraction * dur });
  },

  setVolume: (vol) => {
    howlInstance?.volume(vol);
    set({ volume: vol, isMuted: vol === 0 });
  },

  toggleMute: () => {
    const { isMuted, volume } = get();
    const newMuted = !isMuted;
    howlInstance?.volume(newMuted ? 0 : volume);
    set({ isMuted: newMuted });
  },

  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

  toggleRepeat: () => {
    const { repeat } = get();
    const next = repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off';
    set({ repeat: next });
  },

  toggleQueue: () => set((s) => ({ showQueue: !s.showQueue })),

  addToQueue: (track) =>
    set((s) => ({ queue: [...s.queue, track] })),
}));

export default usePlayerStore;
