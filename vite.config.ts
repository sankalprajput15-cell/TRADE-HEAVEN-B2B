import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'lucide-react', 'jspdf'],
      exclude: ['nodemailer'],
    },
    build: {
      target: 'es2020',
      minify: 'esbuild',
      cssCodeSplit: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
            if (
              id.includes('/src/data/mockData') ||
              id.includes('/src/data/mappedCatalogDatabase') ||
              id.includes('/src/data/normalizedDatabase')
            ) {
              return 'b2b-catalog-data';
            }
            if (id.includes('/src/data/translationsData')) {
              return 'app-translations';
            }
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: false,
      allowedHosts: true,
      watch: null,
    },
  };
});
