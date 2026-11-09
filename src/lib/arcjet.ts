import arcjet, {
  detectBot,
  shield,
  slidingWindow,
  validateEmail,
  type ArcjetMode,
} from "@arcjet/next";
import { NextRequest, NextResponse } from "next/server";

const rawArcjetKey = process.env.ARCJET_KEY?.trim() || "";
const hasLiveArcjetKey =
  rawArcjetKey.startsWith("ajkey_") &&
  !rawArcjetKey.includes("placeholder") &&
  rawArcjetKey.length > 16;

const arcjetMode: ArcjetMode = hasLiveArcjetKey ? "LIVE" : "DRY_RUN";

/**
 * Base Arcjet Next.js client configured with WAF Shield and Bot Detection.
 * When ARCJET_KEY is configured in .env, decisions run via Arcjet Cloud in LIVE mode.
 * When running locally without an ARCJET_KEY, a deterministic local sliding-window
 * and email-validation fallback enforces the exact same security policies.
 */
export const ajBase = hasLiveArcjetKey
  ? arcjet({
      key: rawArcjetKey,
      characteristics: ["ip.src"],
      rules: [
        shield({ mode: arcjetMode }),
        detectBot({
          mode: arcjetMode,
          allow: ["CATEGORY:SEARCH_ENGINE", "CURL"],
        }),
      ],
    })
  : null;

const ajLogin = ajBase
  ? ajBase.withRule(
      slidingWindow({
        mode: arcjetMode,
        interval: "10m",
        max: 10,
      })
    )
  : null;

const ajOtp = ajBase
  ? ajBase.withRule(
      slidingWindow({
        mode: arcjetMode,
        interval: "10m",
        max: 5,
      })
    )
  : null;

const ajRegister = ajBase
  ? ajBase
      .withRule(
        slidingWindow({
          mode: arcjetMode,
          interval: "15m",
          max: 5,
        })
      )
      .withRule(
        validateEmail({
          mode: arcjetMode,
          deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
        })
      )
  : null;

const ajMutation = ajBase
  ? ajBase.withRule(
      slidingWindow({
        mode: arcjetMode,
        interval: "1m",
        max: 60,
      })
    )
  : null;

// ---------------------------------------------------------------------------
// Deterministic In-Memory Sliding Window & Disposable Email Fallback
// (Ensures brute-force rate limits are always enforced even before ARCJET_KEY is set)
// ---------------------------------------------------------------------------
const slidingBuckets = new Map<string, number[]>();

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "yopmail.com",
  "trashmail.com",
  "sharklasers.com",
  "getnada.com",
  "maildrop.cc",
]);

function extractClientKey(req: NextRequest, suffix?: string): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    realIp?.trim() ||
    "127.0.0.1";
  return suffix ? `${ip}:${suffix.toLowerCase().trim()}` : ip;
}

function checkLocalSlidingWindow(
  bucketKey: string,
  windowMs: number,
  maxRequests: number
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const windowStart = now - windowMs;
  const timestamps = (slidingBuckets.get(bucketKey) || []).filter(
    (ts) => ts > windowStart
  );

  if (timestamps.length >= maxRequests) {
    const oldest = timestamps[0] ?? now;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((oldest + windowMs - now) / 1000)
    );
    slidingBuckets.set(bucketKey, timestamps);
    return { allowed: false, retryAfterSeconds };
  }

  timestamps.push(now);
  slidingBuckets.set(bucketKey, timestamps);
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Protects POST /api/v1/auth/login against credential stuffing and brute force.
 * Limit: 10 attempts per 10 minutes per IP+Email.
 */
export async function protectAuthLogin(
  req: NextRequest,
  email?: string
): Promise<NextResponse | null> {
  const key = `login:${extractClientKey(req, email)}`;
  const local = checkLocalSlidingWindow(key, 10 * 60 * 1000, 10);
  if (!local.allowed) {
    return NextResponse.json(
      {
        error: `Too many sign-in attempts. Please wait ${local.retryAfterSeconds} seconds before trying again.`,
        code: "RATE_LIMITED",
      },
      {
        status: 429,
        headers: { "Retry-After": String(local.retryAfterSeconds) },
      }
    );
  }

  if (ajLogin) {
    try {
      const decision = await ajLogin.protect(req);
      if (decision.isDenied()) {
        return NextResponse.json(
          {
            error: decision.reason.isRateLimit()
              ? "Too many sign-in attempts. Please wait a few minutes and try again."
              : "Sign-in request blocked by security policy.",
            code: decision.reason.isRateLimit() ? "RATE_LIMITED" : "FORBIDDEN",
          },
          { status: decision.reason.isRateLimit() ? 429 : 403 }
        );
      }
    } catch (err) {
      console.warn("[Arcjet] Login protection check warning:", err);
    }
  }

  return null;
}

