import { NextRequest, NextResponse, connection } from "next/server";
import { z } from "zod";
import { protectAuthLogin } from "@/lib/arcjet";
import {
  completeGoogleAuthentication,
  createOAuthStatePayload,
  GOOGLE_OAUTH_STATE_COOKIE,
  resolveGoogleRedirectUri,
  verifyGoogleIdToken,
  type GoogleOAuthPortal,
} from "@/lib/google-oauth";

const googlePostSchema = z.object({
  idToken: z.string().min(20, "Google idToken is required"),
  accessToken: z.string().optional(),
  portal: z
    .enum(["admin", "mobile", "customer", "client", "artisan"])
    .optional()
    .default("mobile"),
  role: z.string().optional(),
});

/**
 * GET /api/v1/auth/google (also reachable at /v1/auth/google)
 * Initiates the OAuth 2.0 Authorization Code flow with PKCE (S256) and an HMAC-signed CSRF state cookie.
 */
export async function GET(req: NextRequest) {
  try {
    await connection();
  } catch {
    // Direct invocation outside Next.js request store
  }

  const blocked = await protectAuthLogin(req);
  if (blocked) return blocked;

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    const fallbackUrl = new URL("/login", req.url);
    fallbackUrl.searchParams.set("error", "google_not_configured");
    return NextResponse.redirect(fallbackUrl);
  }

  const { searchParams } = req.nextUrl;
  const rawPortal = searchParams.get("portal")?.toLowerCase();
  const rawRole = searchParams.get("role")?.toLowerCase();

  // Google OAuth is only enabled for Mobile Customers and Artisans (disabled for Admins)
  if (
    rawPortal === "admin" ||
    rawRole === "admin" ||
    rawRole === "administrator"
  ) {
    return NextResponse.json(
      {
        error:
          "Forbidden: Google OAuth is disabled for Administrator accounts. Please sign in with email and password.",
        code: "FORBIDDEN_ADMIN_OAUTH",
      },
      { status: 403 }
    );
  }

  const portal: GoogleOAuthPortal =
    rawPortal === "artisan"
      ? "artisan"
      : rawPortal === "customer" || rawPortal === "client"
        ? "customer"
        : "mobile";
  const role: "client" | "artisan" =
    portal === "artisan" || rawRole === "artisan" || rawRole === "pro"
      ? "artisan"
      : "client";

  const callbackUrl = searchParams.get("callbackUrl") || "skilled4u://auth/callback";
  const forceConfiguredCallback =
    searchParams.get("useConfiguredCallback") === "true";

  const redirectUri = await resolveGoogleRedirectUri(
    req.nextUrl,
    forceConfiguredCallback
  );

  const { payload, codeChallenge, signedCookie } = createOAuthStatePayload({
    portal,
    role,
    callbackUrl,
    redirectUri,
  });

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("state", payload.state);
  googleAuthUrl.searchParams.set("code_challenge", codeChallenge);
  googleAuthUrl.searchParams.set("code_challenge_method", "S256");
  googleAuthUrl.searchParams.set("prompt", "select_account");
  googleAuthUrl.searchParams.set("access_type", "online");

  const response = NextResponse.redirect(googleAuthUrl.toString(), {
    status: 302,
  });

  const isHttps = req.nextUrl.protocol === "https:";
  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, signedCookie, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    path: "/",
    maxAge: 600, // 10 minutes
  });

  return response;
}

/**
 * POST /api/v1/auth/google (also reachable at /v1/auth/google)
 * Verifies a Google `idToken` (from Mobile Google Sign-In SDK or Web Google One Tap),
 * enforces RBAC and account standing, links the Google account, and returns a role-scoped session.
 */
export async function POST(req: NextRequest) {
  try {
    const blocked = await protectAuthLogin(req);
    if (blocked) return blocked;

    const rawBody = await req.json().catch(() => ({}));
    const parsed = googlePostSchema.safeParse(rawBody);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        {
          error: firstIssue?.message || "Invalid Google authentication payload",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const { idToken, accessToken, portal, role: rawRole } = parsed.data;
    const normalizedRole = (
      rawRole ||
      (portal === "artisan" ? "artisan" : "client")
    )
      .toLowerCase()
      .trim();

    // Block Administrator usage of Google OAuth entirely
    if (
      portal === "admin" ||
      normalizedRole === "admin" ||
      normalizedRole === "administrator"
    ) {
      return NextResponse.json(
        {
          error:
            "Forbidden: Google OAuth is disabled for Administrator accounts. Administrators must sign in with email and password.",
          code: "FORBIDDEN_ADMIN_OAUTH",
        },
        { status: 403 }
      );
    }

    const requestedRole: "client" | "artisan" =
      portal === "artisan" ||
      normalizedRole === "artisan" ||
      normalizedRole === "pro"
        ? "artisan"
        : "client";

    const verified = await verifyGoogleIdToken(idToken);
    if (!verified.ok) {
      return NextResponse.json(
        {
          error: verified.error,
          code: verified.code,
        },
        { status: verified.status }
      );
    }

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Skilled4U-Client/1.0";

    const result = await completeGoogleAuthentication({
      profile: verified.profile,
      portal: "mobile",
      requestedRole,
      ipAddress,
      userAgent,
      tokens: {
        accessToken,
        idToken,
      },
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error,
          code: result.code,
        },
        { status: result.status }
      );
    }

    const response = NextResponse.json({
      data: {
        user: result.user,
        token: result.rawToken,
        session: result.session,
        sessionPolicy: result.sessionPolicy,
        artisanProfile: result.artisanProfile,
        onboardingChecklist: result.onboardingChecklist,
      },
    });

    const isHttps = req.nextUrl.protocol === "https:";
    response.cookies.set("better-auth.session_token", result.signedCookieToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isHttps,
      path: "/",
      maxAge: result.sessionPolicy.maxAgeSeconds,
    });

    return response;
  } catch (error) {
    console.error("POST /api/v1/auth/google error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Google authentication failed",
      },
      { status: 500 }
    );
  }
}

