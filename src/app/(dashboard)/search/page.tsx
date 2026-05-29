"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SearchResults, { SearchResultItem } from "@/components/Search/SearchResults";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    async function fetchResults() {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=50`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
        }
      } catch (error) {
        console.error("Failed to fetch search results", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [query]);

  return (
    <main className="space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-slate-900">Search dashboard content</h1>
          <p className="text-sm text-slate-600">
            Search across documents and folders. Use the sidebar search input, or update the query
            to refine results.
          </p>
          {query && (
            <p className="text-sm text-slate-500">
              Showing results for <span className="font-semibold">"{query}"</span>
            </p>
          )}
        </div>
      </header>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <SearchResults query={query} results={results} isLoading={isLoading} />
      </div>
    </main>
  );
}
