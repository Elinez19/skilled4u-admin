import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handlers = toNextJsHandler(auth);

/**
 * Direct Better Auth catch-all route handler.
 * Blocks unmediated direct email sign-in, sign-up, and OTP endpoints to enforce:
 * - Admin Two-Step Email OTP MFA
 * - 1-Email-1-Role portal isolation
 * - Arcjet / sliding-window brute-force rate limits
 * - Account suspension enforcement
 *
 * All legitimate clients authenticate via `/api/v1/auth/*`.
 */
const BLOCKED_DIRECT_ENDPOINTS = new Set([
  "/api/auth/sign-in/email",
  "/api/auth/sign-up/email",
  "/api/auth/sign-in/email-otp",
]);

export async function POST(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  if (BLOCKED_DIRECT_ENDPOINTS.has(pathname)) {
    return NextResponse.json(
      {
        error:
          "Direct authentication via /api/auth is disabled. Please use /api/v1/auth/login or /api/v1/auth/register.",
        code: "DIRECT_AUTH_DISABLED",
      },
      { status: 403 }
    );
  }
  return handlers.POST(req);
}

export const GET = handlers.GET;
