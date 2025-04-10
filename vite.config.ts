import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // base:'/', // nếu muốn deploy lên netlify
  base:'/caro003/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
