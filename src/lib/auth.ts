import jwt, { type SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "7d";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required for authentication");
  }
  return secret;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(
    { ...payload },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRATION } as SignOptions
  );
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JWTPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("auth-token")?.value || null;
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = await getAuthToken();
  if (!token) return null;
  return verifyToken(token);
}

import { NextRequest } from "next/server";
import { validateApiToken } from "./apiToken";

export interface AuthContext {
  userId: string;
  email?: string;
  role?: string;
}

export async function validateAuth(request: NextRequest): Promise<AuthContext | null> {
  const authHeader = request.headers.get("Authorization") || "";

  // Try Bearer token (JWT or API token)
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);

    // First try as JWT
    const jwtPayload = verifyToken(token);
    if (jwtPayload) {
      return {
        userId: jwtPayload.userId,
        email: jwtPayload.email,
        role: jwtPayload.role,
      };
    }

    // Then try as API token
    const apiTokenResult = await validateApiToken(token);
    if (apiTokenResult.valid && apiTokenResult.userId) {
      return {
        userId: apiTokenResult.userId,
      };
    }
  }

  return null;
}
