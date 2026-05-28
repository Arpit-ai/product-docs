// Yjs WebSocket provider setup for collaborative editing
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export function createYjsProvider(docId: string, user: { id: string; name: string; color: string }) {
  const ydoc = new Y.Doc();
  const provider = new WebsocketProvider(
    process.env.NEXT_PUBLIC_YJS_WS_URL || 'ws://localhost:1234',
    docId,
    ydoc
  );
  // Awareness: user presence
  provider.awareness.setLocalStateField('user', user);
  return { ydoc, provider };
}
