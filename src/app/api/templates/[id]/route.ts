import { NextRequest, NextResponse } from "next/server";
import { withEditorAuth } from "@/lib/middleware";
import { prisma } from "@/lib/db";

function getTemplateId(request: NextRequest) {
  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] || "";
}

export async function GET(request: NextRequest) {
  return withEditorAuth(request, async () => {
    try {
      const id = getTemplateId(request);
      const template = await prisma.template.findUnique({
        where: { id },
      });

      if (!template) {
        return NextResponse.json({ error: "Template not found" }, { status: 404 });
      }

      return NextResponse.json({ template });
    } catch (error) {
      console.error("Error fetching template:", error);
      return NextResponse.json({ error: "Unable to load template" }, { status: 500 });
    }
  });
}

export async function DELETE(request: NextRequest) {
  return withEditorAuth(request, async () => {
    try {
      const id = getTemplateId(request);
      await prisma.template.delete({ where: { id } });
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting template:", error);
      return NextResponse.json({ error: "Unable to delete template" }, { status: 500 });
    }
  });
}
