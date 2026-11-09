import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";

/**
 * POST /api/v1/auth/verify-otp
 * Unified 6-digit Email OTP handler for Web Admin, Artisan Mobile App, and Customer Mobile App.
 * Actions:
 * - "send": Dispatches a 6-digit OTP via Resend (`type`: "email-verification" | "sign-in" | "forget-password")
 * - "verify-email": Verifies email ownership with 6-digit OTP and advances onboarding step
 * - "sign-in": Passwordless sign-in with 6-digit OTP (returns user + bearer token)
 * - "reset-password": Resets account password using 6-digit OTP
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action = "verify-email",
      email,
      otp,
      type = "email-verification",
      password,
    } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (action === "send") {
      const result = await auth.api.sendVerificationOTP({
        body: {
          email: normalizedEmail,
          type,
        },
      });
      return NextResponse.json({
        data: {
          sent: result.success,
          email: normalizedEmail,
          type,
        },
      });
    }

    if (action === "verify-email") {
      if (!otp) {
        return NextResponse.json(
          { error: "6-digit OTP code is required" },
          { status: 400 }
        );
      }

      const result = await auth.api.verifyEmailOTP({
        body: {
          email: normalizedEmail,
          otp: String(otp).trim(),
        },
      });

      const [existingUser] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, normalizedEmail))
        .limit(1);

      let updatedUser = existingUser;
      if (existingUser) {
        const nextStep = Math.max(existingUser.onboardingStep || 1, 2);
        const [saved] = await db
          .update(userTable)
          .set({
            emailVerified: true,
            onboardingStep: nextStep,
            onboardingStatus:
              existingUser.onboardingStatus === "not_started"
                ? "in_progress"
                : existingUser.onboardingStatus,
            updatedAt: new Date(),
          })
          .where(eq(userTable.id, existingUser.id))
          .returning();
        updatedUser = saved;
      }

      return NextResponse.json({
        data: {
          verified: true,
          token: result.token || null,
          user: updatedUser || result.user,
          onboarding: updatedUser
            ? {
                role: updatedUser.role,
                status: updatedUser.onboardingStatus,
                step: updatedUser.onboardingStep,
                nextStep:
                  updatedUser.role === "artisan"
                    ? "artisan_trade_profile"
                    : updatedUser.role === "client"
                      ? "customer_location_profile"
                      : "completed",
              }
            : null,
        },
      });
    }

    if (action === "sign-in") {
      if (!otp) {
        return NextResponse.json(
          { error: "6-digit OTP code is required" },
          { status: 400 }
        );
      }

      const result = await auth.api.signInEmailOTP({
        body: {
          email: normalizedEmail,
          otp: String(otp).trim(),
        },
      });

      const [dbUser] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, normalizedEmail))
        .limit(1);

      return NextResponse.json({
        data: {
          token: result.token,
          user: dbUser || result.user,
        },
      });
    }

    if (action === "reset-password") {
      if (!otp || !password) {
        return NextResponse.json(
          { error: "Both 6-digit OTP code and new password are required" },
          { status: 400 }
        );
      }

      const result = await auth.api.resetPasswordEmailOTP({
        body: {
          email: normalizedEmail,
          otp: String(otp).trim(),
          password: String(password),
        },
      });

      return NextResponse.json({
        data: {
          success: result.success,
          email: normalizedEmail,
        },
      });
    }

    return NextResponse.json(
      { error: `Unsupported action: ${action}` },
      { status: 400 }
    );
  } catch (error) {
    console.error("POST /api/v1/auth/verify-otp error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "OTP verification request failed",
      },
      { status: 400 }
    );
  }
}

