import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/glock19-viewer/',
  build: { outDir: 'dist' },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['img/**/*', 'manifest/**/*', 'favicon.svg'],
      manifest: {
        name: 'Glock 19 Configurator',
        short_name: 'G19 Viewer',
        start_url: '/glock19-viewer/',
        scope: '/glock19-viewer/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          { src: '/glock19-viewer/manifest/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/glock19-viewer/manifest/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
});
