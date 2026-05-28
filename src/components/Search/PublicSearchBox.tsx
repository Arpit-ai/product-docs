"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  folder?: {
    name: string;
  };
  updatedAt: string;
  snippet: string;
  relevance: number;
}

export function PublicSearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);

    if (q.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setSearching(true);
    setShowResults(true);

    try {
      const response = await fetch(`/api/public/search?q=${encodeURIComponent(q)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
      }
    } catch (err) {
      console.error("Public search error:", err);
    } finally {
      setSearching(false);
    }
  }, []);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search published docs..."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        aria-label="Search published documentation"
      />

      {searching && (
        <div className="absolute right-3 top-3 text-gray-400">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}

      {showResults && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-4 text-gray-500 text-center text-sm">No matching docs found.</div>
          ) : (
            <ul className="divide-y">
              {results.map((result) => (
                <li key={result.id}>
                  <Link
                    href={`/docs/${result.slug}`}
                    className="block p-3 hover:bg-gray-50 transition"
                    onClick={() => {
                      setShowResults(false);
                      setQuery("");
                    }}
                  >
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      {result.folder ? result.folder.name : "Published"}
                      <span>•</span>
                      <span>{new Date(result.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate text-sm">{result.title}</h3>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">{result.snippet}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
