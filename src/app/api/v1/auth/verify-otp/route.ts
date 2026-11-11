import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import {
  ADMIN_TRUSTED_DEVICE_COOKIE,
  ADMIN_TRUSTED_DEVICE_TTL_SECONDS,
  type AdminMfaChallengePayload,
  applyRoleSessionPolicy,
  buildOnboardingChecklist,
  consumeAdminMfaChallenge,
  createAdminTrustedDeviceToken,
  getAdminCredentialFingerprint,
  normalizeUserRole,
  resolveAdminScope,
  verifyAdminMfaChallengeToken,
  verifyPortalRoleMatch,
} from "@/lib/auth-guard";
import { signBetterAuthSessionToken } from "@/lib/google-oauth";
import { protectOtpEndpoint } from "@/lib/arcjet";
import { verifyOtpSchema } from "@/lib/validators/auth";
import { db } from "@/db";
import {
  session as sessionTable,
  user as userTable,
} from "@/db/schema";
import { sendWelcomeOnboardingEmail } from "@/lib/resend";

/**
 * POST /api/v1/auth/verify-otp
 * Unified 6-digit Email OTP handler for:
 * - Web Admin Portal Mandatory Step-Up MFA (`action: "admin-mfa"`)
 * - Artisan & Customer Mobile App Email Verification (`action: "verify-email"`)
 * - Mobile Passwordless OTP Sign-In (`action: "sign-in"`)
 * - Password Reset with Full Session Revocation (`action: "reset-password"`)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = verifyOtpSchema.safeParse({
      ...body,
      newPassword: body.newPassword ?? body.password,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Valid email address and OTP parameters are required",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const {
      action,
      email: normalizedEmail,
      otp,
      type = "email-verification",
      mfaChallengeToken,
      trustDevice,
      portal,
      newPassword,
    } = parsed.data;

    // 1. Arcjet + Sliding Window OTP Rate Limit (prevents 6-digit OTP brute force & email bombing)
    const blocked = await protectOtpEndpoint(req, normalizedEmail, action);
    if (blocked) return blocked;

    // 2. Check user standing and 1-Email-1-Role portal isolation if account exists
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
            "This account has been suspended. Please contact Skilled4U Trust & Safety.",
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
            error: portalMatch.error,
            code: portalMatch.code,
          },
          { status: portalMatch.status }
        );
      }
    }

    if (action === "send") {
      // Mitigate unauthenticated email bombing: only dispatch OTP if account exists
      if (existingUser) {
        await auth.api.sendVerificationOTP({
          body: {
            email: normalizedEmail,
            type,
          },
        });
      }
      return NextResponse.json({
        data: {
          sent: true,
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

      const wasAlreadyVerified = Boolean(existingUser?.emailVerified);

      const result = await auth.api.verifyEmailOTP({
        body: {
          email: normalizedEmail,
          otp: String(otp).trim(),
        },
      });

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

      let welcomeEmailSent = false;
      const targetUserForWelcome = updatedUser || result.user;
      if (targetUserForWelcome && !wasAlreadyVerified) {
        const welcomeRole = normalizeUserRole(updatedUser?.role);
        const welcomeRes = await sendWelcomeOnboardingEmail({
          to: targetUserForWelcome.email,
          name: targetUserForWelcome.name || "Valued Member",
          role: welcomeRole,
          city: updatedUser?.city || undefined,
        });
        welcomeEmailSent = welcomeRes.success;
      }

      const sessionPolicy =
        result.token && updatedUser
          ? await applyRoleSessionPolicy(result.token, updatedUser.role, {
              revokeOtherArtisanSessions: false,
            })
          : null;

      return NextResponse.json({
        data: {
          verified: true,
          welcomeEmailSent,
          token: result.token || null,
          sessionPolicy,
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

    // Web Admin Two-Step MFA Verification (requires valid 5-minute mfaChallengeToken + 6-digit OTP)
    if (action === "admin-mfa") {
      if (!otp) {
        return NextResponse.json(
          { error: "6-digit OTP code is required", code: "MISSING_OTP" },
          { status: 400 }
        );
      }

      const challengeCheck = verifyAdminMfaChallengeToken(
        mfaChallengeToken,
        normalizedEmail
      );
      if (!challengeCheck.ok) {
        return NextResponse.json(
          {
            error: challengeCheck.error,
            code: "INVALID_MFA_CHALLENGE",
          },
          { status: 401 }
        );
      }

      if (!existingUser || normalizeUserRole(existingUser.role) !== "admin") {
        return NextResponse.json(
          {
            error: "Forbidden: Administrator account required.",
            code: "FORBIDDEN_PORTAL",
          },
          { status: 403 }
        );
      }

      const baResponse = await auth.api.signInEmailOTP({
        body: {
          email: normalizedEmail,
          otp: String(otp).trim(),
        },
        headers: req.headers,
        asResponse: true,
      });

      if (!baResponse.ok) {
        const errBody = await baResponse.json().catch(() => ({}));
        return NextResponse.json(
          {
            error:
              (errBody as { message?: string })?.message ||
              "Invalid or expired 6-digit verification code.",
            code: "INVALID_OTP",
          },
          { status: 401 }
        );
      }

      // Invalidate challenge token so it cannot be replayed
      consumeAdminMfaChallenge(
        challengeCheck.payload.jti,
        challengeCheck.payload.expiresAt
      );

      const otpSignInData = (await baResponse.json()) as {
        token?: string;
        user?: { id: string; email: string };
      };
      const rawToken = otpSignInData.token || "";

      if (!rawToken) {
        return NextResponse.json(
          {
            error: "Failed to issue Administrator session after OTP verification.",
            code: "SESSION_ISSUE_FAILED",
          },
          { status: 500 }
        );
      }

      const sessionPolicy = await applyRoleSessionPolicy(rawToken, "admin");
      const baseToken = rawToken.includes(".")
        ? rawToken.split(".")[0]
        : rawToken;
      const [sessionRow] = await db
        .select()
        .from(sessionTable)
        .where(eq(sessionTable.token, baseToken))
        .limit(1);

      const onboardingChecklist = buildOnboardingChecklist(existingUser, null);

      const response = NextResponse.json({
        data: {
          verified: true,
          mfaCompleted: true,
          trustedDevice: Boolean(trustDevice),
          mustChangePassword: Boolean(existingUser.mustChangePassword),
          adminScope: resolveAdminScope(existingUser),
          token: rawToken,
          user: existingUser,
          session: sessionRow
            ? {
                id: sessionRow.id,
                token: sessionRow.token,
                userId: sessionRow.userId,
                expiresAt: sessionPolicy.expiresAt,
                updatedAt: sessionRow.updatedAt,
              }
            : null,
          sessionPolicy,
          onboardingChecklist,
        },
      });

      const isHttps =
        req.nextUrl.protocol === "https:" ||
        req.headers.get("x-forwarded-proto") === "https";
      const setCookieHeaders =
        typeof baResponse.headers.getSetCookie === "function"
          ? baResponse.headers.getSetCookie()
          : [];

      if (setCookieHeaders.length > 0) {
        for (const cookieStr of setCookieHeaders) {
          const updatedCookie = cookieStr.replace(
            /Max-Age=\d+/i,
            `Max-Age=${sessionPolicy.maxAgeSeconds}`
          );
          response.headers.append("Set-Cookie", updatedCookie);
        }
      } else {
        response.cookies.set(
          "better-auth.session_token",
          signBetterAuthSessionToken(rawToken),
          {
            httpOnly: true,
            sameSite: "lax",
            secure: isHttps,
            path: "/",
            maxAge: sessionPolicy.maxAgeSeconds,
          }
        );
      }

      if (trustDevice) {
        const trustedToken = createAdminTrustedDeviceToken({
          userId: existingUser.id,
          email: existingUser.email,
          credentialFingerprint: await getAdminCredentialFingerprint(
            existingUser.id
          ),
        });
        response.cookies.set(ADMIN_TRUSTED_DEVICE_COOKIE, trustedToken, {
          httpOnly: true,
          sameSite: "lax",
          secure: isHttps,
          path: "/",
          maxAge: ADMIN_TRUSTED_DEVICE_TTL_SECONDS,
        });
      } else {
        response.cookies.delete(ADMIN_TRUSTED_DEVICE_COOKIE);
      }

      return response;
    }

    if (action === "sign-in") {
      if (!otp) {
        return NextResponse.json(
          { error: "6-digit OTP code is required" },
          { status: 400 }
        );
      }

      let verifiedAdminChallenge: AdminMfaChallengePayload | null = null;
      if (existingUser && normalizeUserRole(existingUser.role) === "admin") {
        const challengeCheck = verifyAdminMfaChallengeToken(
          mfaChallengeToken,
          normalizedEmail
        );
        if (!challengeCheck.ok) {
          return NextResponse.json(
            {
              error:
                "Administrators must verify their password first before completing 6-digit OTP sign-in.",
              code: "ADMIN_PASSWORD_STEP_REQUIRED",
            },
            { status: 403 }
          );
        }
        verifiedAdminChallenge = challengeCheck.payload;
      }

      const result = await auth.api.signInEmailOTP({
        body: {
          email: normalizedEmail,
          otp: String(otp).trim(),
        },
      });

      if (verifiedAdminChallenge) {
        consumeAdminMfaChallenge(
          verifiedAdminChallenge.jti,
          verifiedAdminChallenge.expiresAt
        );
      }

      const [dbUser] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, normalizedEmail))
        .limit(1);

      const sessionPolicy =
        result.token && dbUser
          ? await applyRoleSessionPolicy(result.token, dbUser.role)
          : null;

      return NextResponse.json({
        data: {
          token: result.token,
          sessionPolicy,
          user: dbUser || result.user,
        },
      });
    }

    if (action === "reset-password") {
      if (!otp || !newPassword) {
        return NextResponse.json(
          { error: "Both 6-digit OTP code and new password are required" },
          { status: 400 }
        );
      }

      const result = await auth.api.resetPasswordEmailOTP({
        body: {
          email: normalizedEmail,
          otp: String(otp).trim(),
          password: String(newPassword),
        },
      });

      // Security best practice: revoke all existing sessions across all devices on password reset
      if (existingUser) {
        await db
          .delete(sessionTable)
          .where(eq(sessionTable.userId, existingUser.id));
        await db
          .update(userTable)
          .set({
            mustChangePassword: false,
            updatedAt: new Date(),
          })
          .where(eq(userTable.id, existingUser.id));
      }

      return NextResponse.json({
        data: {
          success: result.success,
          email: normalizedEmail,
          sessionsRevoked: true,
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
