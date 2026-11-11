import crypto from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { and, eq, ne, or } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  session as sessionTable,
  user as userTable,
  type ArtisanRow,
  type UserRow,
} from "@/db/schema";

export type NormalizedRole = "admin" | "client" | "artisan";
export type AdminScope = "super_admin" | "kyc_moderator" | "dispatch_support";

export interface SessionPolicyInfo {
  role: NormalizedRole;
  maxAgeSeconds: number;
  idleTimeoutSeconds: number;
  expiresAt: string;
  idleExpiresAt: string;
  singleDeviceEnforced?: boolean;
}

/**
 * Role-based session & idle inactivity timeout policy:
 * - Admin:   8 hours max session lifetime, 30 minutes sliding idle timeout
 * - Artisan: 7 days max session lifetime, 24 hours sliding idle timeout (single active device enforced)
 * - Client:  30 days max session lifetime, 7 days sliding idle timeout (multi-device allowed)
 */
export const ROLE_SESSION_POLICY: Record<
  NormalizedRole,
  { maxAgeSeconds: number; idleTimeoutSeconds: number }
> = {
  admin: {
    maxAgeSeconds: 8 * 60 * 60, // 8 hours (28,800s)
    idleTimeoutSeconds: 30 * 60, // 30 minutes (1,800s)
  },
  artisan: {
    maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days (604,800s)
    idleTimeoutSeconds: 24 * 60 * 60, // 24 hours (86,400s)
  },
  client: {
    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days (2,592,000s)
    idleTimeoutSeconds: 7 * 24 * 60 * 60, // 7 days (604,800s)
  },
};

export interface ResolvedAuthContext {
  user: UserRow;
  session: {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
    updatedAt: Date;
  };
  sessionPolicy: SessionPolicyInfo;
  adminScope: AdminScope | null;
}

export interface DetailedAuthResolution {
  context: ResolvedAuthContext | null;
  failureCode?: "UNAUTHORIZED" | "SESSION_TIMEOUT" | "ACCOUNT_SUSPENDED";
  failureMessage?: string;
}

export function normalizeUserRole(
  roleInput?: string | null
): NormalizedRole {
  const lower = (roleInput || "client").toLowerCase().trim();
  if (lower === "admin" || lower === "administrator") return "admin";
  if (lower === "artisan" || lower === "pro" || lower === "vendor") {
    return "artisan";
  }
  return "client";
}

/**
 * Resolves the granular RBAC scope for an Administrator user:
 * - `super_admin`: Full platform access including creating/managing Admins, KYC decryption, & settings.
 * - `kyc_moderator`: Authorized to view decrypted NINs, review KYC selfies/IDs, approve/reject Artisans, & handle disputes.
 * - `dispatch_support`: Authorized to manage bookings, live dispatch, and customer helpdesk (cannot manage Admins or approve KYC).
 */
export function resolveAdminScope(
  user: Pick<UserRow, "role" | "email"> & {
    adminRoleTitle?: string | null;
    adminPermissions?: string | null;
    adminScope?: string | null;
  }
): AdminScope {
  // 1. Direct explicit adminScope column
  if (
    user.adminScope === "super_admin" ||
    user.adminScope === "kyc_moderator" ||
    user.adminScope === "dispatch_support"
  ) {
    return user.adminScope;
  }

  // Least-privilege fallback instead of guessing from job title strings
  return "dispatch_support";
}

export function canAdminManageAdmins(
  user: Pick<UserRow, "role" | "email"> & {
    adminRoleTitle?: string | null;
    adminPermissions?: string | null;
    adminScope?: string | null;
  }
): boolean {
  return (
    normalizeUserRole(user.role) === "admin" &&
    resolveAdminScope(user) === "super_admin"
  );
}

