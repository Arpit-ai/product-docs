import { NextRequest, NextResponse } from "next/server";
import { withEditorAuth } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  return withEditorAuth(request, async (req) => {
    try {
      const templates = await prisma.template.findMany({
        orderBy: { updatedAt: "desc" },
      });

      return NextResponse.json({ templates });
    } catch (error) {
      console.error("Error fetching templates:", error);
      return NextResponse.json(
        { error: "Unable to load templates" },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withEditorAuth(request, async (req, user) => {
    try {
      const body = await request.json();
      const { name, blocks, folderId } = body;

      if (!name || typeof name !== "string") {
        return NextResponse.json({ error: "Template name is required" }, { status: 400 });
      }

      if (!blocks || !Array.isArray(blocks)) {
        return NextResponse.json({ error: "Blocks data is required" }, { status: 400 });
      }

      const template = await prisma.template.create({
        data: {
          name,
          blocks,
          folderId: folderId || null,
          createdBy: user.userId,
        },
      });

      return NextResponse.json({ template }, { status: 201 });
    } catch (error) {
      console.error("Error creating template:", error);
      return NextResponse.json(
        { error: "Unable to create template" },
        { status: 500 }
      );
    }
  });
}
