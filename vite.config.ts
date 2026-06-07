import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cesium from 'vite-plugin-cesium';
import { aiPlugin } from './vite-plugin-ai';
import { travelPlugin } from './vite-plugin-travel';

export default defineConfig({
  plugins: [react(), cesium(), aiPlugin(), travelPlugin()],
  build: {
    chunkSizeWarningLimit: 4000,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/cesium')) {
            return 'cesium';
          }
        },
      },
    },
  },
});
