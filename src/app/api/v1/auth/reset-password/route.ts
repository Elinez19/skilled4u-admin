import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { normalizeUserRole, verifyPortalRoleMatch } from "@/lib/auth-guard";
import { protectOtpEndpoint } from "@/lib/arcjet";
import { db } from "@/db";
import {
  session as sessionTable,
  user as userTable,
  verification as verificationTable,
} from "@/db/schema";

const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email("Please enter a valid email address.")
      .transform((v) => v.toLowerCase())
      .optional(),
    otp: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Security code must be a 6-digit numeric code.")
      .optional(),
    token: z.string().trim().optional(),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters long.")
      .max(128, "Password is too long."),
    portal: z.enum(["admin", "mobile", "customer", "client", "artisan"]).optional(),
  })
  .refine(
    (data) => Boolean((data.email && data.otp) || data.token),
    {
      message: "Please enter your 6-digit verification code or use a valid reset link.",
      path: ["otp"],
    }
  );

/**
 * POST /api/v1/auth/reset-password
 * Completes the password reset workflow:
 * - Supports 6-digit Email OTP (`email` + `otp` + `newPassword`)
 * - Supports Secure Reset Token (`token` + `newPassword`)
 * - Revokes all active sessions across all devices
 * - Clears `mustChangePassword = false`
 * - Protected by Arcjet rate limiting
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parsed = resetPasswordSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Please provide your verification code and a new password (min 8 characters).",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const { email: normalizedEmail, otp, token, newPassword, portal } = parsed.data;

    // 1. Rate limiting protection
    const rateLimitKey = normalizedEmail || token || "token";
    const blocked = await protectOtpEndpoint(req, rateLimitKey, "reset-password");
    if (blocked) return blocked;

    let targetUserId: string | null = null;
    let targetUserEmail = normalizedEmail;

    // 2. Execute password reset
    if (token) {
      // Find verification record to identify target user if email not provided
      if (!targetUserEmail) {
        const [verRow] = await db
          .select()
          .from(verificationTable)
          .where(eq(verificationTable.value, token))
          .limit(1);
        if (verRow?.identifier) {
          targetUserEmail = verRow.identifier.toLowerCase();
        }
      }

      try {
        await auth.api.resetPassword({
          body: {
            newPassword,
            token,
          },
          headers: req.headers,
        });
      } catch (tokenErr) {
        return NextResponse.json(
          {
            error:
              "This password reset link is invalid or has expired. Please request a new code or link.",
            code: "INVALID_RESET_TOKEN",
          },
          { status: 400 }
        );
      }
    } else if (normalizedEmail && otp) {
      // Verify account standing before resetting via OTP
      const [userRow] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, normalizedEmail))
        .limit(1);

      if (
        userRow &&
        (userRow.banned || userRow.accountStatus === "suspended")
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

      if (userRow && portal) {
        const portalMatch = verifyPortalRoleMatch({
          userRole: normalizeUserRole(userRow.role),
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

      try {
        await auth.api.resetPasswordEmailOTP({
          body: {
            email: normalizedEmail,
            otp: String(otp).trim(),
            password: String(newPassword),
          },
        });
        if (userRow) {
          targetUserId = userRow.id;
        }
      } catch (otpErr) {
        return NextResponse.json(
          {
            error:
              "The 6-digit verification code is invalid or has expired. Please check your email or request a new code.",
            code: "INVALID_OTP",
          },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        {
          error: "Please enter your 6-digit verification code or click a valid reset link.",
          code: "MISSING_CREDENTIALS",
        },
        { status: 400 }
      );
    }

    // 3. Security housekeeping: revoke all active sessions across devices
    if (!targetUserId && targetUserEmail) {
      const [u] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, targetUserEmail))
        .limit(1);
      if (u) targetUserId = u.id;
    }

    if (targetUserId) {
      await db
        .delete(sessionTable)
        .where(eq(sessionTable.userId, targetUserId));

      await db
        .update(userTable)
        .set({
          mustChangePassword: false,
          updatedAt: new Date(),
        })
        .where(eq(userTable.id, targetUserId));
    }

    return NextResponse.json({
      success: true,
      message:
        "Your password has been reset successfully! Please sign in with your new password.",
      data: {
        email: targetUserEmail,
        sessionsRevoked: true,
      },
    });
  } catch (error) {
    console.error("POST /api/v1/auth/reset-password error:", error);
    return NextResponse.json(
      {
        error:
          "We could not reset your password right now. Please check your connection and try again.",
      },
      { status: 500 }
    );
  }
}
