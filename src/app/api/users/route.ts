import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  return withAdminAuth(request, async (req, user) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          active: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
