import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 不走 proxy 是刻意的：OAuth callback 是 LINE → 後端 localhost:8080 的直接 redirect，
// state cookie 必須設在 8080 那一側，前端因此也直接打 localhost:8080（靠 CORS 連通）。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
});