export function canAdminReviewKyc(
  user: Pick<UserRow, "role" | "email"> & {
    adminRoleTitle?: string | null;
    adminPermissions?: string | null;
    adminScope?: string | null;
  }
): boolean {
  if (normalizeUserRole(user.role) !== "admin") return false;
  const scope = resolveAdminScope(user);
  return scope === "super_admin" || scope === "kyc_moderator";
}

/**
 * Validates whether an actor admin can perform an administrative action against a target user.
 * Enforces:
 * - Cannot suspend, delete, or change role/scope of oneself.
 * - Only super_admin can modify or delete other administrator accounts.
 */
export function assertCanManageTarget(
  actor: UserRow,
  targetUser: UserRow,
  actionDescription?: string
): { ok: true } | { ok: false; error: string; status: number } {
  if (actor.id === targetUser.id) {
    return {
      ok: false,
      status: 400,
      error: "You cannot modify status, suspend, or delete your own administrator account.",
    };
  }

  const targetRole = normalizeUserRole(targetUser.role);
  const actorScope = resolveAdminScope(actor);

  if (targetRole === "admin") {
    if (actorScope !== "super_admin") {
      return {
        ok: false,
        status: 403,
        error: `Forbidden: Only Super Administrators can ${actionDescription || "manage or modify"} Administrator accounts.`,
      };
    }
  }

  return { ok: true };
}

/**
 * Verifies strict 1-Email-1-Role separation across the Web Admin Portal, Customer Mobile App, and Artisan Mobile App.
 */
export function verifyPortalRoleMatch(params: {
  userRole: NormalizedRole;
  portal?: string | null;
  expectedRole?: string | null;
}): { ok: true } | { ok: false; status: number; code: string; error: string } {
  const { userRole, portal, expectedRole } = params;
  const normPortal = (portal || "").toLowerCase().trim();
  const normExpected = expectedRole
    ? normalizeUserRole(expectedRole)
    : null;

  if (normPortal === "admin") {
    if (userRole !== "admin") {
      return {
        ok: false,
        status: 403,
        code: "FORBIDDEN_PORTAL",
        error:
          "Access restricted: Only Administrator accounts can sign in to the Web Admin Portal. Artisans and Customers must use the Skilled4U mobile apps.",
      };
    }
    return { ok: true };
  }

  // Any mobile portal ("mobile", "customer", "client", "artisan") blocks Admin accounts
  if (
    (normPortal === "mobile" ||
      normPortal === "customer" ||
      normPortal === "client" ||
      normPortal === "artisan") &&
    userRole === "admin"
  ) {
    return {
      ok: false,
      status: 403,
      code: "FORBIDDEN_PORTAL",
      error:
        "Administrator accounts cannot sign in to the mobile apps. Please use the Skilled4U Web Admin Portal.",
    };
  }

  const targetMobileRole: NormalizedRole | null =
    normPortal === "artisan"
      ? "artisan"
      : normPortal === "customer" || normPortal === "client"
        ? "client"
        : normExpected && normExpected !== "admin"
          ? normExpected
          : null;

  if (targetMobileRole && userRole !== targetMobileRole) {
    const existingLabel =
      userRole === "artisan" ? "an Artisan" : userRole === "client" ? "a Customer" : "an Administrator";
    const requestedLabel =
      targetMobileRole === "artisan" ? "Artisan" : "Customer";

    return {
      ok: false,
      status: 403,
      code: "ROLE_MISMATCH",
      error: `Role mismatch: This email is registered as ${existingLabel} account and cannot be used on the ${requestedLabel} app. Each email address is strictly bound to one role.`,
    };
  }

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Two-Step Admin Login MFA Challenge Token (HMAC-SHA256, 5-minute TTL)
// & 30-Day Admin Trusted Device Token
// ---------------------------------------------------------------------------
const ADMIN_MFA_TTL_MS = 5 * 60 * 1000;
export const ADMIN_TRUSTED_DEVICE_COOKIE = "skilled4u_admin_trusted_device";
export const ADMIN_TRUSTED_DEVICE_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
const ADMIN_TRUSTED_DEVICE_TTL_MS = ADMIN_TRUSTED_DEVICE_TTL_SECONDS * 1000;

export interface AdminMfaChallengePayload {
  userId: string;
  email: string;
  purpose: "admin_mfa";
  issuedAt: number;
  expiresAt: number;
  jti: string;
}

export interface AdminTrustedDevicePayload {
  userId: string;
  email: string;
  purpose: "admin_trusted_device";
  issuedAt: number;
  expiresAt: number;
}

// In-memory single-use replay protection for MFA challenge tokens
const consumedChallengeTokens = new Map<string, number>();

function pruneConsumedChallenges() {
  const now = Date.now();
  for (const [jti, expiresAt] of consumedChallengeTokens.entries()) {
    if (now > expiresAt) {
      consumedChallengeTokens.delete(jti);
    }
  }
}

export function consumeAdminMfaChallenge(jti: string, expiresAt: number): boolean {
  pruneConsumedChallenges();
  if (consumedChallengeTokens.has(jti)) {
    return false; // Already consumed
  }
  consumedChallengeTokens.set(jti, expiresAt);
  return true;
}

function getMfaSigningSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET?.trim();
  if (!secret || secret.length < 16) {
    throw new Error("BETTER_AUTH_SECRET must be at least 16 characters");
  }
  return secret;
}

