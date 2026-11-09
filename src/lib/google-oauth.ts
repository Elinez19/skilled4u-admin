import crypto from "node:crypto";
import { and, eq, or } from "drizzle-orm";
import { db } from "@/db";
import {
  account as accountTable,
  artisans,
  session as sessionTable,
  user as userTable,
} from "@/db/schema";
import {
  applyRoleSessionPolicy,
  buildOnboardingChecklist,
  normalizeUserRole,
  type SessionPolicyInfo,
} from "@/lib/auth-guard";
import { sendWelcomeOnboardingEmail } from "@/lib/resend";

export const GOOGLE_OAUTH_STATE_COOKIE = "s4u_google_oauth_state";
const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export type GoogleOAuthPortal =
  | "admin"
  | "mobile"
  | "customer"
  | "client"
  | "artisan";

export interface GoogleOAuthStatePayload {
  state: string;
  codeVerifier: string;
  portal: GoogleOAuthPortal;
  role: "client" | "artisan";
  callbackUrl: string;
  redirectUri: string;
  issuedAt: number;
  expiresAt: number;
}

export interface GoogleVerifiedProfile {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string | null;
}

function getSigningSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "BETTER_AUTH_SECRET must be configured with at least 16 characters"
    );
  }
  return secret;
}

export function generatePkcePair(): {
  codeVerifier: string;
  codeChallenge: string;
} {
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
  return { codeVerifier, codeChallenge };
}

export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Prevents Open Redirect vulnerabilities by restricting callback URLs to
 * internal relative paths or whitelisted mobile deep-link schemes.
 */
export function sanitizeOAuthCallbackUrl(
  rawCallbackUrl: string | null | undefined,
  portal: GoogleOAuthPortal
): string {
  if (!rawCallbackUrl) {
    return portal === "admin" ? "/admin" : "/";
  }
  const trimmed = rawCallbackUrl.trim();

  if (portal === "admin") {
    // Only allow internal /admin paths (reject //evil.com or external URLs)
    if (trimmed.startsWith("/admin") && !trimmed.startsWith("//")) {
      return trimmed;
    }
    return "/admin";
  }

  // Mobile portal: allow safe relative paths or whitelisted custom schemes
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }
  const allowedSchemes = [
    "skilled4u://",
    "skilled4u-artisan://",
    "skilled4u-customer://",
    "exp://",
  ];
  if (allowedSchemes.some((scheme) => trimmed.startsWith(scheme))) {
    return trimmed;
  }

  return "/";
}

/**
 * Checks whether a candidate redirect_uri is authorized in Google Cloud Console
 * for the configured GOOGLE_CLIENT_ID (prevents Error 400: redirect_uri_mismatch).
 */
