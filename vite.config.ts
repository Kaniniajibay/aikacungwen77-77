
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs';

// Plugin to copy the service worker after build
const copyServiceWorker = () => {
  return {
    name: 'copy-service-worker',
    writeBundle() {
      try {
        if (fs.existsSync('src/serviceWorker.ts')) {
          const content = fs.readFileSync('src/serviceWorker.ts', 'utf-8');
          // Replace TS-specific syntax with JS
          const jsContent = content
            .replace(/\/\/ Add type definitions for service worker[\s\S]*?WindowOrWorkerGlobalScope;\s*/g, '')
            .replace(/(event: ExtendableEvent|event: FetchEvent)/g, 'event')
            .replace(/: \w+/g, '')
            .replace(/return undefined;/g, 'return;');
          fs.writeFileSync('dist/serviceWorker.js', jsContent);
          console.log('Service worker copied to dist/');
        }
      } catch (e) {
        console.error('Error copying service worker:', e);
      }
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    mode === 'production' && copyServiceWorker(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
