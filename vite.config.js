// vite.config.js
import { defineConfig } from 'vite'

// -------------------------------------------------------
//  Konfiguracja dla GitHub Pages
//  • base:  musi odpowiadać nazwie repozytorium
//           ("/glock19-viewer/")
//  • build.outDir: katalog, w którym Vite zapisze wynik
// -------------------------------------------------------
export default defineConfig({
  base: '/glock19-viewer/',
  build: {
    outDir: 'dist',
    emptyOutDir: true           // czyści stary build przed nowym
  }
})
