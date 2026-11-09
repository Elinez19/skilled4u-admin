import { NextRequest, NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { session as sessionTable } from "@/db/schema";

/**
 * POST /api/v1/auth/logout
 * Revokes the active session in NeonDB (via Session Cookie or Authorization Bearer token)
 * and clears browser authentication cookies.
 */
export async function POST(req: NextRequest) {
  try {
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

    for (const tok of tokensToRevoke) {
      await db
        .delete(sessionTable)
        .where(
          or(eq(sessionTable.token, tok), eq(sessionTable.id, tok))
        );
    }

    const response = NextResponse.json({
      data: {
        loggedOut: true,
        revokedTokens: tokensToRevoke.size,
      },
    });

    response.cookies.set("better-auth.session_token", "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    response.cookies.set("__Secure-better-auth.session_token", "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("POST /api/v1/auth/logout error:", error);
    return NextResponse.json(
      { error: "Failed to complete sign-out" },
      { status: 500 }
    );
  }
}

