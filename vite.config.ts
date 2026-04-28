import importMetaUrlPlugin from '@codingame/esbuild-import-meta-url-plugin';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [importMetaUrlPlugin],
    },
  },
  server: {
    port: 8001,
  },
});
