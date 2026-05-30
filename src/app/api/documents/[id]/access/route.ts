import { NextRequest, NextResponse } from "next/server";
import { withEditorAuth } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import {
  checkDocumentAccess,
  getDocumentAccessLevel,
  listDocumentAccess,
  grantDocumentAccess,
  revokeDocumentAccess,
} from "@/lib/permissions";

export async function GET(request: NextRequest) {
  return withEditorAuth(request, async (req, user) => {
    try {
      const url = new URL(request.url);
      const segments = url.pathname.split("/").filter(Boolean);
      const docId = segments[segments.length - 3]; // Extract [id] from /api/documents/[id]/access

      if (!docId) {
        return NextResponse.json({ error: "Document ID required" }, { status: 400 });
      }

      // Check if user has access to this document
      const userAccess = await getDocumentAccessLevel(user.userId, docId);
      if (!userAccess) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // List all access for this document
      const access = await listDocumentAccess(docId);

      return NextResponse.json({ access });
    } catch (error) {
      console.error("Error fetching document access:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}

export async function POST(request: NextRequest) {
  return withEditorAuth(request, async (req, user) => {
    try {
      const url = new URL(request.url);
      const segments = url.pathname.split("/").filter(Boolean);
      const docId = segments[segments.length - 3];

      if (!docId) {
        return NextResponse.json({ error: "Document ID required" }, { status: 400 });
      }

      // Check if user is owner
      const document = await prisma.document.findUnique({
        where: { id: docId },
        select: { createdBy: true },
      });

      if (document?.createdBy !== user.userId) {
        return NextResponse.json(
          { error: "Only document owner can grant access" },
          { status: 403 }
        );
      }

      const body = await request.json();
      const { userId, role } = body;

      if (!userId || !role) {
        return NextResponse.json(
          { error: "userId and role are required" },
          { status: 400 }
        );
      }

      const access = await grantDocumentAccess(docId, userId, role);

      return NextResponse.json({ access }, { status: 201 });
    } catch (error) {
      console.error("Error granting access:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}

export async function DELETE(request: NextRequest) {
  return withEditorAuth(request, async (req, user) => {
    try {
      const url = new URL(request.url);
      const segments = url.pathname.split("/").filter(Boolean);
      const docId = segments[segments.length - 3];

      if (!docId) {
        return NextResponse.json({ error: "Document ID required" }, { status: 400 });
      }

      // Check if user is owner
      const document = await prisma.document.findUnique({
        where: { id: docId },
        select: { createdBy: true },
      });

      if (document?.createdBy !== user.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const body = await request.json();
      const { userId } = body;

      if (!userId) {
        return NextResponse.json({ error: "userId is required" }, { status: 400 });
      }

      await revokeDocumentAccess(docId, userId);

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error revoking access:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}
