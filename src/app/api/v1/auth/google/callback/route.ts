import { NextRequest, NextResponse } from "next/server";
import { protectAuthLogin } from "@/lib/arcjet";
import {
  completeGoogleAuthentication,
  GOOGLE_OAUTH_STATE_COOKIE,
  verifyGoogleIdToken,
  verifyOAuthStatePayload,
} from "@/lib/google-oauth";

function redirectToLoginWithError(
  req: NextRequest,
  errorCode: string,
  reason?: string
) {
  const loginUrl = new URL("/login", req.url);
  if (reason) {
    loginUrl.searchParams.set("reason", reason);
  }
  loginUrl.searchParams.set("error", errorCode);
  const response = NextResponse.redirect(loginUrl, { status: 302 });
  response.cookies.delete(GOOGLE_OAUTH_STATE_COOKIE);
  return response;
}

/**
 * GET /api/v1/auth/google/callback (also reachable at /v1/auth/google/callback)
 * Handles Google OAuth 2.0 Authorization Code callback:
 * - Verifies HMAC-signed CSRF state cookie in constant time
 * - Exchanges authorization code with PKCE `code_verifier`
 * - Validates Google `id_token` (`aud`, `iss`, `email_verified === true`)
 * - Enforces Admin Portal RBAC (prevents unauthorized Google accounts from accessing /admin)
 * - Stamps role-based session timeout (Admin: 8h max / 30m idle; Artisan: 7d max / 24h idle; Customer: 30d max / 7d idle)
 */
export async function GET(req: NextRequest) {
  try {
    const blocked = await protectAuthLogin(req);
    if (blocked) return blocked;

    const { searchParams } = req.nextUrl;
    const oauthError = searchParams.get("error");
    if (oauthError) {
      return redirectToLoginWithError(req, "google_cancelled");
    }

    const code = searchParams.get("code");
    const queryState = searchParams.get("state");
    const stateCookie = req.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;

    const stateCheck = verifyOAuthStatePayload(stateCookie, queryState);
    if (!stateCheck.ok || !code) {
      return redirectToLoginWithError(req, "google_state_invalid");
    }

    const statePayload = stateCheck.payload;
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

    if (!clientId || !clientSecret) {
      return redirectToLoginWithError(req, "google_not_configured");
    }

    // Exchange authorization code + PKCE code_verifier for Google tokens
    const tokenParams = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: statePayload.redirectUri,
      grant_type: "authorization_code",
      code_verifier: statePayload.codeVerifier,
    });

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: tokenParams.toString(),
      cache: "no-store",
    });

    if (!tokenRes.ok) {
      return redirectToLoginWithError(req, "google_token_exchange_failed");
    }

    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      id_token?: string;
      refresh_token?: string;
      expires_in?: number;
      scope?: string;
    };

    if (!tokenData.id_token) {
      return redirectToLoginWithError(req, "google_missing_id_token");
    }

    // Cryptographically verify id_token claims and email_verified === true
    const verified = await verifyGoogleIdToken(tokenData.id_token);
    if (!verified.ok) {
      return redirectToLoginWithError(req, "google_unverified_email");
    }

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Skilled4U-Web/1.0";

    const accessTokenExpiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : undefined;

    const authResult = await completeGoogleAuthentication({
      profile: verified.profile,
      portal: statePayload.portal,
      requestedRole: statePayload.role,
      ipAddress,
      userAgent,
      tokens: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        idToken: tokenData.id_token,
        accessTokenExpiresAt,
        scope: tokenData.scope,
      },
    });

    if (!authResult.ok) {
      if (authResult.code === "FORBIDDEN_ADMIN_PORTAL") {
        return redirectToLoginWithError(
          req,
          "google_not_admin",
          "unauthorized"
        );
      }
      if (authResult.code === "ACCOUNT_SUSPENDED") {
        return redirectToLoginWithError(
          req,
          "account_suspended",
          "unauthorized"
        );
      }
      return redirectToLoginWithError(req, "google_oauth_failed");
    }

    // Determine redirect target (support mobile custom deep links or internal web routes)
    const targetCallback = statePayload.callbackUrl || "/admin";
    const isMobileDeepLink =
      targetCallback.startsWith("skilled4u://") ||
      targetCallback.startsWith("skilled4u-artisan://") ||
      targetCallback.startsWith("skilled4u-customer://") ||
      targetCallback.startsWith("exp://");

    let redirectDestination: string;
    if (isMobileDeepLink) {
      const deepLinkUrl = new URL(targetCallback);
      deepLinkUrl.searchParams.set("token", authResult.rawToken);
      deepLinkUrl.searchParams.set("role", authResult.sessionPolicy.role);
      redirectDestination = deepLinkUrl.toString();
    } else {
      redirectDestination = new URL(targetCallback, req.url).toString();
    }

    const response = NextResponse.redirect(redirectDestination, {
      status: 302,
    });

    const isHttps = req.nextUrl.protocol === "https:";
    response.cookies.delete(GOOGLE_OAUTH_STATE_COOKIE);
    response.cookies.set(
      "better-auth.session_token",
      authResult.signedCookieToken,
      {
        httpOnly: true,
        sameSite: "lax",
        secure: isHttps,
        path: "/",
        maxAge: authResult.sessionPolicy.maxAgeSeconds,
      }
    );

    return response;
  } catch (error) {
    console.error("GET /api/v1/auth/google/callback error:", error);
    return redirectToLoginWithError(req, "google_oauth_failed");
  }
}

