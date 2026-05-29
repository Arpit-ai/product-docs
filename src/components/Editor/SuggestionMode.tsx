// Suggestion mode for proposing and accepting/rejecting edits
import React from 'react';

export interface Suggestion {
  id: string;
  author: string;
  authorColor: string;
  type: 'insert' | 'delete' | 'modify';
  blockId: string;
  original?: string;
  proposed: string;
  timestamp: Date;
  accepted?: boolean;
}

interface SuggestionPanelProps {
  suggestions: Suggestion[];
  onAccept?: (suggestionId: string) => void;
  onReject?: (suggestionId: string) => void;
}

export function SuggestionPanel({ suggestions, onAccept, onReject }: SuggestionPanelProps) {
  const pending = suggestions.filter((s) => s.accepted === undefined);
  const accepted = suggestions.filter((s) => s.accepted === true);
  const rejected = suggestions.filter((s) => s.accepted === false);

  return (
    <div className="w-72 bg-gradient-to-b from-blue-50 to-white border-l border-blue-200 p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Suggestions</h3>

      {pending.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-blue-900 mb-2">Pending ({pending.length})</h4>
          <div className="space-y-2">
            {pending.map((suggestion) => (
              <div
                key={suggestion.id}
                className="border border-blue-200 bg-white rounded p-3 text-xs space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: suggestion.authorColor }}
                  />
                  <span className="font-medium text-gray-900">{suggestion.author}</span>
                  <span className="text-gray-500 text-xs ml-auto">{suggestion.type}</span>
                </div>

                {suggestion.type === 'delete' && (
                  <div className="bg-red-50 border border-red-200 rounded p-2">
                    <p className="line-through text-red-700">{suggestion.original}</p>
                  </div>
                )}

                {suggestion.type === 'insert' && (
                  <div className="bg-green-50 border border-green-200 rounded p-2">
                    <p className="text-green-700 font-medium">+ {suggestion.proposed}</p>
                  </div>
                )}

                {suggestion.type === 'modify' && (
                  <div className="space-y-1">
                    <div className="bg-red-50 border border-red-200 rounded p-2">
                      <p className="line-through text-red-700">{suggestion.original}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded p-2">
                      <p className="text-green-700 font-medium">{suggestion.proposed}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => onAccept?.(suggestion.id)}
                    className="flex-1 px-2 py-1 rounded bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onReject?.(suggestion.id)}
                    className="flex-1 px-2 py-1 rounded bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {accepted.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-green-900 mb-2">Accepted ({accepted.length})</h4>
          <div className="space-y-1 text-xs text-gray-600">
            {accepted.slice(0, 3).map((s) => (
              <div key={s.id} className="text-green-700">
                ✓ {s.author} · {s.type}
              </div>
            ))}
          </div>
        </div>
      )}

      {rejected.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-red-900 mb-2">Rejected ({rejected.length})</h4>
          <div className="space-y-1 text-xs text-gray-600">
            {rejected.slice(0, 3).map((s) => (
              <div key={s.id} className="text-red-700">
                ✕ {s.author} · {s.type}
              </div>
            ))}
          </div>
        </div>
      )}

      {pending.length === 0 && (
        <p className="text-xs text-gray-500 text-center py-8">No pending suggestions</p>
      )}
    </div>
  );
}
