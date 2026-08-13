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
        name: 'FIALN — Acompanhamento de Alunos',
        short_name: 'Fialn',
        description: 'FIALN — Acompanhamento de Alunos',
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
            name: "Novo Aluno",
            short_name: "Aluno",
            description: "Adicionar um novo aluno rapidamente",
            url: "/?shortcut=add"
          }
        ]
      }
    })
  ],
  server: { 
    host: '::',
    port: 5174
  },
});

