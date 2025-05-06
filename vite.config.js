import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    proxy: {
      '/api':  'http://localhost:8888',
      '/login': 'http://localhost:8888',
      '/callback': 'http://localhost:8888',
    },
  },
});
