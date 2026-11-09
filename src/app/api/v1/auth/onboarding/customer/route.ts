import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { resolveAuthSession } from "@/lib/auth-guard";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { sendWelcomeOnboardingEmail } from "@/lib/resend";

/**
 * POST /api/v1/auth/onboarding/customer
 * Completes Customer Mobile App onboarding (Step 3: Phone, Dispatch City & Neighborhood Address).
 * Authenticates via Mobile `Authorization: Bearer <token>` or Web Session Cookie,
 * or accepts `userId` / `email` during guided onboarding.
 */
export async function POST(req: NextRequest) {
  try {
    const authCtx = await resolveAuthSession(req);
    const body = await req.json();
    const {
      userId: bodyUserId,
      email: bodyEmail,
      name,
      phone,
      city,
      address,
    } = body;

    let targetUser = authCtx?.user || null;

    if (!targetUser && bodyUserId) {
      const [found] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, String(bodyUserId)))
        .limit(1);
      targetUser = found || null;
    } else if (!targetUser && bodyEmail) {
      const [found] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, String(bodyEmail).trim().toLowerCase()))
        .limit(1);
      targetUser = found || null;
    }

    if (!targetUser) {
      return NextResponse.json(
        {
          error:
            "Unauthorized: Please provide a valid Bearer token or user identifier",
        },
        { status: 401 }
      );
    }

    const resolvedPhone = phone || targetUser.phone || "+234 803 000 0000";
    const resolvedCity = city || targetUser.city || "Abuja (Wuse II)";
    const resolvedAddress = address || targetUser.address || resolvedCity;
    const resolvedName = name || targetUser.name;

    const [updatedUser] = await db
      .update(userTable)
      .set({
        name: resolvedName,
        phone: resolvedPhone,
        city: resolvedCity,
        address: resolvedAddress,
        role: "client",
        onboardingStatus: "completed",
        onboardingStep: 3,
        accountStatus: "active",
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, targetUser.id))
      .returning();

    const emailResult = await sendWelcomeOnboardingEmail({
      to: updatedUser.email,
      name: updatedUser.name,
      role: "client",
      city: resolvedCity,
    });

    return NextResponse.json({
      data: {
        user: updatedUser,
        onboarding: {
          role: "client",
          status: "completed",
          step: 3,
          readyToBook: true,
        },
        welcomeEmailSent: emailResult.success,
      },
    });
  } catch (error) {
    console.error("POST /api/v1/auth/onboarding/customer error:", error);
    return NextResponse.json(
      { error: "Failed to complete customer onboarding" },
      { status: 500 }
    );
  }
}

