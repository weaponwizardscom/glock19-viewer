// vite.config.js
import { defineConfig } from 'vite'

// ----------------------------------------------------
//  Minimalna konfiguracja dla statycznej strony
//  • base – podkatalog na GitHub Pages (NAZWA repozytorium)
//  • build.outDir – gdzie Vite wypuści pliki (domyślnie „dist”)
//  ---------------------------------------------------
export default defineConfig({
  base: '/glock19-viewer/',   // ← dokładnie ta ścieżka!
  build: {
    outDir: 'dist'
    // nic więcej nie trzeba – Vite po prostu skopiuje index.html,
    // JS, CSS, SVG i inne pliki do katalogu „dist/”
  }
})