export function createAdminMfaChallengeToken(params: {
  userId: string;
  email: string;
}): string {
  const now = Date.now();
  const payload: AdminMfaChallengePayload = {
    userId: params.userId,
    email: params.email.toLowerCase().trim(),
    purpose: "admin_mfa",
    issuedAt: now,
    expiresAt: now + ADMIN_MFA_TTL_MS,
    jti: crypto.randomUUID(),
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  const sig = crypto
    .createHmac("sha256", getMfaSigningSecret())
    .update(`admin-mfa:${encoded}`)
    .digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyAdminMfaChallengeToken(
  token: string | null | undefined,
  expectedEmail?: string
):
  | { ok: true; payload: AdminMfaChallengePayload }
  | { ok: false; error: string } {
  if (!token || !token.includes(".")) {
    return {
      ok: false,
      error: "Missing or malformed Admin MFA challenge token",
    };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { ok: false, error: "Invalid Admin MFA challenge token format" };
  }

  const [encoded, providedSig] = parts;
  const expectedSig = crypto
    .createHmac("sha256", getMfaSigningSecret())
    .update(`admin-mfa:${encoded}`)
    .digest("base64url");

  const bufA = Buffer.from(providedSig, "utf8");
  const bufB = Buffer.from(expectedSig, "utf8");
  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
    return { ok: false, error: "Invalid Admin MFA challenge token signature" };
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as AdminMfaChallengePayload;

    if (decoded.purpose !== "admin_mfa" || !decoded.userId || !decoded.email || !decoded.jti) {
      return { ok: false, error: "Invalid Admin MFA challenge payload" };
    }

    if (Date.now() > decoded.expiresAt) {
      return {
        ok: false,
        error:
          "Admin MFA verification challenge expired (5-minute limit). Please sign in again.",
      };
    }

    if (
      expectedEmail &&
      decoded.email.toLowerCase() !== expectedEmail.toLowerCase().trim()
    ) {
      return {
        ok: false,
        error: "Admin MFA challenge token does not match the provided email",
      };
    }

    if (consumedChallengeTokens.has(decoded.jti)) {
      return {
        ok: false,
        error: "Admin MFA challenge token has already been used. Please sign in again.",
      };
    }

    return { ok: true, payload: decoded };
  } catch {
    return { ok: false, error: "Failed to decode Admin MFA challenge token" };
  }
}

export function createAdminTrustedDeviceToken(params: {
  userId: string;
  email: string;
}): string {
  const now = Date.now();
  const payload: AdminTrustedDevicePayload = {
    userId: params.userId,
    email: params.email.toLowerCase().trim(),
    purpose: "admin_trusted_device",
    issuedAt: now,
    expiresAt: now + ADMIN_TRUSTED_DEVICE_TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  const sig = crypto
    .createHmac("sha256", getMfaSigningSecret())
    .update(`admin-trusted-device:${encoded}`)
    .digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyAdminTrustedDeviceToken(
  token: string | null | undefined,
  expectedUserId: string,
  expectedEmail: string,
  userUpdatedAt?: Date | string | null
): boolean {
  if (!token || !token.includes(".")) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [encoded, providedSig] = parts;
  const expectedSig = crypto
    .createHmac("sha256", getMfaSigningSecret())
    .update(`admin-trusted-device:${encoded}`)
    .digest("base64url");

  const bufA = Buffer.from(providedSig, "utf8");
  const bufB = Buffer.from(expectedSig, "utf8");
  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
    return false;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as AdminTrustedDevicePayload;

    if (
      decoded.purpose !== "admin_trusted_device" ||
      decoded.userId !== expectedUserId ||
      decoded.email.toLowerCase() !== expectedEmail.toLowerCase().trim()
    ) {
      return false;
    }

    if (Date.now() > decoded.expiresAt) {
      return false;
    }

    // Invalidate if token was issued prior to user's last security update (e.g. password change or session revocation)
    if (userUpdatedAt) {
      const updatedMs = new Date(userUpdatedAt).getTime();
      // Allow 5s clock skew
      if (decoded.issuedAt < updatedMs - 5000) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

export function hasValidAdminTrustedDeviceCookie(
  req: Request,
  userId: string,
  email: string,
  userUpdatedAt?: Date | string | null
): boolean {
  const cookieHeader = req.headers.get("cookie") || "";
  const regex = new RegExp(
    `(?:^|;\\s*)${ADMIN_TRUSTED_DEVICE_COOKIE}=([^;]+)`
  );
  const match = cookieHeader.match(regex);
  if (!match?.[1]) return false;
  const rawToken = decodeURIComponent(match[1].trim());
  return verifyAdminTrustedDeviceToken(rawToken, userId, email, userUpdatedAt);
}

export function computeSessionPolicy(
  roleInput: string | null | undefined,
  expiresAtDate: Date,
  updatedAtDate: Date
): SessionPolicyInfo {
  const role = normalizeUserRole(roleInput);
  const policy = ROLE_SESSION_POLICY[role];
  const idleExpiresMs = Math.min(
    expiresAtDate.getTime(),
    updatedAtDate.getTime() + policy.idleTimeoutSeconds * 1000
  );
  return {
    role,
    maxAgeSeconds: policy.maxAgeSeconds,
    idleTimeoutSeconds: policy.idleTimeoutSeconds,
    expiresAt: expiresAtDate.toISOString(),
    idleExpiresAt: new Date(idleExpiresMs).toISOString(),
    singleDeviceEnforced: role === "artisan",
  };
}

/**
 * Stamps the role-specific absolute expiration (`expiresAt`) and fresh activity timestamp (`updatedAt`)
 * onto a newly created session in NeonDB.
 * Also enforces single-active-device concurrency for Artisans (`role === "artisan"`), revoking older device sessions.
 */
export async function applyRoleSessionPolicy(
  sessionIdOrToken: string,
  roleInput: string | null | undefined,
  options?: { revokeOtherArtisanSessions?: boolean }
): Promise<SessionPolicyInfo> {
  const role = normalizeUserRole(roleInput);
  const policy = ROLE_SESSION_POLICY[role];
  const now = new Date();
  const expiresAt = new Date(now.getTime() + policy.maxAgeSeconds * 1000);
  const baseToken = sessionIdOrToken.includes(".")
    ? sessionIdOrToken.split(".")[0]
    : sessionIdOrToken;

  const updatedSessions = await db
    .update(sessionTable)
    .set({
      expiresAt,
      updatedAt: now,
    })
    .where(
      or(
        eq(sessionTable.id, sessionIdOrToken),
        eq(sessionTable.token, baseToken)
      )
    )
    .returning({
      id: sessionTable.id,
      userId: sessionTable.userId,
    });

  // Enforce single active mobile device for Artisans: revoke all other sessions for this Artisan
  const shouldRevokeOthers = options?.revokeOtherArtisanSessions ?? true;
  if (
    role === "artisan" &&
    shouldRevokeOthers &&
    updatedSessions.length > 0
  ) {
    const activeSession = updatedSessions[0];
    await db
      .delete(sessionTable)
      .where(
        and(
          eq(sessionTable.userId, activeSession.userId),
          ne(sessionTable.id, activeSession.id)
        )
      );
  }

  return computeSessionPolicy(role, expiresAt, now);
}

function extractRawTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    const raw = authHeader.slice(7).trim();
    if (raw) {
      return raw.includes(".") ? raw.split(".")[0] : raw;
    }
  }

  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(
    /(?:__Secure-)?better-auth\.session_token=([^;]+)/
  );
  if (match?.[1]) {
    const decoded = decodeURIComponent(match[1].trim());
    if (decoded.includes(".")) {
      const parts = decoded.split(".");
      const rawToken = parts[0];
      const providedSig = parts.slice(1).join(".");
      try {
        const secret = getMfaSigningSecret();
        const expectedSig = crypto
          .createHmac("sha256", secret)
          .update(rawToken)
          .digest("base64");
        const bufA = Buffer.from(providedSig, "utf8");
        const bufB = Buffer.from(expectedSig, "utf8");
        if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
          return rawToken;
        }
      } catch {
        // Fallback for native Better Auth internal signing
      }
      return rawToken;
    }
    return decoded;
  }

  return null;
}

/**
 * Resolves the authenticated session with detailed failure codes (including role-based idle timeout
 * and absolute max-age timeout enforcement for Admin, Artisan, and Customer accounts).
 */
export async function resolveAuthSessionDetailed(
  req: Request
): Promise<DetailedAuthResolution> {
  let foundSession: typeof sessionTable.$inferSelect | null = null;

  // 1. Check raw token from Authorization Bearer header or session cookie directly in NeonDB
  const candidateToken = extractRawTokenFromRequest(req);
  if (candidateToken) {
    const [row] = await db
      .select()
      .from(sessionTable)
      .where(eq(sessionTable.token, candidateToken))
      .limit(1);
    if (row) {
      foundSession = row;
    }
  }

  // 2. Fallback to Better Auth getSession if not resolved by direct token lookup
  if (!foundSession) {
    try {
      const baSession = await auth.api.getSession({
        headers: req.headers,
      });
      if (baSession?.session?.id) {
        const [row] = await db
          .select()
          .from(sessionTable)
          .where(eq(sessionTable.id, baSession.session.id))
          .limit(1);
        if (row) {
          foundSession = row;
        }
      }
    } catch {
      // Ignore and handle null foundSession below
    }
  }

  if (!foundSession) {
    return {
      context: null,
      failureCode: "UNAUTHORIZED",
      failureMessage: "Authentication required. Please sign in.",
    };
  }

  const [dbUser] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, foundSession.userId))
    .limit(1);

  if (!dbUser) {
    await db
      .delete(sessionTable)
      .where(eq(sessionTable.id, foundSession.id));
    return {
      context: null,
      failureCode: "UNAUTHORIZED",
      failureMessage: "User account not found.",
    };
  }

  // Enforce account standing (banned or suspended users are immediately revoked)
  if (dbUser.banned || dbUser.accountStatus === "suspended") {
    await db
      .delete(sessionTable)
      .where(eq(sessionTable.userId, dbUser.id));
    return {
      context: null,
      failureCode: "ACCOUNT_SUSPENDED",
      failureMessage:
        "Your account has been suspended. Please contact Skilled4U Trust & Safety.",
    };
  }

  const role = normalizeUserRole(dbUser.role);
  const policy = ROLE_SESSION_POLICY[role];
  const nowMs = Date.now();
  const createdMs = new Date(foundSession.createdAt).getTime();
  const updatedMs = new Date(foundSession.updatedAt).getTime();
  const expiresMs = new Date(foundSession.expiresAt).getTime();

  // Enforce role-based absolute max lifetime (8h for Admin, 7d for Artisan, 30d for Customer)
  const roleHardExpiryMs = Math.min(
    expiresMs,
    createdMs + policy.maxAgeSeconds * 1000
  );

  // Enforce role-based sliding idle timeout (30m for Admin, 24h for Artisan, 7d for Customer)
  const roleIdleExpiryMs = updatedMs + policy.idleTimeoutSeconds * 1000;

  if (nowMs > roleHardExpiryMs || nowMs > roleIdleExpiryMs) {
    await db
      .delete(sessionTable)
      .where(eq(sessionTable.id, foundSession.id));

    const isIdle = nowMs > roleIdleExpiryMs && nowMs <= roleHardExpiryMs;
    return {
      context: null,
      failureCode: "SESSION_TIMEOUT",
      failureMessage: isIdle
        ? `Your ${role} session timed out due to inactivity (${Math.round(
            policy.idleTimeoutSeconds / 60
          )}m idle limit). Please sign in again.`
        : `Your ${role} session has reached its maximum lifetime. Please sign in again.`,
    };
  }

  // Slide the idle window forward (throttled to at most once every 30 seconds to minimize DB writes)
  let effectiveUpdatedAt = new Date(foundSession.updatedAt);
  const effectiveExpiresAt = new Date(roleHardExpiryMs);

  if (nowMs - updatedMs > 30_000 || expiresMs !== roleHardExpiryMs) {
    effectiveUpdatedAt = new Date(nowMs);
    await db
      .update(sessionTable)
      .set({
        updatedAt: effectiveUpdatedAt,
        expiresAt: effectiveExpiresAt,
      })
      .where(eq(sessionTable.id, foundSession.id));
  }

  const sessionPolicy = computeSessionPolicy(
    role,
    effectiveExpiresAt,
    effectiveUpdatedAt
  );

  return {
    context: {
      user: dbUser,
      session: {
        id: foundSession.id,
        token: foundSession.token,
        userId: foundSession.userId,
        expiresAt: effectiveExpiresAt,
        updatedAt: effectiveUpdatedAt,
      },
      sessionPolicy,
      adminScope: role === "admin" ? resolveAdminScope(dbUser) : null,
    },
  };
}

