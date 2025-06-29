import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  base: '/glock19-viewer/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Glock Viewer',
        short_name: 'Viewer',
        start_url: '/glock19-viewer/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
})
