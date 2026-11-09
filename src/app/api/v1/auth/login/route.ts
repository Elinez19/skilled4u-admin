import { NextRequest, NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { auth } from "@/lib/auth";
import {
  applyRoleSessionPolicy,
  buildOnboardingChecklist,
  createAdminMfaChallengeToken,
  normalizeUserRole,
  resolveAdminScope,
  verifyPortalRoleMatch,
} from "@/lib/auth-guard";
import { protectAuthLogin } from "@/lib/arcjet";
import { loginSchema } from "@/lib/validators/auth";
import { db } from "@/db";
import {
  artisans,
  session as sessionTable,
  user as userTable,
} from "@/db/schema";

/**
 * POST /api/v1/auth/login
 * Unified authentication endpoint for:
 * - Web Admin Portal (`portal: "admin"` -> Enforces mandatory 2-step Password + 6-digit Email OTP MFA)
 * - Artisan Mobile App (`portal: "artisan"` -> Enforces strict 1-Email-1-Role & Single Active Device)
 * - Customer Mobile App (`portal: "customer"` -> Enforces strict 1-Email-1-Role & 30d/7d session policy)
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parsed = loginSchema.safeParse(rawBody);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        {
          error: firstIssue?.message || "Invalid email or password format",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const { email, password, portal, expectedRole } = parsed.data;

    // 1. Arcjet + Sliding Window Brute-Force Protection
    const blocked = await protectAuthLogin(req, email);
    if (blocked) return blocked;

    // 2. Pre-check account standing and 1-Email-1-Role portal isolation if user exists
    const [existingUser] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))
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

    if (existingUser) {
      const portalMatch = verifyPortalRoleMatch({
        userRole: normalizeUserRole(existingUser.role),
        portal,
        expectedRole,
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

    // 3. Authenticate via Better Auth (asResponse: true to capture signed Set-Cookie headers)
    const baResponse = await auth.api.signInEmail({
      body: {
        email,
        password,
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
            "Invalid credentials. Please verify your email and password.",
          code: "INVALID_CREDENTIALS",
        },
        { status: 401 }
      );
    }

    const signInData = (await baResponse.json()) as {
      token?: string;
      user?: { id: string; email: string };
    };

    const userId = signInData?.user?.id || existingUser?.id;
    const rawToken = signInData?.token || "";

    if (!userId || !rawToken) {
      return NextResponse.json(
        {
          error: "Invalid credentials. Please verify your email and password.",
          code: "INVALID_CREDENTIALS",
        },
        { status: 401 }
      );
    }

    const [dbUser] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1);

    if (!dbUser) {
      return NextResponse.json(
        { error: "User record not found", code: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }

    const role = normalizeUserRole(dbUser.role);
    const baseToken = rawToken.includes(".")
      ? rawToken.split(".")[0]
      : rawToken;

    // Enforce strict portal & role matching post-authentication
    const postAuthMatch = verifyPortalRoleMatch({
      userRole: role,
      portal,
      expectedRole,
    });
    if (!postAuthMatch.ok) {
      await db.delete(sessionTable).where(eq(sessionTable.token, baseToken));
      return NextResponse.json(
        {
          error: postAuthMatch.error,
          code: postAuthMatch.code,
        },
        { status: postAuthMatch.status }
      );
    }

    // 4. MANDATORY TWO-STEP ADMIN MFA:
    // For Administrators, revoke the preliminary password-only session immediately,
    // dispatch a 6-digit Email OTP, and return an HMAC-signed 5-minute mfaChallengeToken.
    if (role === "admin" || portal === "admin") {
      await db.delete(sessionTable).where(eq(sessionTable.token, baseToken));

      await auth.api.sendVerificationOTP({
        body: {
          email: dbUser.email,
          type: "sign-in",
        },
      });

      const mfaChallengeToken = createAdminMfaChallengeToken({
        userId: dbUser.id,
        email: dbUser.email,
      });

      return NextResponse.json(
        {
          data: {
            mfaRequired: true,
            mfaChallengeToken,
            email: dbUser.email,
            mustChangePassword: Boolean(dbUser.mustChangePassword),
            adminScope: resolveAdminScope(dbUser),
            message:
              "Step 1 verified. Enter the 6-digit security code sent to your administrator email to complete sign-in.",
          },
        },
        { status: 200 }
      );
    }

    // 5. Stamp role-based session timeout & enforce single-device concurrency for Artisans
    const sessionPolicy = await applyRoleSessionPolicy(rawToken, role);

    const [sessionRow] = await db
      .select()
      .from(sessionTable)
      .where(eq(sessionTable.token, baseToken))
      .limit(1);

    let artisanProfile = null;
    if (role === "artisan") {
      const [foundArtisan] = await db
        .select()
        .from(artisans)
        .where(
          or(
            eq(artisans.userId, dbUser.id),
            eq(artisans.email, dbUser.email)
          )
        )
        .limit(1);
      artisanProfile = foundArtisan || null;
    }

    const onboardingChecklist = buildOnboardingChecklist(dbUser, artisanProfile);

    const response = NextResponse.json({
      data: {
        mfaRequired: false,
        user: dbUser,
        token: rawToken,
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
        artisanProfile,
        onboardingChecklist,
      },
    });

    // Forward signed cookies from Better Auth and align Max-Age with role session policy
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
      response.cookies.set("better-auth.session_token", rawToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: sessionPolicy.maxAgeSeconds,
      });
    }

    return response;
  } catch (error) {
    console.error("POST /api/v1/auth/login error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Authentication failed",
      },
      { status: 500 }
    );
  }
}