async function isRedirectUriAuthorizedByGoogle(
  clientId: string,
  candidateUri: string
): Promise<boolean> {
  try {
    const checkUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    checkUrl.searchParams.set("client_id", clientId);
    checkUrl.searchParams.set("response_type", "code");
    checkUrl.searchParams.set("scope", "openid email profile");
    checkUrl.searchParams.set("redirect_uri", candidateUri);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(checkUrl.toString(), {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timer);

    const location = res.headers.get("location") || "";
    return res.status === 302 && !location.includes("oauth/error");
  } catch {
    return false;
  }
}

/**
 * Resolves the Google OAuth redirect_uri.
 * - On localhost, checks if `${origin}/v1/auth/google/callback` is registered in Google Cloud Console;
 *   if registered, uses `${origin}/v1/auth/google/callback` so local testing completes on localhost.
 * - Otherwise, uses `GOOGLE_CALLBACK_URL` from `.env` (`https://backend.skilled4u.com/v1/auth/google/callback`)
 *   so Google never throws `Error 400: redirect_uri_mismatch`.
 */
export async function resolveGoogleRedirectUri(
  reqUrl: URL,
  forceConfiguredCallback = false
): Promise<string> {
  const configured = process.env.GOOGLE_CALLBACK_URL?.trim();
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const localCallback = `${reqUrl.origin}/v1/auth/google/callback`;
  const isLocalHost =
    reqUrl.hostname === "localhost" || reqUrl.hostname === "127.0.0.1";

  if (configured) {
    if (forceConfiguredCallback || !isLocalHost) {
      return configured;
    }

    if (clientId) {
      const localAuthorized = await isRedirectUriAuthorizedByGoogle(
        clientId,
        localCallback
      );
      if (localAuthorized) {
        return localCallback;
      }
    }

    return configured;
  }

  return localCallback;
}

export function signOAuthStatePayload(payload: GoogleOAuthStatePayload): string {
  const secret = getSigningSecret();
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  const signature = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifyOAuthStatePayload(
  signedCookieValue: string | undefined | null,
  queryState: string | undefined | null
):
  | { ok: true; payload: GoogleOAuthStatePayload }
  | { ok: false; error: string } {
  if (!signedCookieValue || !queryState) {
    return {
      ok: false,
      error: "Missing OAuth CSRF state parameter or state cookie",
    };
  }

  const parts = signedCookieValue.split(".");
  if (parts.length !== 2) {
    return { ok: false, error: "Malformed OAuth state cookie" };
  }

  const [encodedPayload, providedSig] = parts;
  const secret = getSigningSecret();
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");

  const sigBufA = Buffer.from(providedSig, "utf8");
  const sigBufB = Buffer.from(expectedSig, "utf8");
  if (
    sigBufA.length !== sigBufB.length ||
    !crypto.timingSafeEqual(sigBufA, sigBufB)
  ) {
    return { ok: false, error: "Invalid OAuth state signature" };
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as GoogleOAuthStatePayload;

    if (!decoded.state || !decoded.codeVerifier || !decoded.expiresAt) {
      return { ok: false, error: "Incomplete OAuth state payload" };
    }

    if (Date.now() > decoded.expiresAt) {
      return {
        ok: false,
        error: "Google sign-in request expired (10m limit). Please try again.",
      };
    }

    const stateBufA = Buffer.from(decoded.state, "utf8");
    const stateBufB = Buffer.from(queryState, "utf8");
    if (
      stateBufA.length !== stateBufB.length ||
      !crypto.timingSafeEqual(stateBufA, stateBufB)
    ) {
      return { ok: false, error: "OAuth state mismatch" };
    }

    return { ok: true, payload: decoded };
  } catch {
    return { ok: false, error: "Failed to parse OAuth state payload" };
  }
}

export function createOAuthStatePayload(params: {
  portal: GoogleOAuthPortal;
  role: "client" | "artisan";
  callbackUrl: string;
  redirectUri: string;
}): {
  payload: GoogleOAuthStatePayload;
  codeChallenge: string;
  signedCookie: string;
} {
  const { codeVerifier, codeChallenge } = generatePkcePair();
  const state = generateOAuthState();
  const now = Date.now();
  const payload: GoogleOAuthStatePayload = {
    state,
    codeVerifier,
    portal: params.portal,
    role: params.role,
    callbackUrl: sanitizeOAuthCallbackUrl(params.callbackUrl, params.portal),
    redirectUri: params.redirectUri,
    issuedAt: now,
    expiresAt: now + STATE_TTL_MS,
  };
  return {
    payload,
    codeChallenge,
    signedCookie: signOAuthStatePayload(payload),
  };
}

/**
 * Signs a session token using Better Auth's HMAC-SHA256 cookie signing format (`${token}.${base64Hmac}`).
 */
export function signBetterAuthSessionToken(rawToken: string): string {
  const secret = getSigningSecret();
  const signature = crypto
    .createHmac("sha256", secret)
    .update(rawToken)
    .digest("base64");
  return `${rawToken}.${signature}`;
}

interface GoogleJwkKey extends crypto.JsonWebKey {
  kid?: string;
  alg?: string;
  use?: string;
}

let cachedGoogleJwks: { keys: GoogleJwkKey[]; expiresAt: number } | null = null;
const JWKS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Returns all configured Google OAuth 2.0 Client IDs across Web, iOS, and Android platforms.
 */
export function getAllowedGoogleClientIds(): string[] {
  const candidates = [
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_IOS_CLIENT_ID,
    process.env.GOOGLE_ANDROID_CLIENT_ID,
    ...(process.env.GOOGLE_CLIENT_IDS
      ? process.env.GOOGLE_CLIENT_IDS.split(",")
      : []),
  ];
  const unique = new Set<string>();
  for (const item of candidates) {
    const trimmed = item?.trim();
    if (trimmed) unique.add(trimmed);
  }
  return Array.from(unique);
}

async function getGoogleJwksKeys(): Promise<GoogleJwkKey[]> {
  if (cachedGoogleJwks && cachedGoogleJwks.expiresAt > Date.now()) {
    return cachedGoogleJwks.keys;
  }
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/certs", {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return cachedGoogleJwks?.keys || [];
    const data = (await res.json()) as { keys?: GoogleJwkKey[] };
    if (Array.isArray(data.keys) && data.keys.length > 0) {
      cachedGoogleJwks = {
        keys: data.keys,
        expiresAt: Date.now() + JWKS_CACHE_TTL_MS,
      };
      return data.keys;
    }
  } catch {
    // Fallback to cached keys or tokeninfo
  }
  return cachedGoogleJwks?.keys || [];
}

interface GoogleIdTokenClaims {
  iss?: string;
  aud?: string | string[];
  sub?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  exp?: string | number;
}

function validateGoogleTokenClaims(
  claims: GoogleIdTokenClaims,
  allowedClientIds: string[]
):
  | { ok: true; profile: GoogleVerifiedProfile }
  | { ok: false; status: number; code: string; error: string } {
  if (
    claims.iss !== "https://accounts.google.com" &&
    claims.iss !== "accounts.google.com"
  ) {
    return {
      ok: false,
      status: 401,
      code: "INVALID_GOOGLE_ISSUER",
      error: "Google token issuer verification failed.",
    };
  }

  const audList = Array.isArray(claims.aud)
    ? claims.aud
    : claims.aud
      ? [claims.aud]
      : [];
  const audienceMatches = audList.some((aud) => allowedClientIds.includes(aud));

  if (!audienceMatches) {
    return {
      ok: false,
      status: 401,
      code: "INVALID_GOOGLE_AUDIENCE",
      error:
        "Google token audience does not match any configured Skilled4U client ID (Web, iOS, or Android).",
    };
  }

  if (claims.exp && Number(claims.exp) * 1000 < Date.now()) {
    return {
      ok: false,
      status: 401,
      code: "EXPIRED_GOOGLE_TOKEN",
      error: "Google ID token has expired.",
    };
  }

  const emailVerified =
    claims.email_verified === true || claims.email_verified === "true";

  if (!claims.sub || !claims.email || !emailVerified) {
    return {
      ok: false,
      status: 403,
      code: "GOOGLE_EMAIL_UNVERIFIED",
      error:
        "Google account email must be verified before signing in to Skilled4U.",
    };
  }

  const displayName =
    claims.name?.trim() ||
    [claims.given_name, claims.family_name].filter(Boolean).join(" ").trim() ||
    claims.email.split("@")[0];

  return {
    ok: true,
    profile: {
      sub: claims.sub,
      email: claims.email.toLowerCase().trim(),
      emailVerified: true,
      name: displayName,
      picture: claims.picture || null,
    },
  };
}

/**
 * Verifies a Google ID Token (`id_token`):
 * 1. Fast local RS256 cryptographic signature verification against Google's cached JWKS public keys.
 * 2. Fallback to Google's tokeninfo endpoint if key rotation is in flight.
 * 3. Enforces multi-client audience (`GOOGLE_CLIENT_ID`, `GOOGLE_IOS_CLIENT_ID`, `GOOGLE_ANDROID_CLIENT_ID`),
 *    issuer, expiration, and `email_verified === true`.
 */
export async function verifyGoogleIdToken(
  idToken: string
): Promise<
  | { ok: true; profile: GoogleVerifiedProfile }
  | { ok: false; status: number; code: string; error: string }
> {
  const allowedClientIds = getAllowedGoogleClientIds();
  if (allowedClientIds.length === 0) {
    return {
      ok: false,
      status: 500,
      code: "OAUTH_NOT_CONFIGURED",
      error: "Google OAuth is not configured on the server.",
    };
  }

  // 1. Attempt fast local RS256 JWKS verification first
  try {
    const jwtParts = idToken.split(".");
    if (jwtParts.length === 3) {
      const [headerB64, payloadB64, signatureB64] = jwtParts;
      const header = JSON.parse(
        Buffer.from(headerB64, "base64url").toString("utf8")
      ) as { alg?: string; kid?: string };

      if (header.alg === "RS256" && header.kid) {
        const jwks = await getGoogleJwksKeys();
        const matchingJwk = jwks.find((k) => k.kid === header.kid);
        if (matchingJwk) {
          const publicKey = crypto.createPublicKey({
            key: matchingJwk,
            format: "jwk",
          });
          const signatureValid = crypto.verify(
            "RSA-SHA256",
            Buffer.from(`${headerB64}.${payloadB64}`, "utf8"),
            publicKey,
            Buffer.from(signatureB64, "base64url")
          );

          if (!signatureValid) {
            return {
              ok: false,
              status: 401,
              code: "INVALID_GOOGLE_TOKEN",
              error: "Google ID token cryptographic signature verification failed.",
            };
          }

          const claims = JSON.parse(
            Buffer.from(payloadB64, "base64url").toString("utf8")
          ) as GoogleIdTokenClaims;

          return validateGoogleTokenClaims(claims, allowedClientIds);
        }
      }
    }
  } catch {
    // Fall through to tokeninfo verification
  }

  // 2. Fallback to Google's tokeninfo endpoint
  try {
    const tokenInfoUrl = new URL("https://oauth2.googleapis.com/tokeninfo");
    tokenInfoUrl.searchParams.set("id_token", idToken);

    const res = await fetch(tokenInfoUrl.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        ok: false,
        status: 401,
        code: "INVALID_GOOGLE_TOKEN",
        error: "Invalid or expired Google ID token.",
      };
    }

    const claims = (await res.json()) as GoogleIdTokenClaims;
    return validateGoogleTokenClaims(claims, allowedClientIds);
  } catch (err) {
    return {
      ok: false,
      status: 502,
      code: "GOOGLE_VERIFICATION_ERROR",
      error:
        err instanceof Error
          ? err.message
          : "Failed to verify Google ID token with Google servers.",
    };
  }
}

