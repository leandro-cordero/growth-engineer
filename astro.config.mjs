// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  // Pages stay prerendered; only /api/users/* opts into a function (`prerender = false`).
  adapter: vercel(),
  integrations: [react()],
  env: {
    schema: {
      // All optional: without Upstash the users API falls back to the in-memory store.
      UPSTASH_REDIS_REST_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      UPSTASH_REDIS_REST_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Bearer token for GET /api/users and admin PATCH.
      USERS_ADMIN_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Set by Vercel: production | preview | development. Prefixes Redis keys.
      VERCEL_ENV: envField.enum({
        context: 'server',
        access: 'secret',
        values: ['production', 'preview', 'development'],
        optional: true,
      }),
    },
  },
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
