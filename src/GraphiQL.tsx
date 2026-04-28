import {
  DOC_EXPLORER_PLUGIN,
  DocExplorerStore,
} from '@graphiql/plugin-doc-explorer';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import { HISTORY_PLUGIN, HistoryStore } from '@graphiql/plugin-history';
import { type GraphiQLProvider } from '@graphiql/react';
import { type Fetcher } from '@graphiql/toolkit';
import React, { type ComponentProps } from 'react';

import { GraphiQLInterface } from './GraphiQLInterface';

type GraphiQLProps = Pick<
  ComponentProps<typeof GraphiQLProvider>,
  'fetcher' | 'defaultQuery'
>;

export function GraphiQL({ fetcher, defaultQuery }: GraphiQLProps) {
  return (
    <React.Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
      <LazyGraphiQLProvider
        fetcher={fetcher}
        defaultQuery={defaultQuery}
        inputValueDeprecation
        plugins={DEFAULT_PLUGINS}
        referencePlugin={DOC_EXPLORER_PLUGIN}
        editorTheme={{ dark: 'github-dark', light: 'github-light' }}
      >
        <HistoryStore>
          <DocExplorerStore>
            <GraphiQLInterface />
          </DocExplorerStore>
        </HistoryStore>
      </LazyGraphiQLProvider>
    </React.Suspense>
  );
}

const DEFAULT_PLUGINS = [DOC_EXPLORER_PLUGIN, HISTORY_PLUGIN, explorerPlugin()];

const LazyGraphiQLProvider = React.lazy(async () => {
  const { initMonaco } = await import('./customMonaco');
  await initMonaco();

  const { GraphiQLProvider } = await import('@graphiql/react');
  return { default: GraphiQLProvider };
});

export type { Fetcher };
