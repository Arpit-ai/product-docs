import { NextRequest, NextResponse } from "next/server";
import { withEditorAuth, withViewerAuth } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activityLog";

export async function GET(request: NextRequest) {
  return withViewerAuth(request, async (req, user) => {
    try {
      const documents = await prisma.document.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
      });

      return NextResponse.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withEditorAuth(request, async (req, user) => {
    try {
      const body = await request.json();
      const { title, folderId } = body;

      if (!title) {
        return NextResponse.json(
          { error: "Title is required" },
          { status: 400 }
        );
      }

      const slug = title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

      const document = await prisma.document.create({
        data: {
          title,
          slug: `${slug}-${Date.now()}`,
          content: "",
          folderId,
          createdBy: user.userId,
        },
      });

      // Log activity
      await logActivity("CREATE_DOCUMENT", user.userId, document.id, {
        title: document.title,
      });

      return NextResponse.json(document, { status: 201 });
    } catch (error) {
      console.error("Error creating document:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