/**
 * Completes Google OAuth authentication with strict security enforcement:
 * 1. Prevents privilege escalation on the Admin Portal (`portal === "admin"` requires an existing Admin user).
 * 2. Blocks banned or suspended accounts immediately.
 * 3. Links the Google `account` record safely (only for verified Google emails).
 * 4. Creates a session and stamps the role-specific timeout policy (Admin: 8h/30m, Artisan: 7d/24h, Client: 30d/7d).
 */
export async function completeGoogleAuthentication(params: {
  profile: GoogleVerifiedProfile;
  portal: GoogleOAuthPortal;
  requestedRole?: "client" | "artisan";
  ipAddress: string;
  userAgent: string;
  tokens?: {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    accessTokenExpiresAt?: Date;
    scope?: string;
  };
}): Promise<
  | {
      ok: true;
      user: typeof userTable.$inferSelect;
      rawToken: string;
      signedCookieToken: string;
      session: {
        id: string;
        token: string;
        userId: string;
        expiresAt: string;
        updatedAt: Date;
      };
      sessionPolicy: SessionPolicyInfo;
      artisanProfile: typeof artisans.$inferSelect | null;
      onboardingChecklist: ReturnType<typeof buildOnboardingChecklist>;
    }
  | {
      ok: false;
      status: number;
      code: string;
      error: string;
    }
