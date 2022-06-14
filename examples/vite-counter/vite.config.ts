import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // FIXME: https://github.com/vitejs/vite/issues/6215
      'react/jsx-runtime': 'react/jsx-runtime.js',
    },
  },
});
