import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { useMemo } from 'react';

import { GraphiQL } from './GraphiQL';

const DEFAULT_QUERY = `# Try a query against the public Countries API
query {
  countries {
    code
    name
    capital
  }
}
`;

export function App() {
  const fetcher = useMemo(
    () => createGraphiQLFetcher({ url: 'https://countries.trevorblades.com/' }),
    []
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header
        style={{ padding: '8px 12px', background: '#1e1e1e', color: '#fff' }}
      >
        graphiql-30 repro — open DevTools → Network. The editor worker fetch
        is the bug.
      </header>
      <div style={{ flex: 1, minHeight: 0 }}>
        <GraphiQL fetcher={fetcher} defaultQuery={DEFAULT_QUERY} />
      </div>
    </div>
  );
}
