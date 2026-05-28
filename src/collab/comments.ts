// Shared comments model using Yjs map
import * as Y from 'yjs';

export function getCommentsMap(ydoc: Y.Doc) {
  // Each document has a Y.Map for comments
  return ydoc.getMap('comments');
}
