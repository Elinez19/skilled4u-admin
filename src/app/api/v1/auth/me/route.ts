import { NextRequest, NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { resolveAuthSession } from "@/lib/auth-guard";
import { db } from "@/db";
import { artisans } from "@/db/schema";

/**
 * GET /api/v1/auth/me
 * Returns the authenticated user's profile, session metadata, role-specific onboarding checklist,
 * and linked artisan profile (for Artisan mobile app users).
 * Supports both Web Session Cookies and Mobile `Authorization: Bearer <token>`.
 */
export async function GET(req: NextRequest) {
  try {
    const authCtx = await resolveAuthSession(req);
    if (!authCtx) {
      return NextResponse.json(
        { error: "Unauthorized: No active session or valid Bearer token" },
        { status: 401 }
      );
    }

    const { user, session } = authCtx;
    let artisanProfile = null;

    if (user.role === "artisan") {
      const [foundArtisan] = await db
        .select()
        .from(artisans)
        .where(
          or(eq(artisans.userId, user.id), eq(artisans.email, user.email))
        )
        .limit(1);
      artisanProfile = foundArtisan || null;
    }

    const onboardingChecklist =
      user.role === "artisan"
        ? {
            accountCreated: true,
            emailVerified: user.emailVerified,
            tradeProfileCompleted: Boolean(
              artisanProfile && artisanProfile.trade
            ),
            kycSubmitted: Boolean(
              artisanProfile &&
                artisanProfile.ninNumber &&
                artisanProfile.bankAccountNumber
            ),
            kycVerified: artisanProfile?.kycStatus === "verified",
            currentStatus: user.onboardingStatus,
            currentStep: user.onboardingStep,
          }
        : user.role === "admin"
          ? {
              accountCreated: true,
              emailVerified: true,
              adminAccessActive: true,
              currentStatus: "completed",
              currentStep: 5,
            }
          : {
              accountCreated: true,
              emailVerified: user.emailVerified,
              locationProfileCompleted: Boolean(user.phone && user.city),
              currentStatus: user.onboardingStatus,
              currentStep: user.onboardingStep,
            };

    return NextResponse.json({
      data: {
        user,
        session,
        artisanProfile,
        onboardingChecklist,
      },
    });
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("GET /api/v1/auth/me error:", error);
    return NextResponse.json(
      { error: "Failed to resolve current user profile" },
      { status: 500 }
    );
  }
}

