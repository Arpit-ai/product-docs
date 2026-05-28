import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const results = await prisma.document.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ title: { contains: q } }, { content: { contains: q } }],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        updatedAt: true,
        folder: { select: { name: true } },
      },
      take: limit,
      orderBy: { updatedAt: "desc" },
    });

    const enriched = results.map((doc) => {
      const plainText = doc.content.replace(/<[^>]+>/g, "");
      const lowerContent = plainText.toLowerCase();
      const lowerQ = q.toLowerCase();
      const titleMatch = doc.title.toLowerCase().includes(lowerQ) ? 2 : 0;
      const contentMatches = (lowerContent.match(new RegExp(lowerQ, "gi")) || []).length;
      const relevance = titleMatch * 10 + contentMatches;

      const index = lowerContent.indexOf(lowerQ);
      let snippet = "";
      if (index !== -1) {
        const start = Math.max(0, index - 60);
        const end = Math.min(plainText.length, index + q.length + 60);
        snippet = plainText.substring(start, end);
        if (start > 0) snippet = "..." + snippet;
        if (end < plainText.length) snippet += "...";
      }

      return {
        id: doc.id,
        title: doc.title,
        slug: doc.slug,
        folder: doc.folder,
        updatedAt: doc.updatedAt,
        relevance,
        snippet: snippet || plainText.substring(0, 150),
      };
    });

    enriched.sort((a, b) => b.relevance - a.relevance);

    return NextResponse.json({ results: enriched });
  } catch (error) {
    console.error("Public search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
