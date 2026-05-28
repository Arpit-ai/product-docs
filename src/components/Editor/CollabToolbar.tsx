// CollabToolbar: Shows presence, suggestion mode, etc.
import React from 'react';

export function CollabToolbar({ users, suggestionMode, onToggleSuggestion }: {
  users: Array<{ id: string; name: string; color: string }>,
  suggestionMode: boolean,
  onToggleSuggestion: () => void
}) {
  return (
    <div className="flex items-center gap-4 p-2 border-b bg-gray-50 dark:bg-gray-900">
      <div className="flex gap-2">
        {users.map(u => (
          <span key={u.id} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: u.color }} />
            <span className="text-xs">{u.name}</span>
          </span>
        ))}
      </div>
      <button
        className={`ml-auto px-2 py-1 rounded text-xs ${suggestionMode ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        onClick={onToggleSuggestion}
      >
        {suggestionMode ? 'Suggestion Mode: ON' : 'Suggestion Mode: OFF'}
      </button>
    </div>
  );
}
