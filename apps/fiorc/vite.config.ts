import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'FIORC — Orçamento',
        short_name: 'Fiorc',
        description: 'FIORC — Orçamento Pessoal',
        theme_color: '#1a1a1a',
        background_color: '#1a1a1a',
        display: 'standalone',
        shortcuts: [
          {
            name: "Nova Despesa",
            short_name: "Despesa",
            description: "Adicionar uma nova despesa rapidamente",
            url: "/#add"
          }
        ]
      }
    })
  ],
  server: { port: 5173 },
});
