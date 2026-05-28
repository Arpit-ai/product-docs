import { NextRequest, NextResponse } from "next/server";
import { withViewerAuth } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  return withViewerAuth(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const q = searchParams.get("q") || "";
      const limit = parseInt(searchParams.get("limit") || "10");

      if (!q || q.length < 2) {
        return NextResponse.json({ results: [] });
      }

      // SQLite full-text search using LIKE
      const results = await prisma.document.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { content: { contains: q } },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          status: true,
          updatedAt: true,
        },
        take: limit,
        orderBy: [
          { status: "desc" },
          { updatedAt: "desc" },
        ],
      });

      // Add relevance score and snippet
      const enriched = results.map((doc) => {
        const lowerContent = doc.content.toLowerCase();
        const lowerQ = q.toLowerCase();
        const titleMatch = doc.title.toLowerCase().includes(lowerQ) ? 2 : 0;
        const contentMatches = (lowerContent.match(new RegExp(lowerQ, "gi")) || []).length;
        const relevance = titleMatch * 10 + contentMatches;

        // Generate snippet
        let snippet = "";
        const index = lowerContent.indexOf(lowerQ);
        if (index !== -1) {
          const start = Math.max(0, index - 50);
          const end = Math.min(doc.content.length, index + q.length + 50);
          snippet = doc.content.substring(start, end);
          if (start > 0) snippet = "..." + snippet;
          if (end < doc.content.length) snippet = snippet + "...";
        }

        return {
          ...doc,
          relevance,
          snippet: snippet || doc.content.substring(0, 150),
        };
      });

      // Sort by relevance
      enriched.sort((a, b) => b.relevance - a.relevance);

      return NextResponse.json({ results: enriched });
    } catch (error) {
      console.error("Error searching:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
