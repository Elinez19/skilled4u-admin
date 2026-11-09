import { eq, and, gt } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { session as sessionTable, user as userTable, type UserRow } from "@/db/schema";

export interface ResolvedAuthContext {
  user: UserRow;
  session: {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
  };
}

/**
 * Resolves the authenticated user and session from either:
 * 1. Better Auth session cookie / signed bearer token (`auth.api.getSession`)
 * 2. Raw session token in `Authorization: Bearer <token>` header against NeonDB `session` table
 */
export async function resolveAuthSession(
  req: Request
): Promise<ResolvedAuthContext | null> {
  try {
    const baSession = await auth.api.getSession({
      headers: req.headers,
    });

    if (baSession?.user?.id && baSession?.session) {
      const [dbUser] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, baSession.user.id))
        .limit(1);

      if (dbUser && !dbUser.banned) {
        return {
          user: dbUser,
          session: {
            id: baSession.session.id,
            token: baSession.session.token,
            userId: baSession.session.userId,
            expiresAt: new Date(baSession.session.expiresAt),
          },
        };
      }
    }
  } catch {
    // Fallback to raw bearer token lookup below
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    const rawToken = authHeader.slice(7).trim();
    // Better Auth signed tokens sometimes have a `.signature` suffix; check both raw and base token
    const baseToken = rawToken.includes(".")
      ? rawToken.split(".")[0]
      : rawToken;

    if (baseToken) {
      const [foundSession] = await db
        .select()
        .from(sessionTable)
        .where(
          and(
            eq(sessionTable.token, baseToken),
            gt(sessionTable.expiresAt, new Date())
          )
        )
        .limit(1);

      if (foundSession) {
        const [dbUser] = await db
          .select()
          .from(userTable)
          .where(eq(userTable.id, foundSession.userId))
          .limit(1);

        if (dbUser && !dbUser.banned) {
          return {
            user: dbUser,
            session: {
              id: foundSession.id,
              token: foundSession.token,
              userId: foundSession.userId,
              expiresAt: foundSession.expiresAt,
            },
          };
        }
      }
    }
  }

  return null;
}

export function normalizeUserRole(
  roleInput?: string | null
): "admin" | "client" | "artisan" {
  const lower = (roleInput || "client").toLowerCase().trim();
  if (lower === "admin" || lower === "administrator") return "admin";
  if (lower === "artisan" || lower === "pro" || lower === "vendor") {
    return "artisan";
  }
  return "client"; // "client" or "customer" -> stored as "client"
}

