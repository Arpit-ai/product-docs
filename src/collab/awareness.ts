// Awareness protocol for user presence and cursors
import { Awareness } from 'y-protocols/awareness';
import * as Y from 'yjs';

export function setupAwareness(ydoc: Y.Doc, provider: any, user: { id: string; name: string; color: string }) {
  const awareness = provider.awareness as Awareness;
  awareness.setLocalStateField('user', user);
  return awareness;
}
