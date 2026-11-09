import { Resend, type WebhookEventPayload } from "resend";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { emailLogs, type EmailLogRow } from "@/db/schema";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Skilled4U <onboarding@resend.dev>";
const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET || "";

export const resend = new Resend(
  RESEND_API_KEY || "re_placeholder_skilled4u"
);

export function isLiveResendConfigured(): boolean {
  return (
    Boolean(RESEND_API_KEY) &&
    RESEND_API_KEY.startsWith("re_") &&
    !RESEND_API_KEY.includes("placeholder") &&
    RESEND_API_KEY !== "re_..."
  );
}

function wrapBrandedHtml({
  badge,
  headline,
  bodyHtml,
  footerNote,
}: {
  badge: string;
  headline: string;
  bodyHtml: string;
  footerNote?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${headline}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:560px;background-color:#ffffff;border-radius:24px;border:2px solid #dbeafe;overflow:hidden;box-shadow:0 12px 32px rgba(15,23,42,0.06);">
            <tr>
              <td style="background:linear-gradient(135deg,#0b2559 0%,#1d4ed8 100%);padding:28px 32px;color:#ffffff;">
                <div style="display:inline-block;background-color:rgba(255,255,255,0.16);border:1px solid rgba(255,255,255,0.28);border-radius:999px;padding:4px 12px;font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#bae6fd;">
                  ${badge}
                </div>
                <h1 style="margin:14px 0 0;font-size:24px;font-weight:800;line-height:1.25;color:#ffffff;">
                  ${headline}
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;font-size:14px;line-height:1.65;color:#1e293b;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;">
                <strong style="color:#0b2559;">Skilled4U Nigeria</strong> · Verified Artisans &amp; 90/10 Escrow Protection<br />
                ${
                  footerNote ||
                  "Abuja &amp; Lagos Operations · Reply directly to this email to reach Skilled4U Support."
                }
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export interface SendAndLogEmailInput {
  to: string;
  subject: string;
  templateType:
    | "otp_verification"
    | "otp_signin"
    | "password_reset"
    | "verification_link"
    | "welcome_customer"
    | "welcome_artisan"
    | "welcome_admin"
    | "kyc_status"
    | "transactional";
  text: string;
  html: string;
  replyTo?: string;
  metadata?: Record<string, unknown>;
}

export async function sendAndLogEmail(
  input: SendAndLogEmailInput
): Promise<{
  success: boolean;
  logId: string;
  resendId: string | null;
  status: string;
  error?: string;
}> {
  const logId = `em_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  let resendId: string | null = null;
  let status = "logged_dev";
  let sendError: string | undefined;

  if (isLiveResendConfigured()) {
    try {
      const { data, error } = await resend.emails.send({
        from: RESEND_FROM_EMAIL,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
        ...(input.replyTo ? { replyTo: input.replyTo } : {}),
      });

      if (error) {
        sendError = error.message;
        status = "logged_dev";
      } else if (data?.id) {
        resendId = data.id;
        status = "sent";
      }
    } catch (err) {
      sendError = err instanceof Error ? err.message : "Resend send error";
      status = "logged_dev";
    }
  } else {
    resendId = `re_dev_${Date.now().toString(36)}`;
    status = "logged_dev";
  }

  try {
    await db.insert(emailLogs).values({
      id: logId,
      direction: "outbound",
      resendId,
      fromEmail: RESEND_FROM_EMAIL,
      toEmail: input.to,
      subject: input.subject,
      templateType: input.templateType,
      textBody: input.text,
      htmlBody: input.html,
      status,
      metadata: {
        ...(input.metadata || {}),
        ...(sendError ? { resendNotice: sendError } : {}),
      },
    });
  } catch (dbErr) {
    console.error("Failed to record outbound email in NeonDB:", dbErr);
  }

  return {
    success: true,
    logId,
    resendId,
    status,
    ...(sendError ? { error: sendError } : {}),
  };
}

/**
 * 1. Send 6-Digit OTP for Email Verification, Passwordless Sign-In, or Password Reset
 */
export async function sendAuthOtpEmail({
  to,
  otp,
  type,
}: {
  to: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password" | "change-email";
}) {
  const titleMap: Record<typeof type, { subject: string; badge: string; headline: string; purpose: string }> = {
    "email-verification": {
      subject: `${otp} is your Skilled4U email verification code`,
      badge: "Email Verification",
      headline: "Verify Your Skilled4U Account",
      purpose: "complete your account verification on Skilled4U",
    },
    "sign-in": {
      subject: `${otp} is your Skilled4U sign-in code`,
      badge: "One-Time Passcode",
      headline: "Sign In to Skilled4U",
      purpose: "sign in securely to your Skilled4U account",
    },
    "forget-password": {
      subject: `${otp} is your Skilled4U password reset code`,
      badge: "Password Reset",
      headline: "Reset Your Skilled4U Password",
      purpose: "reset your Skilled4U account password",
    },
    "change-email": {
      subject: `${otp} is your Skilled4U email change code`,
      badge: "Security Verification",
      headline: "Confirm Your New Email Address",
      purpose: "confirm your email address update on Skilled4U",
    },
  };

  const config = titleMap[type] ?? titleMap["email-verification"];

  const html = wrapBrandedHtml({
    badge: config.badge,
    headline: config.headline,
    bodyHtml: `
      <p style="margin:0 0 16px;">Use the 6-digit verification code below to ${config.purpose} (Web Admin Portal, Artisan App, or Customer App):</p>
      <div style="margin:24px 0;padding:20px;border-radius:16px;background-color:#eff6ff;border:2px dashed #3b82f6;text-align:center;">
        <span style="font-family:monospace;font-size:32px;font-weight:800;letter-spacing:0.25em;color:#0b2559;">${otp}</span>
      </div>
      <p style="margin:0;color:#475569;font-size:13px;">This code expires in <strong>10 minutes</strong>. If you did not request this code, you can safely ignore this message.</p>
    `,
  });

  const text = `Your Skilled4U ${config.badge} code is: ${otp}. Use this code to ${config.purpose}. It expires in 10 minutes.`;

  return sendAndLogEmail({
    to,
    subject: config.subject,
    templateType:
      type === "sign-in"
        ? "otp_signin"
        : type === "forget-password"
          ? "password_reset"
          : "otp_verification",
    text,
    html,
    metadata: { otp, otpType: type },
  });
}

/**
 * 2. Send Password Reset Link Email (Better Auth sendResetPassword hook)
 */
export async function sendPasswordResetEmail({
  to,
  name,
  url,
  token,
}: {
  to: string;
  name?: string;
  url: string;
  token: string;
}) {
  const html = wrapBrandedHtml({
    badge: "Account Security",
    headline: "Reset Your Skilled4U Password",
    bodyHtml: `
      <p style="margin:0 0 14px;">Hello <strong>${name || "Skilled4U User"}</strong>,</p>
      <p style="margin:0 0 20px;">We received a request to reset the password for your Skilled4U account. Click the button below or use the reset token in your app:</p>
      <p style="margin:24px 0;">
        <a href="${url}" style="display:inline-block;background-color:#1d4ed8;color:#ffffff;font-weight:800;text-decoration:none;padding:12px 24px;border-radius:999px;">
          Reset Password
        </a>
      </p>
      <p style="margin:0;font-size:12px;color:#64748b;">Reset Token: <code>${token}</code></p>
    `,
  });

  const text = `Hello ${name || "Skilled4U User"}, reset your Skilled4U password using this link: ${url} (Token: ${token})`;

  return sendAndLogEmail({
    to,
    subject: "Reset your Skilled4U password",
    templateType: "password_reset",
    text,
    html,
    metadata: { url, token },
  });
}

/**
 * 3. Send Email Verification Link (Better Auth sendVerificationEmail hook)
 */
export async function sendVerificationLinkEmail({
  to,
  name,
  url,
  token,
}: {
  to: string;
  name?: string;
  url: string;
  token: string;
}) {
  const html = wrapBrandedHtml({
    badge: "Email Confirmation",
    headline: "Confirm Your Email Address",
    bodyHtml: `
      <p style="margin:0 0 14px;">Welcome <strong>${name || "to Skilled4U"}</strong>,</p>
      <p style="margin:0 0 20px;">Confirm your email address by clicking the button below:</p>
      <p style="margin:24px 0;">
        <a href="${url}" style="display:inline-block;background-color:#1d4ed8;color:#ffffff;font-weight:800;text-decoration:none;padding:12px 24px;border-radius:999px;">
          Confirm Email Address
        </a>
      </p>
    `,
  });

  const text = `Welcome ${name || "to Skilled4U"}! Confirm your email address: ${url}`;

  return sendAndLogEmail({
    to,
    subject: "Confirm your Skilled4U email address",
    templateType: "verification_link",
    text,
    html,
    metadata: { url, token },
  });
}

/**
 * 4. Role-Specific Welcome & Onboarding Confirmation Email
 */
export async function sendWelcomeOnboardingEmail({
  to,
  name,
  role,
  city,
  trade,
  adminRoleTitle,
}: {
  to: string;
  name: string;
  role: "admin" | "client" | "artisan";
  city?: string;
  trade?: string;
  adminRoleTitle?: string;
}) {
  if (role === "artisan") {
    const html = wrapBrandedHtml({
      badge: "Artisan Pro Onboarding",
      headline: `Welcome to Skilled4U Pros, ${name}!`,
      bodyHtml: `
        <p style="margin:0 0 14px;">Your Artisan Pro profile for <strong>${trade || "Skilled Services"}</strong> in <strong>${city || "Abuja & Lagos"}</strong> has been registered.</p>
        <ul style="margin:0 0 18px;padding-left:20px;color:#334155;">
          <li><strong>Step 1:</strong> Account &amp; Email Verification — Completed</li>
          <li><strong>Step 2:</strong> Trade &amp; Service Rate Profile — Saved</li>
          <li><strong>Step 3:</strong> NIN &amp; NUBAN Bank KYC — Under Admin Verification</li>
        </ul>
        <p style="margin:0;color:#475569;">Once our Trust &amp; KYC desk verifies your NIN and settlement bank account, you will start receiving live job dispatches and 90% instant escrow payouts.</p>
      `,
    });

    return sendAndLogEmail({
      to,
      subject: `Welcome to Skilled4U Artisan Pros, ${name}!`,
      templateType: "welcome_artisan",
      text: `Welcome to Skilled4U Artisan Pros, ${name}! Your ${trade || "Pro"} profile in ${city || "Abuja & Lagos"} is registered and awaiting KYC approval.`,
      html,
      metadata: { role, city, trade },
    });
  }

  if (role === "admin") {
    const html = wrapBrandedHtml({
      badge: "Admin Operations Console",
      headline: `Administrator Access Provisioned`,
      bodyHtml: `
        <p style="margin:0 0 14px;">Hello <strong>${name}</strong>,</p>
        <p style="margin:0 0 16px;">Your Skilled4U Web Administrator account has been provisioned with the role <strong>${adminRoleTitle || "Operations Administrator"}</strong>.</p>
        <p style="margin:0;color:#475569;">You can sign in at the Skilled4U Admin Portal using your email and password or a 6-digit Email OTP code.</p>
      `,
    });

    return sendAndLogEmail({
      to,
      subject: "Your Skilled4U Admin Portal Access is Active",
      templateType: "welcome_admin",
      text: `Hello ${name}, your Skilled4U Admin Portal account (${adminRoleTitle || "Operations Administrator"}) is now active.`,
      html,
      metadata: { role, adminRoleTitle },
    });
  }

  const html = wrapBrandedHtml({
    badge: "Customer Onboarding Complete",
    headline: `Welcome to Skilled4U, ${name}!`,
    bodyHtml: `
      <p style="margin:0 0 14px;">Your Customer account is active and ready to book vetted, NIN-verified artisans across <strong>${city || "Abuja & Lagos"}</strong>.</p>
      <p style="margin:0;color:#475569;">Every booking on Skilled4U is protected by our escrow system—funds are only released to your artisan after you confirm the job is completed to your satisfaction.</p>
    `,
  });

  return sendAndLogEmail({
    to,
    subject: `Welcome to Skilled4U, ${name}!`,
    templateType: "welcome_customer",
    text: `Welcome to Skilled4U, ${name}! Your Customer account in ${city || "Abuja & Lagos"} is active and ready to book verified artisans.`,
    html,
    metadata: { role, city },
  });
}

/**
 * 5. Artisan KYC Status Notification Email (Verified / Rejected / Pending)
 */
export async function sendArtisanKycStatusEmail({
  to,
  name,
  trade,
  kycStatus,
  note,
}: {
  to: string;
  name: string;
  trade: string;
  kycStatus: "verified" | "pending" | "rejected";
  note?: string;
}) {
  const isVerified = kycStatus === "verified";
  const isRejected = kycStatus === "rejected";

  const subject = isVerified
    ? "Your Skilled4U Artisan KYC is Approved — Dispatch & Payouts Active"
    : isRejected
      ? "Action Required: Skilled4U Artisan KYC Verification Update"
      : "Skilled4U Artisan KYC Under Review";

  const headline = isVerified
    ? "KYC Approved: You Are Verified for Dispatch!"
    : isRejected
      ? "KYC Update: Additional Verification Needed"
      : "Your KYC Credentials Are in Review";

  const html = wrapBrandedHtml({
    badge: `KYC Status: ${kycStatus.toUpperCase()}`,
    headline,
    bodyHtml: `
      <p style="margin:0 0 14px;">Hello <strong>${name}</strong> (${trade}),</p>
      <p style="margin:0 0 16px;">
        ${
          isVerified
            ? "Congratulations! Our Trust &amp; Safety team has verified your NIN and NUBAN settlement bank account. Your profile is now live on the Skilled4U Artisan App and eligible for 90% escrow payouts."
            : isRejected
              ? `We could not verify your submitted NIN or NUBAN settlement account. ${note || "Please open the Skilled4U Artisan mobile app and re-submit valid credentials."}`
              : "Your NIN and NUBAN bank details are currently queued for verification by our operations team."
        }
      </p>
    `,
  });

  return sendAndLogEmail({
    to,
    subject,
    templateType: "kyc_status",
    text: `Hello ${name} (${trade}), your Skilled4U KYC status is now: ${kycStatus.toUpperCase()}. ${note || ""}`,
    html,
    metadata: { trade, kycStatus, note },
  });
}

/**
 * 6. Inbound Email Receiving & Webhook Helpers (Resend Receiving API)
 */
export async function fetchReceivedEmailFromResend(emailId: string) {
  if (!isLiveResendConfigured()) {
    return null;
  }
  try {
    const { data, error } = await resend.emails.receiving.get(emailId);
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function recordInboundEmail({
  resendId,
  fromEmail,
  toEmail,
  subject,
  textBody,
  htmlBody,
  metadata,
}: {
  resendId?: string | null;
  fromEmail: string;
  toEmail: string;
  subject: string;
  textBody?: string | null;
  htmlBody?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<EmailLogRow> {
  const id = `inb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const [inserted] = await db
    .insert(emailLogs)
    .values({
      id,
      direction: "inbound",
      resendId: resendId || null,
      fromEmail,
      toEmail,
      subject: subject || "(No Subject)",
      templateType: "inbound_email",
      textBody: textBody || null,
      htmlBody: htmlBody || null,
      status: "received",
      metadata: metadata || {},
    })
    .returning();

  return inserted;
}

export async function updateEmailDeliveryStatus(
  resendId: string,
  nextStatus: "sent" | "delivered" | "bounced" | "complained" | "failed",
  eventMeta?: Record<string, unknown>
) {
  if (!resendId) return null;
  const [updated] = await db
    .update(emailLogs)
    .set({
      status: nextStatus,
      ...(eventMeta ? { metadata: eventMeta } : {}),
    })
    .where(eq(emailLogs.resendId, resendId))
    .returning();
  return updated || null;
}

export function verifyResendWebhookSignature({
  rawBody,
  svixId,
  svixTimestamp,
  svixSignature,
}: {
  rawBody: string;
  svixId: string | null;
  svixTimestamp: string | null;
  svixSignature: string | null;
}): { verified: boolean; event?: WebhookEventPayload; error?: string } {
  const isRealWebhookSecret =
    Boolean(RESEND_WEBHOOK_SECRET) &&
    RESEND_WEBHOOK_SECRET.startsWith("whsec_") &&
    !RESEND_WEBHOOK_SECRET.includes("placeholder") &&
    RESEND_WEBHOOK_SECRET !== "whsec_...";

  if (!isRealWebhookSecret) {
    try {
      const parsed = JSON.parse(rawBody) as WebhookEventPayload;
      return { verified: true, event: parsed };
    } catch (err) {
      return {
        verified: false,
        error: err instanceof Error ? err.message : "Invalid JSON payload",
      };
    }
  }

  if (!svixId || !svixTimestamp || !svixSignature) {
    return {
      verified: false,
      error: "Missing svix-id, svix-timestamp, or svix-signature headers",
    };
  }

  try {
    const event = resend.webhooks.verify({
      payload: rawBody,
      headers: {
        id: svixId,
        timestamp: svixTimestamp,
        signature: svixSignature,
      },
      webhookSecret: RESEND_WEBHOOK_SECRET,
    });
    return { verified: true, event };
  } catch (err) {
    return {
      verified: false,
      error:
        err instanceof Error
          ? err.message
          : "Webhook signature verification failed",
    };
  }
}

