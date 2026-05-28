import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth";
import { rateLimit, rateLimitExceeded } from "@/lib/rateLimit";
import { z } from "zod";

const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
  inviteCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // Rate limiting: max 3 registration attempts per minute per IP
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(`register:${ip}`, 3, 60 * 1000)) {
    return rateLimitExceeded();
  }

  // Security: Check if public registration is enabled
  const allowPublicReg = process.env.ALLOW_PUBLIC_REGISTRATION !== "false";
  if (!allowPublicReg) {
    return NextResponse.json(
      {
        error: "Registration is disabled. Contact your administrator.",
      },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();

    const { email, name, password, inviteCode } = RegisterSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Determine user role - first user is ADMIN, others are VIEWER
    const userCount = await prisma.user.count();
    const userRole = userCount === 0 ? "ADMIN" : "VIEWER";

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: userRole,
      },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set cookie
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
      { status: 201 }
    );

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
