/**
 * Full-text search service
 * Provides search functionality across documents, folders, and comments
 */

export interface SearchMatch {
  start: number;
  end: number;
  text: string;
}

export interface SearchResult {
  id: string;
  title: string;
  type: 'document' | 'folder' | 'comment';
  matches: SearchMatch[];
  snippet: string; // Context snippet with ellipsis
  relevance: number; // 0-1 score
  folderId?: string;
  documentId?: string;
}

/**
 * Extract text content from EditorJS JSON blocks
 */
export function extractTextFromEditorJS(blocks: any[]): string {
  if (!Array.isArray(blocks)) return '';
  
  return blocks
    .map(block => {
      switch (block.type) {
        case 'paragraph':
        case 'heading':
          return block.data?.text || '';
        case 'list':
          return (block.data?.items || [])
            .map((item: any) => item.content || item)
            .join('\n');
        case 'code':
          return block.data?.code || '';
        case 'quote':
          return `${block.data?.text || ''} — ${block.data?.caption || ''}`;
        case 'table':
          return (block.data?.content || [])
            .map((row: any[]) => row.join(' '))
            .join('\n');
        default:
          return '';
      }
    })
    .filter(text => text.length > 0)
    .join('\n');
}

/**
 * Find all matches of a search term in text (case-insensitive)
 */
export function findMatches(text: string, searchTerm: string): SearchMatch[] {
  const matches: SearchMatch[] = [];
  const lowerText = text.toLowerCase();
  const lowerTerm = searchTerm.toLowerCase();
  let index = 0;

  while ((index = lowerText.indexOf(lowerTerm, index)) !== -1) {
    matches.push({
      start: index,
      end: index + searchTerm.length,
      text: text.substring(index, index + searchTerm.length),
    });
    index += searchTerm.length;
  }

  return matches;
}

/**
 * Generate a context snippet around matches
 * Shows the match with surrounding context, up to maxLength characters
 */
export function generateSnippet(
  text: string,
  matches: SearchMatch[],
  maxLength: number = 150
): string {
  if (matches.length === 0) return '';

  const firstMatch = matches[0];
  const contextStart = Math.max(0, firstMatch.start - 50);
  const contextEnd = Math.min(text.length, firstMatch.end + 100);

  let snippet = text.substring(contextStart, contextEnd);

  // Add ellipsis if truncated
  if (contextStart > 0) snippet = '...' + snippet;
  if (contextEnd < text.length) snippet = snippet + '...';

  return snippet.trim();
}

/**
 * Calculate relevance score (0-1)
 * Based on number of matches and match density
 */
export function calculateRelevance(
  text: string,
  matches: SearchMatch[]
): number {
  if (matches.length === 0) return 0;

  // Match density: ratio of matched characters to total characters
  const totalMatchedChars = matches.length > 0
    ? matches.reduce((sum, m) => sum + (m.end - m.start), 0)
    : 0;
  
  const density = Math.min(1, totalMatchedChars / text.length);
  
  // Normalize by log of match count (diminishing returns)
  const matchCountFactor = Math.log(matches.length + 1) / Math.log(10);
  
  return Math.min(1, density * matchCountFactor);
}

/**
 * Highlight search term in text with markers
 * Used in UI to show bolded/highlighted matches
 */
export function highlightText(text: string, matches: SearchMatch[]): string {
  if (matches.length === 0) return text;

  // Sort matches by start position (descending) to avoid index shifting
  const sortedMatches = [...matches].sort((a, b) => b.start - a.start);

  let result = text;
  for (const match of sortedMatches) {
    result =
      result.substring(0, match.start) +
      `<mark>${result.substring(match.start, match.end)}</mark>` +
      result.substring(match.end);
  }

  return result;
}

/**
 * Normalize search term: trim, lowercase, remove extra spaces
 */
export function normalizeSearchTerm(term: string): string {
  return term.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Check if searchTerm matches text (basic substring match)
 * Returns true if term is found anywhere in text
 */
export function matchesSearchTerm(text: string, searchTerm: string): boolean {
  return text.toLowerCase().includes(searchTerm.toLowerCase());
}

/**
 * Split search term into individual words for multi-term search
 */
export function tokenizeSearchTerm(term: string): string[] {
  return normalizeSearchTerm(term)
    .split(' ')
    .filter(token => token.length > 0);
}

/**
 * Advanced search: match ALL tokens in text (AND logic)
 * Returns true only if all tokens are found
 */
export function matchesAllTokens(text: string, tokens: string[]): boolean {
  const lowerText = text.toLowerCase();
  return tokens.every(token => lowerText.includes(token));
}

/**
 * Advanced search: match ANY token in text (OR logic)
 * Returns true if any token is found
 */
export function matchesAnyToken(text: string, tokens: string[]): boolean {
  const lowerText = text.toLowerCase();
  return tokens.some(token => lowerText.includes(token));
}
