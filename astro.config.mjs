import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://auroraforecast.uk',
  output: 'static',
  integrations: [
    // Custom dynamic sitemap at /sitemap.xml endpoint instead of @astrojs/sitemap
  ],
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
    assets: 'assets',
  },
  vite: {
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name].[hash][extname]',
        },
      },
    },
    preview: {
      allowedHosts: true,
    },
  },
});
