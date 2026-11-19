import { defineConfig } from 'vite';

// Production configuration for Vibely SPA on Vercel
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1000,
  },
});