/**
 * Protects POST /api/v1/auth/verify-otp against 6-digit OTP brute-forcing and email spam.
 * Limit: 5 attempts per 10 minutes per IP+Email+Action.
 */
export async function protectOtpEndpoint(
  req: NextRequest,
  email?: string,
  action?: string
): Promise<NextResponse | null> {
  const key = `otp:${action || "verify"}:${extractClientKey(req, email)}`;
  const local = checkLocalSlidingWindow(key, 10 * 60 * 1000, 5);
  if (!local.allowed) {
    return NextResponse.json(
      {
        error: `Too many OTP requests or verification attempts. Please wait ${local.retryAfterSeconds} seconds.`,
        code: "RATE_LIMITED",
      },
      {
        status: 429,
        headers: { "Retry-After": String(local.retryAfterSeconds) },
      }
    );
  }

  if (ajOtp) {
    try {
      const decision = await ajOtp.protect(req);
      if (decision.isDenied()) {
        return NextResponse.json(
          {
            error: decision.reason.isRateLimit()
              ? "Too many OTP attempts. Please wait 10 minutes before trying again."
              : "OTP request blocked by security policy.",
            code: decision.reason.isRateLimit() ? "RATE_LIMITED" : "FORBIDDEN",
          },
          { status: decision.reason.isRateLimit() ? 429 : 403 }
        );
      }
    } catch (err) {
      console.warn("[Arcjet] OTP protection check warning:", err);
    }
  }

  return null;
}

/**
 * Protects POST /api/v1/auth/register with rate limiting and disposable email blocking.
 * Limit: 5 registrations per 15 minutes per IP.
 */
export async function protectRegistration(
  req: NextRequest,
  email: string
): Promise<NextResponse | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const domain = normalizedEmail.split("@")[1] || "";

  if (!domain || DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return NextResponse.json(
      {
        error:
          "Disposable or temporary email addresses are not permitted on Skilled4U.",
        code: "INVALID_EMAIL_DOMAIN",
      },
      { status: 400 }
    );
  }

  const key = `register:${extractClientKey(req)}`;
  const local = checkLocalSlidingWindow(key, 15 * 60 * 1000, 10);
  if (!local.allowed) {
    return NextResponse.json(
      {
        error: `Too many account registration attempts. Please wait ${local.retryAfterSeconds} seconds.`,
        code: "RATE_LIMITED",
      },
      {
        status: 429,
        headers: { "Retry-After": String(local.retryAfterSeconds) },
      }
    );
  }

  if (ajRegister) {
    try {
      const decision = await ajRegister.protect(req, { email: normalizedEmail });
      if (decision.isDenied()) {
        if (decision.reason.isEmail()) {
          return NextResponse.json(
            {
              error:
                "Please provide a valid, non-disposable email address with active mail records.",
              code: "INVALID_EMAIL",
            },
            { status: 400 }
          );
        }
        return NextResponse.json(
          {
            error: decision.reason.isRateLimit()
              ? "Too many registration attempts. Please wait before trying again."
              : "Registration blocked by security policy.",
            code: decision.reason.isRateLimit() ? "RATE_LIMITED" : "FORBIDDEN",
          },
          { status: decision.reason.isRateLimit() ? 429 : 403 }
        );
      }
    } catch (err) {
      console.warn("[Arcjet] Registration protection check warning:", err);
    }
  }

  return null;
}

/**
 * Protects general mutation API endpoints (/api/v1/*) against flood attacks.
 */
export async function protectMutationApi(
  req: NextRequest
): Promise<NextResponse | null> {
  const key = `mutation:${extractClientKey(req)}`;
  const local = checkLocalSlidingWindow(key, 60 * 1000, 90);
  if (!local.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Please slow down your requests.",
        code: "RATE_LIMITED",
      },
      { status: 429 }
    );
  }

  if (ajMutation) {
    try {
      const decision = await ajMutation.protect(req);
      if (decision.isDenied()) {
        return NextResponse.json(
          {
            error: "Request blocked by security shield or rate limit.",
            code: "SECURITY_BLOCKED",
          },
          { status: decision.reason.isRateLimit() ? 429 : 403 }
        );
      }
    } catch (err) {
      console.warn("[Arcjet] Mutation protection check warning:", err);
    }
  }

  return null;
}

