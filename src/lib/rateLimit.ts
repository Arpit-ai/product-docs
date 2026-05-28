import { NextResponse } from "next/server";

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis
 */
export function rateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 60 * 1000 // 1 minute
): boolean {
  const now = Date.now();
  const record = store[identifier];

  // Clean up expired entries
  if (record && record.resetTime < now) {
    delete store[identifier];
  }

  // Initialize or check limit
  if (!store[identifier]) {
    store[identifier] = { count: 1, resetTime: now + windowMs };
    return true;
  }

  if (store[identifier].count < limit) {
    store[identifier].count++;
    return true;
  }

  return false;
}

/**
 * Middleware response for rate limit exceeded
 */
export function rateLimitExceeded(retryAfter: number = 60) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfter.toString(),
      },
    }
  );
}
