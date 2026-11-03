// generate-sw.mjs
import { generateSW } from 'workbox-build';

await generateSW({
  swDest: 'dist/sw.js',
  globDirectory: 'dist',
  globPatterns: ['**/*.{html,js,css,svg,png,ico,webmanifest}'],
});

console.log('Service worker generated successfully in dist/sw.js');