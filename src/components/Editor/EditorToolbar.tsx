"use client";

import { KeyboardShortcutsModal } from "./KeyboardShortcuts";

interface EditorToolbarProps {
  onUndo?: () => void;
  onRedo?: () => void;
  isSaving?: boolean;
  wordCount?: number;
  blockCount?: number;
}

export function EditorToolbar({
  onUndo,
  onRedo,
  isSaving = false,
  wordCount = 0,
  blockCount = 0,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
      <div className="flex items-center gap-2">
        <button
          onClick={onUndo}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition"
          title="Undo (Cmd+Z)"
        >
          ↶
        </button>
        <button
          onClick={onRedo}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition"
          title="Redo (Cmd+Shift+Z)"
        >
          ↷
        </button>
        <div className="h-6 w-px bg-slate-200" />
        <KeyboardShortcutsModal />
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-600">
        <div className="flex gap-2">
          <span>{blockCount} blocks</span>
          <span>•</span>
          <span>{wordCount} words</span>
        </div>
        {isSaving && (
          <div className="flex items-center gap-1.5 text-slate-500">
            <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></div>
            <span>Saving...</span>
          </div>
        )}
      </div>
    </div>
  );
}