/**
 * Resolves the authenticated user and session from either Cookie or Bearer token.
 * Returns null if unauthenticated, suspended, or timed out.
 */
export async function resolveAuthSession(
  req: Request
): Promise<ResolvedAuthContext | null> {
  const res = await resolveAuthSessionDetailed(req);
  return res.context;
}

/**
 * Guard helper for API routes requiring an authenticated user (optionally restricted to specific roles).
 */
export async function requireAuth(
  req: Request,
  allowedRoles?: NormalizedRole[]
): Promise<
  | { ok: true; auth: ResolvedAuthContext }
  | { ok: false; response: NextResponse }
> {
  const resolution = await resolveAuthSessionDetailed(req);
  if (!resolution.context) {
    const status =
      resolution.failureCode === "ACCOUNT_SUSPENDED" ? 403 : 401;
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            resolution.failureMessage ||
            "Unauthorized: Active session or Bearer token required",
          code: resolution.failureCode || "UNAUTHORIZED",
        },
        { status }
      ),
    };
  }

  const userRole = normalizeUserRole(resolution.context.user.role);
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: `Forbidden: This action requires ${allowedRoles.join(" or ")} privileges.`,
          code: "FORBIDDEN",
        },
        { status: 403 }
      ),
    };
  }

  return { ok: true, auth: resolution.context };
}

