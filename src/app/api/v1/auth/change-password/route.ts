import { NextRequest, NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { buildOnboardingChecklist, requireAuth } from "@/lib/auth-guard";
import { protectMutationApi } from "@/lib/arcjet";
import { changePasswordSchema } from "@/lib/validators/auth";
import { db } from "@/db";
import { session as sessionTable, user as userTable } from "@/db/schema";

/**
 * POST /api/v1/auth/change-password
 * Rotates the authenticated user's password (used for mandatory first-login Admin password rotation
 * as well as standard authenticated password changes) and clears `mustChangePassword = false`.
 */
export async function POST(req: NextRequest) {
  try {
    const blocked = await protectMutationApi(req);
    if (blocked) return blocked;

    const guard = await requireAuth(req);
    if (!guard.ok) return guard.response;

    const rawBody = await req.json().catch(() => ({}));
    const parsed = changePasswordSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Current password and a new password (min 8 characters) are required",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword, revokeOtherSessions } = parsed.data;
    const { user, session } = guard.auth;

    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          error: "New password must be different from your temporary/current password.",
          code: "PASSWORD_UNCHANGED",
        },
        { status: 400 }
      );
    }

    // Verify current password and update scrypt hash via Better Auth changePassword
    try {
      await auth.api.changePassword({
        body: {
          currentPassword,
          newPassword,
          revokeOtherSessions: false,
        },
        headers: new Headers({
          authorization: `Bearer ${session.token}`,
        }),
      });
    } catch (err) {
      return NextResponse.json(
        {
          error:
            err instanceof Error && err.message
              ? err.message
              : "Current password is incorrect.",
          code: "INVALID_CURRENT_PASSWORD",
        },
        { status: 400 }
      );
    }

    if (revokeOtherSessions) {
      await db
        .delete(sessionTable)
        .where(
          and(
            eq(sessionTable.userId, user.id),
            ne(sessionTable.id, session.id)
          )
        );
    }

    const [updatedUser] = await db
      .update(userTable)
      .set({
        mustChangePassword: false,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, user.id))
      .returning();

    return NextResponse.json({
      data: {
        success: true,
        mustChangePassword: false,
        user: updatedUser,
        onboardingChecklist: buildOnboardingChecklist(updatedUser, null),
      },
    });
  } catch (error) {
    console.error("POST /api/v1/auth/change-password error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to change password",
      },
      { status: 500 }
    );
  }
}

