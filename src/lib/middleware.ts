import { NextRequest, NextResponse } from "next/server";
import { verifyToken, JWTPayload } from "./auth";

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.replace(/^Bearer\s+/i, "").trim();
  if (bearer) return bearer;

  return request.cookies.get("auth-token")?.value ?? null;
}

export async function withAuth(
  request: NextRequest,
  handler: (
    req: NextRequest,
    user: JWTPayload
  ) => Promise<NextResponse>
): Promise<NextResponse> {
  const token = getTokenFromRequest(request);

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  return handler(request, user);
}

export async function withAdminAuth(
  request: NextRequest,
  handler: (
    req: NextRequest,
    user: JWTPayload
  ) => Promise<NextResponse>
): Promise<NextResponse> {
  return withAuth(request, async (req, user) => {
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return handler(req, user);
  });
}

export async function withEditorAuth(
  request: NextRequest,
  handler: (
    req: NextRequest,
    user: JWTPayload
  ) => Promise<NextResponse>
): Promise<NextResponse> {
  return withAuth(request, async (req, user) => {
    if (user.role !== "ADMIN" && user.role !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return handler(req, user);
  });
}

/** Any authenticated user including VIEWER (read-only role). */
export async function withViewerAuth(
  request: NextRequest,
  handler: (
    req: NextRequest,
    user: JWTPayload
  ) => Promise<NextResponse>
): Promise<NextResponse> {
  return withAuth(request, handler);
}
