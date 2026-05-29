// React hook for Yjs document state
import { useEffect, useRef } from 'react';
import * as Y from 'yjs';

export function useYjsDoc(docId: string) {
  const ydocRef = useRef<Y.Doc | null>(null);
  useEffect(() => {
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;
    return () => ydoc.destroy();
  }, [docId]);
  return ydocRef.current;
}
