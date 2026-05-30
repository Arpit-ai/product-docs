import { NextRequest, NextResponse } from "next/server";
import { withEditorAuth } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import {
  createShareLink,
  listShareLinks,
  revokeShareLink,
} from "@/lib/permissions";

export async function GET(request: NextRequest) {
  return withEditorAuth(request, async (req, user) => {
    try {
      const url = new URL(request.url);
      const segments = url.pathname.split("/").filter(Boolean);
      const docId = segments[segments.length - 4]; // Extract [id] from /api/documents/[id]/share

      if (!docId) {
        return NextResponse.json({ error: "Document ID required" }, { status: 400 });
      }

      // Check if user owns this document
      const document = await prisma.document.findUnique({
        where: { id: docId },
        select: { createdBy: true },
      });

      if (document?.createdBy !== user.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const links = await listShareLinks(docId);

      return NextResponse.json({ links });
    } catch (error) {
      console.error("Error fetching share links:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}

export async function POST(request: NextRequest) {
  return withEditorAuth(request, async (req, user) => {
    try {
      const url = new URL(request.url);
      const segments = url.pathname.split("/").filter(Boolean);
      const docId = segments[segments.length - 4];

      if (!docId) {
        return NextResponse.json({ error: "Document ID required" }, { status: 400 });
      }

      // Check if user owns this document
      const document = await prisma.document.findUnique({
        where: { id: docId },
        select: { createdBy: true },
      });

      if (document?.createdBy !== user.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const body = await request.json();
      const { expiresIn = null } = body; // expiresIn in milliseconds from now

      let expiresAt: Date | undefined;
      if (expiresIn) {
        expiresAt = new Date(Date.now() + expiresIn);
      }

      const link = await createShareLink("document", docId, user.userId, expiresAt);

      return NextResponse.json(
        {
          link: {
            id: link.id,
            token: link.token,
            url: `${new URL(request.url).origin}/s/${link.token}`,
            expiresAt: link.expiresAt,
            createdAt: link.createdAt,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Error creating share link:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}

export async function DELETE(request: NextRequest) {
  return withEditorAuth(request, async (req, user) => {
    try {
      const body = await request.json();
      const { linkId } = body;

      if (!linkId) {
        return NextResponse.json({ error: "linkId is required" }, { status: 400 });
      }

      // Check ownership
      const link = await prisma.sharedLink.findUnique({
        where: { id: linkId },
      });

      if (!link || link.createdBy !== user.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      await revokeShareLink(linkId);

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error revoking share link:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}
