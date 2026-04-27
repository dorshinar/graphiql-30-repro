import '@codingame/monaco-vscode-standalone-languages';
import '@codingame/monaco-vscode-standalone-json-language-features';
import '@codingame/monaco-vscode-json-default-extension';
import '@codingame/monaco-vscode-json-language-features-default-extension';
import 'monaco-editor/esm/vs/language/json/monaco.contribution';

import getBaseServiceOverride from '@codingame/monaco-vscode-base-service-override';
import getFilesServiceOverride from '@codingame/monaco-vscode-files-service-override';
import getLanguageServiceOverride from '@codingame/monaco-vscode-languages-service-override';
import getMonarchServiceOverride from '@codingame/monaco-vscode-monarch-service-override';
import * as monaco from 'monaco-editor';
import { MonacoVscodeApiWrapper } from 'monaco-languageclient/vscodeApiWrapper';
import {
  Worker,
  defineDefaultWorkerLoaders,
  useWorkerFactory as configureUseWorkerFactory,
} from 'monaco-languageclient/workerFactory';

const apiWrapper = new MonacoVscodeApiWrapper({
  $type: 'classic',
  viewsConfig: { $type: 'EditorService' },
  monacoWorkerFactory: () =>
    configureUseWorkerFactory({
      workerLoaders: {
        ...defineDefaultWorkerLoaders(),
        graphql: () =>
          new Worker(
            MonacoEnvironment!.getWorkerUrl!('customMonaco', 'graphql')!,
            {
              type: 'module',
            }
          ),
        json: () =>
          new Worker(
            MonacoEnvironment!.getWorkerUrl!('customMonaco', 'json')!,
            {
              type: 'module',
            }
          ),
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
