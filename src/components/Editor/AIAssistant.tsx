"use client";

import { useState, useCallback } from "react";

export interface AISuggestion {
  id: string;
  type: "expansion" | "summary" | "tone" | "grammar" | "completion";
  title: string;
  description: string;
  action: () => void;
  icon: string;
}

interface AIAssistantProps {
  selectedText: string;
  position: { x: number; y: number };
  onSuggestion: (suggestion: string) => void;
  onClose: () => void;
}

export function AIAssistant({
  selectedText,
  position,
  onSuggestion,
  onClose,
}: AIAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);

  const generateSuggestions = useCallback(async () => {
    if (!selectedText) return;

    setLoading(true);
    try {
      // Placeholder for AI integration
      // You can integrate with Claude API, OpenAI, or any other service
      const mockSuggestions: AISuggestion[] = [
        {
          id: "1",
          type: "expansion",
          title: "Expand",
          description: "Make this section longer and more detailed",
          icon: "📝",
          action: () => onSuggestion(selectedText + " [expanded]"),
        },
        {
          id: "2",
          type: "summary",
          title: "Summarize",
          description: "Make this text more concise",
          icon: "✂️",
          action: () => onSuggestion(selectedText.slice(0, 50) + "..."),
        },
        {
          id: "3",
          type: "tone",
          title: "Professional Tone",
          description: "Rewrite in a more formal style",
          icon: "🎩",
          action: () => onSuggestion(selectedText.toUpperCase()),
        },
      ];
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedText, onSuggestion]);

  return (
    <div
      className="fixed z-50 w-80 rounded-lg border border-slate-200 bg-white shadow-xl"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
    >
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">✨ AI Assistant</h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>
      </div>

      {!suggestions.length ? (
        <div className="p-4">
          <button
            onClick={generateSuggestions}
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Get AI Suggestions"}
          </button>
        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => {
                suggestion.action();
                onClose();
              }}
              className="w-full border-t border-slate-100 px-4 py-3 text-left hover:bg-slate-50 transition"
            >
              <div className="flex items-start gap-3">
                <span className="text-lg">{suggestion.icon}</span>
                <div>
                  <div className="font-medium text-slate-900">
                    {suggestion.title}
                  </div>
                  <div className="text-xs text-slate-600">
                    {suggestion.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
