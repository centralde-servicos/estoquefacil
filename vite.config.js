import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['estoquefacil.png'],
      manifest: {
        name: 'Estoque Fácil',
        short_name: 'Estoque',
        description: 'Sistema de Controle de Estoque Profissional',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: 'estoquefacil.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'estoquefacil.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
