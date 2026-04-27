import { useEffect, useRef } from 'react';

import { initMonaco, monaco } from './customMonaco';

const SAMPLE = `query Example {
  user(id: "abc") {
    id
    name
  }
}`;

export function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let editor: monaco.editor.IStandaloneCodeEditor | undefined;
    let cancelled = false;

    initMonaco().then(() => {
      if (cancelled || !containerRef.current) return;
      editor = monaco.editor.create(containerRef.current, {
        value: SAMPLE,
        language: 'graphql',
        automaticLayout: true,
      });
    });

    return () => {
      cancelled = true;
      editor?.dispose();
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header
        style={{ padding: '8px 12px', background: '#1e1e1e', color: '#fff' }}
      >
        graphiql-30 repro — open DevTools → Network. The editor worker fetch is
        the bug.
      </header>
      <div ref={containerRef} style={{ flex: 1 }} />
    </div>
  );
}
