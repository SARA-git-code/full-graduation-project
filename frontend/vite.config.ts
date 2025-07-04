import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:4001',
      '/socket.io': {
        target: 'http://localhost:5050',
        ws: true,
      },
    },
  },
});
