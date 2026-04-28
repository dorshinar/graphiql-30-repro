import { useGraphiQL, useMonaco } from '@graphiql/react';
import {
  GraphiQL as GraphiQLPrimitive,
  GraphiQLInterface as GraphiQLInterfacePrimitive,
} from 'graphiql';
import { useEffect, useState } from 'react';

import 'graphiql/style.css';
import '@graphiql/plugin-explorer/style.css';

export function GraphiQLInterface() {
  const initialVariables = useGraphiQL(state => state.initialVariables);
  const initialQuery = useGraphiQL(state => state.initialQuery);
  const uriInstanceId = useGraphiQL(state => state.uriInstanceId);
  const monaco = useMonaco(state => state.monaco);

  const [modelCreated, setModelCreated] = useState(false);

  useEffect(() => {
    if (!monaco) {
      return;
    }

    let disposed = false;
    const modelReferences: Array<{ dispose: () => void }> = [];

    (async () => {
      const variablesUri = monaco.Uri.file(`${uriInstanceId}variables.json`);
      const operationUri = monaco.Uri.file(`${uriInstanceId}operation.graphql`);
      const responseUri = monaco.Uri.file(`${uriInstanceId}response.json`);

      const variablesModel = monaco.editor.getModel(variablesUri);
      const operationModel = monaco.editor.getModel(operationUri);
      const responseModel = monaco.editor.getModel(responseUri);

      try {
        const references = await Promise.all([
          !variablesModel &&
            monaco.editor.createModelReference(variablesUri, initialVariables),
          !operationModel &&
            monaco.editor.createModelReference(operationUri, initialQuery),
          !responseModel && monaco.editor.createModelReference(responseUri, ''),
        ]);

        if (disposed) {
          references.forEach(ref => ref && ref.dispose());
          return;
        }

        references.forEach(ref => {
          if (ref) {
            modelReferences.push(ref);
          }
        });
      } finally {
        if (!disposed) {
          setModelCreated(true);
        }
      }
    })();

    return () => {
      disposed = true;
      modelReferences.forEach(ref => ref.dispose());
    };
  }, [uriInstanceId, initialVariables, initialQuery, monaco]);

  if (!modelCreated) {
    return null;
  }

  return (
    <GraphiQLInterfacePrimitive>
      <GraphiQLPrimitive.Logo>{EMPTY_LOGO}</GraphiQLPrimitive.Logo>
    </GraphiQLInterfacePrimitive>
  );
}

const EMPTY_LOGO = <></>;
