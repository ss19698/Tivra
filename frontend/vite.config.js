import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',  // important! makes JS/CSS paths relative
  build: {
    outDir: 'dist', // your build folder
    sourcemap: false
  }
});
