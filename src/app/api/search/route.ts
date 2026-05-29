import { NextRequest, NextResponse } from "next/server";
import { withViewerAuth } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import {
  extractTextFromEditorJS,
  findMatches,
  generateSnippet,
  calculateRelevance,
  normalizeSearchTerm,
  tokenizeSearchTerm,
  matchesAllTokens,
} from "@/lib/search";

export async function GET(request: NextRequest) {
  return withViewerAuth(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const q = searchParams.get("q") || "";
      const limit = parseInt(searchParams.get("limit") || "20");
      const searchIn = searchParams.get("searchIn") || "all"; // all, documents, folders, comments

      if (!q || q.length < 2) {
        return NextResponse.json({ results: [] });
      }

      const normalizedQuery = normalizeSearchTerm(q);
      const tokens = tokenizeSearchTerm(normalizedQuery);

      // Search documents (title and content)
      const documentResults = await prisma.document.findMany({
        where: {
          OR: [
            { title: { contains: normalizedQuery } },
            { content: { contains: normalizedQuery } },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          status: true,
          folderId: true,
          updatedAt: true,
        },
        take: limit,
      });

      // Search folders (name only)
      const folderResults = await prisma.folder.findMany({
        where: {
          name: { contains: normalizedQuery },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          parentId: true,
        },
        take: Math.floor(limit / 2),
      });

      // Process document results
      const enrichedDocuments = documentResults.map((doc) => {
        let parsedBlocks: any[] = [];
        if (doc.content) {
          try {
            const parsed = JSON.parse(doc.content);
            parsedBlocks = Array.isArray(parsed.blocks) ? parsed.blocks : [];
          } catch {
            parsedBlocks = [];
          }
        }

        const contentText = extractTextFromEditorJS(parsedBlocks);
        const fullText = `${doc.title} ${contentText}`;
        const matches = findMatches(fullText, normalizedQuery);
        const relevance = calculateRelevance(fullText, matches);

        return {
          id: doc.id,
          title: doc.title,
          type: "document" as const,
          slug: doc.slug,
          folderId: doc.folderId,
          status: doc.status,
          matches: matches.slice(0, 3), // Top 3 matches
          snippet: generateSnippet(fullText, matches),
          relevance: relevance + (doc.title.toLowerCase().includes(normalizedQuery.toLowerCase()) ? 0.5 : 0),
          updatedAt: doc.updatedAt,
        };
      });

      // Process folder results
      const enrichedFolders = folderResults.map((folder) => {
        const matches = findMatches(folder.name, normalizedQuery);
        const relevance = calculateRelevance(folder.name, matches);

        return {
          id: folder.id,
          title: folder.name,
          type: "folder" as const,
          slug: folder.slug,
          parentId: folder.parentId,
          matches: matches,
          snippet: `Folder: ${folder.name}`,
          relevance: relevance,
        };
      });

      // Combine and sort by relevance
      let results = [...enrichedDocuments, ...enrichedFolders];
      results.sort((a, b) => b.relevance - a.relevance);

      // Filter by searchIn parameter
      if (searchIn === "documents") {
        results = results.filter(r => r.type === "document");
      } else if (searchIn === "folders") {
        results = results.filter(r => r.type === "folder");
      }

      return NextResponse.json({
        results: results.slice(0, limit),
        query: normalizedQuery,
        count: results.length,
      });
    } catch (error) {
      console.error("Error searching:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
