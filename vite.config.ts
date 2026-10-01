import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { BRANDS, brandIdForMode, type Brand, type BrandTheme } from './brands';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const brandId = brandIdForMode(mode);
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        {
          name: 'brand-html',
          transformIndexHtml: (html) => {
            const brand: Brand = BRANDS[brandId];
            html = html.replace(/<title>.*<\/title>/, `<title>${brand.pageTitle}</title>`);
            if (brand.theme) {
              const theme = brand.theme;
              html = html.replace(
                /"agoin-(green|teal|dark|darker|light|accent|accent-hover)": "#[0-9a-fA-F]+"/g,
                (_, key: keyof BrandTheme) => `"agoin-${key}": "${theme[key]}"`
              );
              // Los checkboxes nativos salen en azul del navegador si no
              html = html.replace('</head>', `  <style>input { accent-color: ${theme.teal}; }</style>\n  </head>`);
            }
            if (brand.font) {
              html = html.replaceAll('Poppins', brand.font);
            }
            return html;
          },
        },
      ],
      build: {
        outDir: brandId === 'agoin' ? 'dist' : `dist-${brandId}`,
      },
      define: {
        '__BRAND_ID__': JSON.stringify(brandId),
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