> {
  const { profile, portal, requestedRole = "client", ipAddress, userAgent, tokens } =
    params;
  const email = profile.email.toLowerCase().trim();

  if (!profile.emailVerified) {
    return {
      ok: false,
      status: 403,
      code: "GOOGLE_EMAIL_UNVERIFIED",
      error: "Google email address is not verified.",
    };
  }

  // 1. Check if a Google account link or user with this verified email already exists
  const [linkedAccount] = await db
    .select()
    .from(accountTable)
    .where(
      and(
        eq(accountTable.providerId, "google"),
        eq(accountTable.accountId, profile.sub)
      )
    )
    .limit(1);

  let [existingUser] = await db
    .select()
    .from(userTable)
    .where(
      linkedAccount
        ? or(eq(userTable.id, linkedAccount.userId), eq(userTable.email, email))
        : eq(userTable.email, email)
    )
    .limit(1);

  // 2. Strict Admin OAuth Block: Administrators must use Email & Password only (never Google OAuth)
  if (
    portal === "admin" ||
    (existingUser && normalizeUserRole(existingUser.role) === "admin")
  ) {
    return {
      ok: false,
      status: 403,
      code: "FORBIDDEN_ADMIN_OAUTH",
      error:
        "Google OAuth is disabled for Administrator accounts. Administrators must sign in with email and password on the Admin Portal.",
    };
  }

  // 3. Enforce account standing (banned or suspended users are blocked)
  if (
    existingUser &&
    (existingUser.banned || existingUser.accountStatus === "suspended")
  ) {
    await db
      .delete(sessionTable)
      .where(eq(sessionTable.userId, existingUser.id));
    return {
      ok: false,
      status: 403,
      code: "ACCOUNT_SUSPENDED",
      error:
        "This account has been suspended. Please contact Skilled4U Trust & Safety.",
    };
  }

  // 3b. Enforce strict 1-Email-1-Role separation on Mobile Google OAuth:
  // A Customer account cannot sign in on the Artisan app (and vice versa).
  const targetRole: "client" | "artisan" =
    requestedRole === "artisan" ? "artisan" : "client";

  if (existingUser) {
    const existingRole = normalizeUserRole(existingUser.role);
    if (existingRole !== targetRole) {
      const existingLabel =
        existingRole === "artisan" ? "an Artisan" : "a Customer";
      const requestedLabel =
        targetRole === "artisan" ? "Artisan" : "Customer";

      return {
        ok: false,
        status: 403,
        code: "ROLE_MISMATCH",
        error: `Role mismatch: This Google email is already registered as ${existingLabel} account and cannot sign in to the ${requestedLabel} app. Each email address is strictly bound to one role.`,
      };
    }
  }

  const now = new Date();

  // 4. Create or update the user record
  if (existingUser) {
    const [updatedUser] = await db
      .update(userTable)
      .set({
        emailVerified: true,
        image: existingUser.image || profile.picture || null,
        onboardingStatus:
          existingUser.onboardingStatus === "not_started"
            ? "in_progress"
            : existingUser.onboardingStatus,
        onboardingStep: Math.max(existingUser.onboardingStep || 1, 2),
        updatedAt: now,
      })
      .where(eq(userTable.id, existingUser.id))
      .returning();

    existingUser = updatedUser || existingUser;
  } else {
    // Mobile portal new user registration (never "admin")
    const safeMobileRole: "client" | "artisan" =
      requestedRole === "artisan" ? "artisan" : "client";

    const newUserId = `usr_google_${Date.now()}_${crypto
      .randomBytes(4)
      .toString("hex")}`;

    const [createdUser] = await db
      .insert(userTable)
      .values({
        id: newUserId,
        name: profile.name,
        email,
        emailVerified: true,
        image: profile.picture || null,
        role: safeMobileRole,
        city: "Abuja (Wuse II)",
        onboardingStatus: "in_progress",
        onboardingStep: 2,
        accountStatus: "active",
        banned: false,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    existingUser = createdUser;

    if (safeMobileRole === "artisan") {
      const resolvedCity = existingUser.city || "Abuja (Wuse II)";
      await db.insert(artisans).values({
        id: `art_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
        userId: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        phone: existingUser.phone || "+234 800 000 0000",
        trade: "General Skilled Specialist",
        serviceKey: "general",
        profileImage: existingUser.image || "/images/landing/hero-artisan.png",
        hourlyRate: "₦15,000",
        hourlyRateNumeric: 15000,
        about: `Verified specialist serving ${resolvedCity}.`,
        skills: ["Diagnostics & Repair"],
        portfolioImages: ["/images/landing/hero-artisan.png"],
        rating: 5.0,
        reviewsCount: 0,
        completedJobs: 0,
        distance: "1.5 km",
        city: resolvedCity,
        address: resolvedCity,
        isOnline: true,
        kycStatus: "pending",
      });
    }

    await sendWelcomeOnboardingEmail({
      to: existingUser.email,
      name: existingUser.name,
      role: safeMobileRole,
      city: existingUser.city || "Abuja (Wuse II)",
      ...(safeMobileRole === "artisan"
        ? { trade: "General Skilled Specialist" }
        : {}),
    });
  }

  // 5. Upsert the Google OAuth account record in `account` table
  if (linkedAccount) {
    await db
      .update(accountTable)
      .set({
        userId: existingUser.id,
        accessToken: tokens?.accessToken || linkedAccount.accessToken,
        refreshToken: tokens?.refreshToken || linkedAccount.refreshToken,
        idToken: tokens?.idToken || linkedAccount.idToken,
        accessTokenExpiresAt:
          tokens?.accessTokenExpiresAt || linkedAccount.accessTokenExpiresAt,
        scope: tokens?.scope || linkedAccount.scope,
        updatedAt: now,
      })
      .where(eq(accountTable.id, linkedAccount.id));
  } else {
    await db.insert(accountTable).values({
      id: `acc_google_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
      accountId: profile.sub,
      providerId: "google",
      userId: existingUser.id,
      accessToken: tokens?.accessToken || null,
      refreshToken: tokens?.refreshToken || null,
      idToken: tokens?.idToken || null,
      accessTokenExpiresAt: tokens?.accessTokenExpiresAt || null,
      scope: tokens?.scope || "openid email profile",
      createdAt: now,
      updatedAt: now,
    });
  }

  // 6. Create session & apply role-based session timeout policy
  const role = normalizeUserRole(existingUser.role);
  const rawToken = crypto.randomBytes(24).toString("base64url");
  const sessionId = `ses_google_${Date.now()}_${crypto
    .randomBytes(4)
    .toString("hex")}`;

  await db.insert(sessionTable).values({
    id: sessionId,
    token: rawToken,
    userId: existingUser.id,
    expiresAt: new Date(now.getTime() + 8 * 60 * 60 * 1000),
    createdAt: now,
    updatedAt: now,
    ipAddress,
    userAgent,
  });

  const sessionPolicy = await applyRoleSessionPolicy(rawToken, role);
  const signedCookieToken = signBetterAuthSessionToken(rawToken);

  let artisanProfile: typeof artisans.$inferSelect | null = null;
  if (role === "artisan") {
    const [foundArtisan] = await db
      .select()
      .from(artisans)
      .where(
        or(
          eq(artisans.userId, existingUser.id),
          eq(artisans.email, existingUser.email)
        )
      )
      .limit(1);
    artisanProfile = foundArtisan
      ? { ...foundArtisan, ninEncrypted: null, ninHash: null }
      : null;
  }

  const onboardingChecklist = buildOnboardingChecklist(
    existingUser,
    artisanProfile
  );

  return {
    ok: true,
    user: existingUser,
    rawToken,
    signedCookieToken,
    session: {
      id: sessionId,
      token: rawToken,
      userId: existingUser.id,
      expiresAt: sessionPolicy.expiresAt,
      updatedAt: now,
    },
    sessionPolicy,
    artisanProfile,
    onboardingChecklist,
  };
}

