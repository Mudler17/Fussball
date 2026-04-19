import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// WICHTIG: Dieser Config bakt KEINEN API-Key in das Bundle.
// Der Key lebt nur auf dem Server (server/index.js) und wird via Env-Variable gesetzt.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    // Während der Entwicklung leiten wir /api/* an das Node-Backend (Port 3000) weiter.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
