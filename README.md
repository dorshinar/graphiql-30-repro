# graphiql-30 repro

Lean reproduction of the editor-worker fetch failure when bumping
`@codingame/monaco-vscode-*` to `30.0.1` and `monaco-languageclient` to
`10.7.0` in a Vite app that uses `vite-plugin-monaco-editor-esm`.

## What is here

- `vite.config.ts` — `vite-plugin-monaco-editor-esm` registering
  `editorWorkerService`, `graphql`, and `json` workers.
- `src/customMonaco.ts` — minimal port of `wiz-c/web/packages/@wiz-common/monaco-editor/src/customMonaco.ts`,
  preserving the same `MonacoVscodeApiWrapper` + `useWorkerFactory` pattern.
  **Intentionally broken** to demonstrate the bug. The fix is described inline
  at the top of the file and commented out next to the broken loaders.
- `src/App.tsx` — single Monaco editor instance that triggers worker loading.

## Reproduce

```sh
pnpm install
pnpm dev
# open http://localhost:8001
```

In DevTools → Network you will see a failed request to:

```
http://localhost:8001/node_modules/.vite/deps/@codingame/monaco-vscode-editor-api/esm/vs/editor/editor.worker.js
```

Console:

```
Failed to fetch dynamically imported module: ...
```

That path does not exist. It is what
`new URL('@codingame/monaco-vscode-editor-api/esm/vs/editor/editor.worker.js', import.meta.url)`
resolves to when `import.meta.url` is the pre-bundled chunk under `.vite/deps/`.
You can verify without a browser:

```sh
curl -s -o /dev/null -w '%{http_code}\n' \
  'http://localhost:8001/node_modules/.vite/deps/@codingame/monaco-vscode-editor-api/esm/vs/editor/editor.worker.js'
# → 404
```

> Note: `monaco-languageclient` is **intentionally NOT** in
> `optimizeDeps.exclude`. Adding it masks the bug — Vite's dev pipeline
> rewrites the bare specifier to a working URL when the module is served
> directly. The bug only surfaces when esbuild pre-bundles the module
> (which is the default, and what wiz-c does).

## Why

`monaco-languageclient@10.7.0` rewrote its worker plumbing:

| version | sets on `MonacoEnvironment` | collides with `vite-plugin-monaco-editor-esm`? |
| ------- | --------------------------- | ---------------------------------------------- |
| ≤10.4   | `getWorker` (returns Worker) | no                                             |
| ≥10.5   | `getWorkerUrl` (returns URL) | **yes** (plugin owns the same property)        |

Because the plugin's inline `<script>` in `index.html` runs synchronously
before any module, `MonacoEnvironment.getWorkerUrl` is initially the
plugin's getter. Then `apiWrapper.start()` triggers `useWorkerFactory`,
which **overwrites** the property. After that:

1. The plugin's URL map is no longer reachable through `MonacoEnvironment`.
2. Any worker label not present in our `workerLoaders` falls through to
   `defineDefaultWorkerLoaders()`'s `editorWorkerService` loader, which
   constructs `new URL('@codingame/...', import.meta.url)`. Vite cannot
   resolve a bare specifier in that pattern, so it produces the bogus
   `…/lib/worker/@codingame/…` URL.

## Fix

Capture `MonacoEnvironment.getWorkerUrl` at module load (before the
overwrite) and route every loader — including `editorWorkerService` —
through the captured reference. Drop the
`...defineDefaultWorkerLoaders()` spread entirely.

The fix is shown commented out in `src/customMonaco.ts`. Toggle it and
the editor renders normally.
