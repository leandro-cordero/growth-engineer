// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [react()],
  // Astro downloads these at build and serves them self-hosted (no Google request at runtime).
  fonts: [
    {
      name: 'Lato',
      cssVariable: '--font-lato',
      provider: fontProviders.google(),
      weights: [700, 900],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Helvetica Neue', 'Arial', 'sans-serif'],
    },
    {
      name: 'Nunito Sans',
      cssVariable: '--font-nunito-sans',
      provider: fontProviders.google(),
      weights: [400, 600, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
