import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Force Vite to resolve the exact built file of react-hot-toast
      'react-hot-toast': path.resolve(__dirname, 'node_modules/react-hot-toast/dist/index.mjs'),
    },
  },
  server: {
    proxy: {
      // Proxy API requests to Express backend
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
