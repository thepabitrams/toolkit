// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://toolkit.pabitramohansingh.com',
  output: 'server',
  trailingSlash: 'always',
  integrations: [
    react(), 
    sitemap({
      filter: (page) => !page.includes('/404') && !page.includes('/api/'),
    })
  ],
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  vite: {
    plugins: [tailwindcss()],
    worker: {
      format: 'es',
    },
    optimizeDeps: {
      exclude: [
        '@6over3/zeroperl-ts',
        '@jsquash/jpeg',
        '@jsquash/png',
        '@jsquash/webp',
        '@jsquash/avif',
        '@jsquash/jxl',
      ],
    },
  },
});