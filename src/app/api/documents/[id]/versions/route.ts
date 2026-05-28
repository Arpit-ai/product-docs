import { NextRequest, NextResponse } from "next/server";
import { withViewerAuth } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  return withViewerAuth(request, async (req, user) => {
    try {
      const versions = await prisma.version.findMany({
        where: { documentId: id },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      return NextResponse.json(versions);
    } catch (error) {
      console.error("Error fetching versions:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
