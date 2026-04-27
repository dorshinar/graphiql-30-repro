# graphiql-30 repro

Minimal Vite app combining:

- `@codingame/monaco-vscode-*` `30.0.1`
- `monaco-languageclient` `10.7.0`
- `monaco-graphql` `1.7.3`
- `vite-plugin-monaco-editor-esm` `2.0.2`

## Reproduce

```sh
pnpm install
pnpm dev
# open http://localhost:8001
```

In DevTools → Network the editor worker request fails:

```
GET http://localhost:8001/node_modules/.vite/deps/@codingame/monaco-vscode-editor-api/esm/vs/editor/editor.worker.js
→ 404
```

Console:

```
Failed to fetch dynamically imported module: ...
```

You can verify without a browser:

```sh
curl -s -o /dev/null -w '%{http_code}\n' \
  'http://localhost:8001/node_modules/.vite/deps/@codingame/monaco-vscode-editor-api/esm/vs/editor/editor.worker.js'
# → 404
```

## Files

- `vite.config.ts` — `vite-plugin-monaco-editor-esm` registering
  `editorWorkerService`, `graphql`, `json` workers.
- `src/customMonaco.ts` — `MonacoVscodeApiWrapper` + `useWorkerFactory`
  configured with `defineDefaultWorkerLoaders()` plus our custom
  `graphql` and `json` loaders.
- `src/App.tsx` — renders one Monaco editor instance.
