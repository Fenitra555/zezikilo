// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // Ecoute sur toutes les interfaces reseau
    port: 5173,
    strictPort: true,
    // Autorise les connexions depuis d'autres appareils (mobile, tablette)
    cors: true
  }
});