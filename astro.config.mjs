// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  site: 'https://toolkit.pabitramohansingh.com',
  output: 'server',
  integrations: [react(), sitemap()],
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  vite: {
    plugins: [
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'pwa-192x192.png', 'pwa-512x512.png', 'apple-touch-icon.png', 'maskable-icon-512x512.png'],
        manifest: {
          name: 'Toolkit',
          short_name: 'Toolkit',
          description: 'Free browser-based tools. 100% local processing.',
          theme_color: '#0f172a',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
      }),
    ],
    optimizeDeps: {
      exclude: ['@6over3/zeroperl-ts'],
    },
  },
});