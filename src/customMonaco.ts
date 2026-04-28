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
import {
  Worker,
  defineDefaultWorkerLoaders,
  useWorkerFactory as configureUseWorkerFactory,
} from 'monaco-languageclient/workerFactory';

const originalGetWorkerUrl = MonacoEnvironment?.getWorkerUrl;

const apiWrapper = new MonacoVscodeApiWrapper({
  $type: 'classic',
  viewsConfig: { $type: 'EditorService' },
  monacoWorkerFactory: () =>
    configureUseWorkerFactory({
      workerLoaders: {
        ...defineDefaultWorkerLoaders(),
        graphql: () =>
          new Worker(originalGetWorkerUrl!('customMonaco', 'graphql')!, {
            type: 'module',
          }),
        json: () =>
          new Worker(originalGetWorkerUrl!('customMonaco', 'json')!, {
            type: 'module',
          }),
      },
    }),
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
