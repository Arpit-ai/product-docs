// Awareness protocol for user presence and cursors
import * as Y from 'yjs';

export function setupAwareness(ydoc: Y.Doc, provider: any, user: { id: string; name: string; color: string }) {
  if (!provider) {
    // Server-side: no awareness
    return null;
  }
  
  const awareness = provider.awareness;
  awareness.setLocalStateField('user', user);
  return awareness;
}

