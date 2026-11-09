import { NextRequest, NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import {
  buildOnboardingChecklist,
  requireAuth,
} from "@/lib/auth-guard";
import { updateMeSchema } from "@/lib/validators/auth";
import { db } from "@/db";
import { artisans, user as userTable } from "@/db/schema";

/**
 * GET /api/v1/auth/me
 * Returns the authenticated user's profile, session metadata, role-based session timeout policy,
 * onboarding checklist, and linked artisan profile.
 * Enforces sliding idle timeouts (30m Admin / 24h Artisan / 7d Client) and hard max lifetime.
 */
export async function GET(req: NextRequest) {
  try {
    const guard = await requireAuth(req);
    if (!guard.ok) {
      return guard.response;
    }

    const { user, session, sessionPolicy } = guard.auth;
    let artisanProfile = null;

    if (user.role === "artisan") {
      const [foundArtisan] = await db
        .select()
        .from(artisans)
        .where(
          or(eq(artisans.userId, user.id), eq(artisans.email, user.email))
        )
        .limit(1);
      artisanProfile = foundArtisan
        ? { ...foundArtisan, ninEncrypted: null, ninHash: null }
        : null;
    }

    const onboardingChecklist = buildOnboardingChecklist(user, artisanProfile);

    return NextResponse.json({
      data: {
        user,
        session,
        sessionPolicy,
        artisanProfile,
        onboardingChecklist,
      },
    });
  } catch (error) {
    if (
      (error as { digest?: string })?.digest === "NEXT_PRERENDER_INTERRUPTED"
    ) {
      throw error;
    }
    console.error("GET /api/v1/auth/me error:", error);
    return NextResponse.json(
      { error: "Failed to resolve current user profile" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/auth/me
 * Updates the currently authenticated user's own profile fields.
 */
export async function PATCH(req: NextRequest) {
  try {
    const guard = await requireAuth(req);
    if (!guard.ok) {
      return guard.response;
    }

    const rawBody = await req.json().catch(() => ({}));
    const parsed = updateMeSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || "Invalid profile update data",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const { user, session, sessionPolicy } = guard.auth;
    const { name, phone, city, address, image } = parsed.data;

    const [updatedUser] = await db
      .update(userTable)
      .set({
        ...(name !== undefined ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(city !== undefined ? { city } : {}),
        ...(address !== undefined ? { address } : {}),
        ...(image !== undefined ? { image } : {}),
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, user.id))
      .returning();

    let artisanProfile = null;
    if (updatedUser.role === "artisan") {
      const [foundArtisan] = await db
        .select()
        .from(artisans)
        .where(
          or(
            eq(artisans.userId, updatedUser.id),
            eq(artisans.email, updatedUser.email)
          )
        )
        .limit(1);

      if (foundArtisan) {
        const [updatedArtisan] = await db
          .update(artisans)
          .set({
            ...(name !== undefined ? { name } : {}),
            ...(phone ? { phone } : {}),
            ...(city ? { city } : {}),
            ...(address ? { address } : {}),
            updatedAt: new Date(),
          })
          .where(eq(artisans.id, foundArtisan.id))
          .returning();
        artisanProfile = updatedArtisan
          ? { ...updatedArtisan, ninEncrypted: null, ninHash: null }
          : null;
      }
    }

    return NextResponse.json({
      data: {
        user: updatedUser,
        session,
        sessionPolicy,
        artisanProfile,
        onboardingChecklist: buildOnboardingChecklist(
          updatedUser,
          artisanProfile
        ),
      },
    });
  } catch (error) {
    console.error("PATCH /api/v1/auth/me error:", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}
