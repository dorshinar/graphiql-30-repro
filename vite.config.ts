import react from '@vitejs/plugin-react-swc';
import { createRequire } from 'node:module';
import path from 'node:path';
import { defineConfig } from 'vite';
import monacoEditorPlugin from 'vite-plugin-monaco-editor-esm';

const require = createRequire(import.meta.url);

export default defineConfig({
  plugins: [
    react(),
    monacoEditorPlugin({
      languageWorkers: ['editorWorkerService'],
      customWorkers: [
        {
          label: 'graphql',
          entry: 'monaco-graphql/esm/graphql.worker.js',
        },
        {
          label: 'json',
          entry: path.join(
            path.dirname(
              require.resolve('@codingame/monaco-vscode-standalone-json-language-features')
            ),
            'json.worker.js'
          ),
        },
      ],
      forceBuildCDN: true,
    }),
  ],
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    // Vite/esbuild cannot trace `@codingame/monaco-vscode-api`'s dynamic
    // imports during pre-bundling and crashes resolving paths like
    // `./vscode/src/vs/platform/dialogs/browser/dialog.js`. Skip pre-bundling.
    exclude: [
      '@codingame/monaco-vscode-json-default-extension',
  '@codingame/monaco-vscode-json-language-features-default-extension',
    ],
  },
  server: {
    port: 8001,
  },
});
