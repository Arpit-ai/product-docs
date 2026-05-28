"use client";

import { useState } from "react";

const KEYBOARD_SHORTCUTS = [
  { keys: "Cmd + B", action: "Bold" },
  { keys: "Cmd + I", action: "Italic" },
  { keys: "Cmd + U", action: "Underline" },
  { keys: "Cmd + K", action: "Add Link" },
  { keys: "/", action: "Open Slash Commands" },
  { keys: "Cmd + S", action: "Save (auto-saves)" },
  { keys: "Cmd + Z", action: "Undo" },
  { keys: "Cmd + Shift + Z", action: "Redo" },
  { keys: "Tab", action: "Indent Block" },
  { keys: "Shift + Tab", action: "Outdent Block" },
];

export function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
        title="Keyboard shortcuts"
      >
        ⌨️ Shortcuts
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-96 rounded-lg bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">
                Keyboard Shortcuts
              </h2>
            </div>

            <div className="max-h-96 overflow-y-auto px-6 py-4">
              <div className="space-y-3">
                {KEYBOARD_SHORTCUTS.map((shortcut) => (
                  <div
                    key={shortcut.keys}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <span className="text-sm text-slate-700">
                      {shortcut.action}
                    </span>
                    <kbd className="rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs font-semibold text-slate-600">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-6 py-3">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
