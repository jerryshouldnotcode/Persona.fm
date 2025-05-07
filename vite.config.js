import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    host: '127.0.0.1',   // Force Vite to use this host
    port: 5177,           // Force Vite to use this server
    strictPort: true,
    proxy: {
      '/api':  'http://localhost:8888',
      '/login': 'http://localhost:8888',
      '/callback': 'http://localhost:8888',
    },
  },
});
