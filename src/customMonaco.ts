import '@codingame/monaco-vscode-standalone-languages';
import '@codingame/monaco-vscode-standalone-json-language-features';
import '@codingame/monaco-vscode-json-default-extension';
import '@codingame/monaco-vscode-json-language-features-default-extension';
import '@codingame/monaco-vscode-api/vscode/vs/editor/contrib/folding/browser/folding';
import 'monaco-editor/esm/vs/language/json/monaco.contribution';

import * as monaco from 'monaco-editor';

import '@codingame/monaco-vscode-editor-service-override';

import getBaseServiceOverride from '@codingame/monaco-vscode-base-service-override';
import getFilesServiceOverride from '@codingame/monaco-vscode-files-service-override';
import getLanguageServiceOverride from '@codingame/monaco-vscode-languages-service-override';
import getMonarchServiceOverride from '@codingame/monaco-vscode-monarch-service-override';
import { MonacoVscodeApiWrapper } from 'monaco-languageclient/vscodeApiWrapper';

type WorkerSpec = { url: URL; options: WorkerOptions };
type WorkerSpecLoader = () => WorkerSpec;

const workerSpecs: Partial<Record<string, WorkerSpecLoader>> = {
  editorWorkerService: () => ({
    url: new URL(
      '@codingame/monaco-vscode-editor-api/esm/vs/editor/editor.worker.js',
      import.meta.url
    ),
    options: { type: 'module' },
  }),
  extensionHostWorkerMain: () => ({
    url: new URL(
      '@codingame/monaco-vscode-api/workers/extensionHost.worker',
      import.meta.url
    ),
    options: { type: 'module' },
  }),
  graphql: () => ({
    url: new URL('monaco-graphql/esm/graphql.worker.js', import.meta.url),
    options: { type: 'module' },
  }),
  json: () => ({
    url: new URL(
      '@codingame/monaco-vscode-standalone-json-language-features/language/json/json.worker.js',
      import.meta.url
    ),
    options: { type: 'module' },
  }),
};

globalThis.MonacoEnvironment = {
  getWorker(_moduleId, label) {
    const spec = workerSpecs[label]?.();
    return spec ? new Worker(spec.url, spec.options) : undefined!;
  },
  getWorkerUrl(_moduleId, label) {
    return workerSpecs[label]?.().url.toString() as string;
  },
  getWorkerOptions(_moduleId, label) {
    return workerSpecs[label]?.().options;
  },
};

const apiWrapper = new MonacoVscodeApiWrapper({
  $type: 'classic',
  viewsConfig: { $type: 'EditorService' },
  monacoWorkerFactory: () => {},
  advanced: {
    enableExtHostWorker: true,
  },
  serviceOverrides: {
    ...getBaseServiceOverride(),
    ...getLanguageServiceOverride(),
    ...getFilesServiceOverride(),
    ...getMonarchServiceOverride(),
  },
});

let initMonacoPromise: Promise<void> | null = null;
function initMonaco() {
  initMonacoPromise ??= apiWrapper.start();
  return initMonacoPromise;
}

export { initMonaco, monaco };
