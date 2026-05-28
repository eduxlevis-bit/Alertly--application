import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html'   // Vite will automatically pick up the script tag from here
      }
    }
  }
});