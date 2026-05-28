import { NextRequest, NextResponse } from "next/server";
import { withEditorAuth, withViewerAuth } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activityLog";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  return withViewerAuth(request, async (req, user) => {
    try {
      const document = await prisma.document.findUnique({
        where: { id },
        include: {
          creator: { select: { id: true, name: true, email: true } },
          folder: true,
          tags: true,
        },
      });

      if (!document) {
        return NextResponse.json(
          { error: "Document not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  return withEditorAuth(request, async (req, user) => {
    try {
      const body = await request.json();
      const { title, content, status, folderId } = body;

      const document = await prisma.document.findUnique({
        where: { id },
      });

      if (!document) {
        return NextResponse.json(
          { error: "Document not found" },
          { status: 404 }
        );
      }

      // Check if content changed to create a version
      if (content && content !== document.content) {
        await prisma.version.create({
          data: {
            documentId: id,
            userId: user.userId,
            content: document.content,
            changeSummary: `Edited document`,
          },
        });
      }

      const updated = await prisma.document.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(content !== undefined && { content }),
          ...(status && { status }),
          ...(folderId !== undefined && { folderId }),
        },
        include: {
          creator: { select: { id: true, name: true, email: true } },
          folder: true,
        },
      });

      await logActivity("UPDATE_DOCUMENT", user.userId, id, {
        title: updated.title,
        status: updated.status,
      });

      return NextResponse.json(updated);
    } catch (error) {
      console.error("Error updating document:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  return withEditorAuth(request, async (req, user) => {
    try {
      const document = await prisma.document.findUnique({
        where: { id },
        select: { title: true },
      });

      await prisma.document.delete({
        where: { id },
      });

      await logActivity("DELETE_DOCUMENT", user.userId, id, {
        title: document?.title,
      });

      return NextResponse.json(
        { message: "Document deleted" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error deleting document:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
