import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  return withAdminAuth(request, async (req, user) => {
    try {
      const folder = await prisma.folder.findUnique({
        where: { id },
        include: {
          documents: true,
          children: true,
        },
      });

      if (!folder) {
        return NextResponse.json(
          { error: "Folder not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(folder);
    } catch (error) {
      console.error("Error fetching folder:", error);
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

  return withAdminAuth(request, async (req, user) => {
    try {
      const body = await request.json();
      const { name, parentId, order } = body;

      const folder = await prisma.folder.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(parentId !== undefined && { parentId }),
          ...(order !== undefined && { order }),
        },
      });

      return NextResponse.json(folder);
    } catch (error) {
      console.error("Error updating folder:", error);
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

  return withAdminAuth(request, async (req, user) => {
    try {
      await prisma.folder.delete({
        where: { id },
      });

      return NextResponse.json(
        { message: "Folder deleted" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error deleting folder:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
