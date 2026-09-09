import { defineConfig } from 'vite';

// Vite root is app/; builds into gateway/ (committed — GitHub Pages serves it).
// base '/gateway/' keeps asset URLs correct under abhinavtk97.github.io/gateway/
// and portfolio.naatilevideya.in/gateway/. Phase 5 flips this to '/'.
export default defineConfig({
  root: 'app',
  base: '/gateway/',
  build: {
    outDir: '../gateway',
    emptyOutDir: true,
    target: 'es2020'
  }
});
