// Yjs WebSocket provider setup for collaborative editing
import * as Y from 'yjs';

let WebsocketProvider: any = null;
if (typeof window !== 'undefined') {
  const wsModule = require('y-websocket');
  WebsocketProvider = wsModule.WebsocketProvider;
}

export function createYjsProvider(docId: string, user: { id: string; name: string; color: string }) {
  const ydoc = new Y.Doc();
  
  if (!WebsocketProvider) {
    // Server-side: return doc without provider
    return { ydoc, provider: null };
  }

  const wsUrl = process.env.NEXT_PUBLIC_YJS_WS_URL || 'ws://localhost:1234';
  const provider = new WebsocketProvider(wsUrl, docId, ydoc);
  
  // Set user awareness
  provider.awareness.setLocalStateField('user', user);
  
  return { ydoc, provider };
}

