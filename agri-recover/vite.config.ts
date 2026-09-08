import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true, // Allows external tunnel links (like localhost.run) to access the local server
  }
});