/**
 * Guard helper for Admin-only API routes, with optional granular RBAC scope enforcement
 * (`super_admin` | `kyc_moderator` | `dispatch_support`).
 */
export async function requireAdmin(
  req: Request,
  allowedScopes?: AdminScope[]
): Promise<
  | { ok: true; auth: ResolvedAuthContext }
  | { ok: false; response: NextResponse }
> {
  const baseGuard = await requireAuth(req, ["admin"]);
  if (!baseGuard.ok) return baseGuard;

  if (allowedScopes && allowedScopes.length > 0) {
    const scope =
      baseGuard.auth.adminScope || resolveAdminScope(baseGuard.auth.user);
    if (!allowedScopes.includes(scope)) {
      return {
        ok: false,
        response: NextResponse.json(
          {
            error: `Forbidden: Your administrator role (${
              baseGuard.auth.user.adminRoleTitle || scope
            }) does not have permission for this action. Required scope: ${allowedScopes.join(
              " or "
            )}.`,
            code: "FORBIDDEN_ADMIN_SCOPE",
          },
          { status: 403 }
        ),
      };
    }
  }

  return baseGuard;
}

/**
 * Builds the standardized role-specific onboarding checklist for mobile and web clients.
 */
export function buildOnboardingChecklist(
  user: UserRow,
  artisanProfile: ArtisanRow | null
) {
  const role = normalizeUserRole(user.role);
  if (role === "artisan") {
    const hasNin = Boolean(
      artisanProfile &&
        (artisanProfile.ninEncrypted ||
          artisanProfile.ninHash ||
          artisanProfile.ninNumber)
    );
    const hasKycDocs = Boolean(
      artisanProfile &&
        artisanProfile.kycSelfieUrl &&
        artisanProfile.kycIdDocumentUrl
    );
    return {
      accountCreated: true,
      emailVerified: Boolean(user.emailVerified),
      tradeProfileCompleted: Boolean(artisanProfile && artisanProfile.trade),
      kycSubmitted: Boolean(
        artisanProfile && hasNin && artisanProfile.bankAccountNumber
      ),
      kycDocumentsUploaded: hasKycDocs,
      kycVerified: artisanProfile?.kycStatus === "verified",
      kycStatus: artisanProfile?.kycStatus || "pending",
      kycRejectionReason: artisanProfile?.kycRejectionReason || null,
      currentStatus: user.onboardingStatus,
      currentStep: user.onboardingStep,
    };
  }

  if (role === "admin") {
    return {
      accountCreated: true,
      emailVerified: true,
      adminAccessActive: !user.mustChangePassword,
      mustChangePassword: Boolean(user.mustChangePassword),
      adminScope: resolveAdminScope(user),
      currentStatus: user.mustChangePassword
        ? "password_change_required"
        : "completed",
      currentStep: 5,
    };
  }

  return {
    accountCreated: true,
    emailVerified: Boolean(user.emailVerified),
    locationProfileCompleted: Boolean(user.phone && user.city),
    currentStatus: user.onboardingStatus,
    currentStep: user.onboardingStep,
  };
}

/**
 * Server Component Guard helper for Admin Web Pages.
 * Inspects incoming request headers and ensures an authenticated administrator is active.
 * Redirects unauthorized visitors to `/login`.
 */
export async function requireAdminPage(
  allowedScopes?: AdminScope[]
): Promise<ResolvedAuthContext> {
  const headersList = await headers();
  const dummyReq = new Request("http://localhost:3000", {
    headers: headersList,
  });

  const authCtx = await resolveAuthSession(dummyReq);
  if (!authCtx || normalizeUserRole(authCtx.user.role) !== "admin") {
    redirect("/login");
  }

  const scope = authCtx.adminScope || resolveAdminScope(authCtx.user);
  if (allowedScopes && allowedScopes.length > 0 && !allowedScopes.includes(scope)) {
    redirect("/admin");
  }

  return authCtx;
}

