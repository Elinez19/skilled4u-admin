import { NextRequest, NextResponse } from "next/server";
import { inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { session as sessionTable } from "@/db/schema";

/**
 * POST /api/v1/auth/logout
 * Revokes the active session in NeonDB (via Session Cookie or Authorization Bearer token)
 * and clears browser authentication cookies.
 */
export async function POST(req: NextRequest) {
  const tokensToRevoke = new Set<string>();

  const authHeader = req.headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    const raw = authHeader.slice(7).trim();
    if (raw) {
      tokensToRevoke.add(raw);
      if (raw.includes(".")) {
        tokensToRevoke.add(raw.split(".")[0]);
      }
    }
  }

  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(
    /(?:__Secure-)?better-auth\.session_token=([^;]+)/
  );
  if (match?.[1]) {
    const decoded = decodeURIComponent(match[1].trim());
    tokensToRevoke.add(decoded);
    if (decoded.includes(".")) {
      tokensToRevoke.add(decoded.split(".")[0]);
    }
  }

  let revokeFailed = false;
  if (tokensToRevoke.size > 0) {
    // Single round-trip instead of one DELETE per token variant
    const tokens = [...tokensToRevoke];
    try {
      await db
        .delete(sessionTable)
        .where(
          or(inArray(sessionTable.token, tokens), inArray(sessionTable.id, tokens))
        );
    } catch (error) {
      revokeFailed = true;
      console.error("POST /api/v1/auth/logout session revoke error:", error);
    }
  }

  // Always clear browser cookies, even if the DB revoke failed, so sign-out is never blocked
  const response = NextResponse.json({
    data: {
      loggedOut: true,
      revokedTokens: revokeFailed ? 0 : tokensToRevoke.size,
    },
  });

  const isHttps =
    req.nextUrl.protocol === "https:" ||
    req.headers.get("x-forwarded-proto") === "https";

  response.cookies.set("better-auth.session_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    path: "/",
    maxAge: 0,
  });
  // `__Secure-` prefixed cookies can only be overwritten/cleared with the Secure attribute
  response.cookies.set("__Secure-better-auth.session_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0,
  });
  response.cookies.set("better-auth.session_data", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    path: "/",
    maxAge: 0,
  });
  // NOTE: The admin trusted-device cookie is intentionally preserved on sign-out so the
  // 6-digit OTP is only required on the first login per device (or after a password change).

  return response;
}
