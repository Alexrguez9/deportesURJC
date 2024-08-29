import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    strictPort: true,
    port: 8080 // Asegúrate de que este valor coincida con el puerto en docker-compose.yml
  }
});