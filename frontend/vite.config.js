import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    strictPort: true,
    port: 8080 // Este valor debe coincidir con el puerto en docker-compose.yml
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});