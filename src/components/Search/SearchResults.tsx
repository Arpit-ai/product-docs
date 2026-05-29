"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface SearchMatch {
  start: number;
  end: number;
  text: string;
}

export interface SearchResultItem {
  id: string;
  title: string;
  type: "document" | "folder";
  slug?: string;
  folderId?: string;
  matches: SearchMatch[];
  snippet: string;
  relevance: number;
  status?: string;
  updatedAt?: string;
}

interface SearchResultsProps {
  query: string;
  results: SearchResultItem[];
  isLoading?: boolean;
  onResultClick?: (result: SearchResultItem) => void;
}

/**
 * Highlight search term in text
 * Returns JSX with matched text wrapped in <mark> tags
 */
function HighlightedText({ text, matches }: { text: string; matches: SearchMatch[] }) {
  if (matches.length === 0) return <span>{text}</span>;

  // Sort matches by start position
  const sortedMatches = [...matches].sort((a, b) => a.start - b.start);

  const parts: React.ReactNode[] = [];
  let lastEnd = 0;

  for (const match of sortedMatches) {
    // Add text before match
    if (match.start > lastEnd) {
      parts.push(
        <span key={`text-${lastEnd}`}>
          {text.substring(lastEnd, match.start)}
        </span>
      );
    }

    // Add highlighted match
    parts.push(
      <mark key={`match-${match.start}`} className="bg-yellow-200 font-semibold">
        {text.substring(match.start, match.end)}
      </mark>
    );

    lastEnd = match.end;
  }

  // Add remaining text
  if (lastEnd < text.length) {
    parts.push(
      <span key={`text-${lastEnd}`}>
        {text.substring(lastEnd)}
      </span>
    );
  }

  return <span>{parts}</span>;
}

/**
 * Single search result card
 */
function ResultCard({ result, onClick }: { result: SearchResultItem; onClick?: () => void }) {
  const isDocument = result.type === "document";
  const href = isDocument ? `/documents/${result.slug}` : `/folders/${result.slug}`;
  const relevancePercent = Math.round(result.relevance * 100);

  // Find matches in title
  const titleMatches = result.matches.filter(m => m.start < result.title.length);

  return (
    <Link href={href}>
      <div
        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer group"
        onClick={onClick}
      >
        {/* Header: Icon + Title + Type Badge */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 break-words">
              {titleMatches.length > 0 ? (
                <HighlightedText text={result.title} matches={titleMatches} />
              ) : (
                result.title
              )}
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={`text-xs px-2 py-1 rounded ${
                isDocument
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {isDocument ? "Document" : "Folder"}
            </span>
            {relevancePercent > 0 && (
              <span className="text-xs text-gray-500">
                {relevancePercent}%
              </span>
            )}
          </div>
        </div>

        {/* Snippet with highlighted matches */}
        {result.snippet && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {result.snippet}
          </p>
        )}

        {/* Metadata: Status + Updated date */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {result.status && (
              <span
                className={`capitalize ${
                  result.status === "PUBLISHED"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {result.status.toLowerCase()}
              </span>
            )}
          </div>
          {result.updatedAt && (
            <span>
              Updated{" "}
              {new Date(result.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * Search Results Component
 * Displays search results with highlighting and metadata
 */
export function SearchResults({
  query,
  results,
  isLoading = false,
  onResultClick,
}: SearchResultsProps) {
  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg
          className="w-12 h-12 text-gray-300 mb-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <p className="text-gray-600">Start typing to search documents and folders</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin">
          <svg
            className="w-8 h-8 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" className="opacity-25" />
            <path d="M22 12a10 10 0 0 0-10-10" className="opacity-75" />
          </svg>
        </div>
        <p className="text-gray-600 mt-4">Searching...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg
          className="w-12 h-12 text-gray-300 mb-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <p className="text-gray-600">
          No results found for <span className="font-semibold">"{query}"</span>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Try using different keywords
        </p>
      </div>
    );
  }

  // Group results by type
  const documentResults = results.filter(r => r.type === "document");
  const folderResults = results.filter(r => r.type === "folder");

  return (
    <div className="space-y-6">
      {/* Documents section */}
      {documentResults.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 px-1">
            Documents ({documentResults.length})
          </h3>
          <div className="space-y-2">
            {documentResults.map(result => (
              <ResultCard
                key={result.id}
                result={result}
                onClick={() => onResultClick?.(result)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Folders section */}
      {folderResults.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 px-1">
            Folders ({folderResults.length})
          </h3>
          <div className="space-y-2">
            {folderResults.map(result => (
              <ResultCard
                key={result.id}
                result={result}
                onClick={() => onResultClick?.(result)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Total results count */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t">
        Showing {results.length} result{results.length !== 1 ? "s" : ""} for{" "}
        <span className="font-semibold">"{query}"</span>
      </div>
    </div>
  );
}

export default SearchResults;
