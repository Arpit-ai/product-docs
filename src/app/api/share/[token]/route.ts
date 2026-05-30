import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { recordShareLinkView } from "@/lib/permissions";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const segments = url.pathname.split("/").filter(Boolean);
    const token = segments[segments.length - 1]; // Extract [token] from /api/share/[token]

    if (!token) {
      return NextResponse.json({ error: "Share token required" }, { status: 400 });
    }

    // Get the share link
    const shareLink = await prisma.sharedLink.findUnique({
      where: { token },
    });

    if (!shareLink) {
      return NextResponse.json({ error: "Share link not found" }, { status: 404 });
    }

    // Check expiration
    if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Share link has expired" }, { status: 410 });
    }

    // Fetch the resource
    let resource: any;
    if (shareLink.resourceType === "document") {
      resource = await prisma.document.findUnique({
        where: { id: shareLink.resourceId },
        include: { creator: { select: { name: true } } },
      });
    } else if (shareLink.resourceType === "folder") {
      resource = await prisma.folder.findUnique({
        where: { id: shareLink.resourceId },
        include: {
          documents: {
            select: { id: true, title: true, slug: true, updatedAt: true },
          },
        },
      });
    }

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    // Record view (increment counter)
    await recordShareLinkView(token);

    return NextResponse.json({
      resource,
      resourceType: shareLink.resourceType,
      expiresAt: shareLink.expiresAt,
    });
  } catch (error) {
    console.error("Error resolving share link:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
