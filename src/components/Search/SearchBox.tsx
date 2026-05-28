"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  snippet: string;
  relevance: number;
}

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      setSearching(false);
      setSelectedIndex(-1);
      return;
    }

    setSearching(true);
    setShowResults(true);

    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setResults(data.results);
          setSelectedIndex(data.results.length ? 0 : -1);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [query]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showResults || !results.length) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((current) => (current + 1) % results.length);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((current) =>
          current <= 0 ? results.length - 1 : current - 1
        );
      }

      if (event.key === "Enter" && selectedIndex >= 0) {
        event.preventDefault();
        router.push(`/documents/${results[selectedIndex].id}`);
        setShowResults(false);
        setQuery("");
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setShowResults(false);
      }
    },
    [results, selectedIndex, router, showResults]
  );

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search documents..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          aria-label="Search documents"
        />
        {searching && (
          <div className="absolute right-3 top-2 text-gray-400">
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
      </div>

      {showResults && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-4 text-gray-500 text-center text-sm">No results found</div>
          ) : (
            <ul className="divide-y" role="listbox">
              {results.map((result, index) => (
                <li key={result.id}>
                  <Link
                    href={`/documents/${result.id}`}
                    className={`block p-3 transition ${
                      index === selectedIndex ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setShowResults(false);
                      setQuery("");
                    }}
                  >
                    <h3 className="font-semibold text-gray-900 truncate text-sm">
                      {result.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                      {result.snippet}
                    </p>
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
