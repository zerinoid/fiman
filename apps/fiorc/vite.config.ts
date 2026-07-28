import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'FIORC — Orçamento Pessoal',
        short_name: 'Fiorc',
        description: 'FIORC — Orçamento Pessoal & Fluxo de Caixa',
        theme_color: '#1a1a1a',
        background_color: '#1a1a1a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: "Nova Despesa",
            short_name: "Despesa",
            description: "Adicionar uma nova despesa rapidamente",
            url: "/?shortcut=add"
          }
        ]
      }
    })
  ],
  server: { port: 5173 },
});
