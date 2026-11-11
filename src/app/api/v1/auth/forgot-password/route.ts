import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { normalizeUserRole, verifyPortalRoleMatch } from "@/lib/auth-guard";
import { protectOtpEndpoint } from "@/lib/arcjet";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(3, "Please enter your registered email address.")
    .email("Please enter a valid email address.")
    .transform((v) => v.toLowerCase()),
  portal: z.enum(["admin", "mobile", "customer", "client", "artisan"]).optional(),
  deliveryMethod: z.enum(["otp", "link", "both"]).optional().default("both"),
});

/**
 * POST /api/v1/auth/forgot-password
 * Initiates the password recovery workflow:
 * - Generates and dispatches a 6-digit email OTP (via Better Auth emailOTP plugin)
 * - Optionally generates and dispatches a secure reset link (via Better Auth sendResetPassword)
 * - Protected by Arcjet rate limiting against brute-force and email spam
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parsed = forgotPasswordSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Please enter a valid email address.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const { email: normalizedEmail, portal, deliveryMethod = "both" } = parsed.data;

    // 1. Rate limiting protection
    const blocked = await protectOtpEndpoint(req, normalizedEmail, "forgot-password");
    if (blocked) return blocked;

    // 2. Lookup existing user
    const [existingUser] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, normalizedEmail))
      .limit(1);

    if (
      existingUser &&
      (existingUser.banned || existingUser.accountStatus === "suspended")
    ) {
      return NextResponse.json(
        {
          error:
            "This account is temporarily suspended. Please contact Skilled4U support for assistance.",
          code: "ACCOUNT_SUSPENDED",
        },
        { status: 403 }
      );
    }

    if (existingUser && portal) {
      const portalMatch = verifyPortalRoleMatch({
        userRole: normalizeUserRole(existingUser.role),
        portal,
      });
      if (!portalMatch.ok) {
        return NextResponse.json(
          {
            error:
              portal === "admin"
                ? "This email address is not registered as an Administrator."
                : "This email address is registered under a different portal.",
            code: portalMatch.code,
          },
          { status: portalMatch.status }
        );
      }
    }

    // 3. Dispatch OTP or Link if user exists
    if (existingUser) {
      // Send 6-digit OTP code by default or when requested
      if (deliveryMethod === "otp" || deliveryMethod === "both") {
        await auth.api.sendVerificationOTP({
          body: {
            email: normalizedEmail,
            type: "forget-password",
          },
        });
      }

      // Also dispatch reset link if link or both was requested
      if (deliveryMethod === "link" || deliveryMethod === "both") {
        const appUrl =
          process.env.NEXT_PUBLIC_APP_URL ||
          process.env.BETTER_AUTH_URL ||
          "https://skilled4u.com";

        await auth.api
          .requestPasswordReset({
            body: {
              email: normalizedEmail,
              redirectTo: `${appUrl}/reset-password`,
            },
            headers: req.headers,
          })
          .catch((linkErr) => {
            console.warn("[ForgotPassword] Link dispatch notice:", linkErr);
          });
      }
    }

    // Return unified friendly message (mitigates email enumeration while providing clear feedback)
    return NextResponse.json({
      success: true,
      message: `A 6-digit password reset code has been sent to ${normalizedEmail}.`,
      data: {
        email: normalizedEmail,
        sent: true,
      },
    });
  } catch (error) {
    console.error("POST /api/v1/auth/forgot-password error:", error);
    return NextResponse.json(
      {
        error:
          "We could not send a password reset code right now. Please check your connection and try again.",
      },
      { status: 500 }
    );
  }
}
