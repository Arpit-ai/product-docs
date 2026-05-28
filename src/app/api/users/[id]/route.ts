import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAdminAuth } from "@/lib/middleware";
import { prisma } from "@/lib/db";

const UserPatchSchema = z.object({
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"]).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  return withAdminAuth(request, async (req, user) => {
    try {
      const body = await request.json();
      const updates = UserPatchSchema.parse(body);

      if (Object.keys(updates).length === 0) {
        return NextResponse.json(
          { error: "No valid values provided for update" },
          { status: 400 }
        );
      }

      const targetUser = await prisma.user.findUnique({ where: { id } });
      if (!targetUser) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      if (targetUser.role === "ADMIN" && updates.role && updates.role !== "ADMIN") {
        const adminCount = await prisma.user.count({
          where: { role: "ADMIN", id: { not: id } },
        });
        if (adminCount === 0) {
          return NextResponse.json(
            { error: "Cannot remove the last admin" },
            { status: 400 }
          );
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updates,
      });

      return NextResponse.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: error.issues },
          { status: 400 }
        );
      }

      console.error("Error updating user:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
