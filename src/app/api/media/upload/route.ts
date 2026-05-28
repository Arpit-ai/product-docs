import { NextRequest, NextResponse } from "next/server";
import { withEditorAuth } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  return withEditorAuth(request, async (req, user) => {
    try {
      const formData = await request.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        );
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: "File too large (max 10MB)" },
          { status: 400 }
        );
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "Invalid file type" },
          { status: 400 }
        );
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), "public", "uploads");
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name}`;
      const filepath = join(uploadsDir, filename);

      // Write file
      const bytes = await file.arrayBuffer();
      await writeFile(filepath, Buffer.from(bytes));

      // Save to database
      const media = await prisma.media.create({
        data: {
          filename: file.name,
          filepath: `/uploads/${filename}`,
          mimeType: file.type,
          size: file.size,
          uploadedBy: user.userId,
        },
      });

      return NextResponse.json(
        {
          url: media.filepath,
          id: media.id,
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Error uploading media:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
