import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  return withAdminAuth(request, async (req, user) => {
    try {
      const folders = await prisma.folder.findMany({
        include: {
          children: true,
          documents: { select: { id: true, title: true } },
        },
        orderBy: { order: "asc" },
      });

      return NextResponse.json(folders);
    } catch (error) {
      console.error("Error fetching folders:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withAdminAuth(request, async (req, user) => {
    try {
      const body = await request.json();
      const { name, parentId } = body;

      if (!name) {
        return NextResponse.json(
          { error: "Name is required" },
          { status: 400 }
        );
      }

      const slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

      const folder = await prisma.folder.create({
        data: {
          name,
          slug: `${slug}-${Date.now()}`,
          parentId,
        },
      });

      return NextResponse.json(folder, { status: 201 });
    } catch (error) {
      console.error("Error creating folder:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
