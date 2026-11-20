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
      include: ['react', 'react-dom', 'lucide-react'],
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
              if (
                id.includes('/jspdf') ||
                id.includes('/html2canvas/') ||
                id.includes('/canvg/') ||
                id.includes('/fflate/') ||
                id.includes('/qrcode')
              ) {
                return 'vendor-pdf';
              }
              if (
                id.includes('/recharts/') ||
                id.includes('/d3-') ||
                id.includes('/d3/') ||
                id.includes('/topojson-client/') ||
                id.includes('/victory-vendor/')
              ) {
                return 'vendor-charts';
              }
              if (id.includes('/lucide-react/')) {
                return 'vendor-icons';
              }
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
