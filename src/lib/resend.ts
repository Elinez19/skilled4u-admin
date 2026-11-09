import { Resend, type WebhookEventPayload } from "resend";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { emailLogs, type EmailLogRow } from "@/db/schema";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Skilled4U <onboarding@resend.dev>";
const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET || "";
const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.BETTER_AUTH_URL ||
  "https://skilled4u.com";

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

export type EmailHeaderTone = "blue" | "emerald" | "amber" | "ink";

export interface WrapBrandedHtmlOptions {
  badge: string;
  headline: string;
  subheadline?: string;
  preheader?: string;
  headerTone?: EmailHeaderTone;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  secondaryNoteHtml?: string;
  footerNote?: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function resolveHeaderTheme(tone: EmailHeaderTone = "blue"): {
  headerBg: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  dotColor: string;
  subtextColor: string;
  accentBar: string;
} {
  switch (tone) {
    case "emerald":
      return {
        headerBg:
          "linear-gradient(135deg,#042f2e 0%,#065f46 52%,#059669 100%)",
        badgeBg: "rgba(16,185,129,0.22)",
        badgeBorder: "rgba(110,231,183,0.45)",
        badgeText: "#a7f3d0",
        dotColor: "#34d399",
        subtextColor: "#d1fae5",
        accentBar:
          "linear-gradient(90deg,#00c47e 0%,#34d399 50%,#ffb800 100%)",
      };
    case "amber":
      return {
        headerBg:
          "linear-gradient(135deg,#451a03 0%,#92400e 52%,#d97706 100%)",
        badgeBg: "rgba(245,158,11,0.24)",
        badgeBorder: "rgba(253,230,138,0.45)",
        badgeText: "#fde68a",
        dotColor: "#fbbf24",
        subtextColor: "#fef3c7",
        accentBar:
          "linear-gradient(90deg,#ffb800 0%,#f59e0b 50%,#ef4444 100%)",
      };
    case "ink":
      return {
        headerBg:
          "linear-gradient(135deg,#05113d 0%,#091e70 55%,#0e46f5 100%)",
        badgeBg: "rgba(92,225,255,0.16)",
        badgeBorder: "rgba(92,225,255,0.38)",
        badgeText: "#5ce1ff",
        dotColor: "#ffb800",
        subtextColor: "#dce8ff",
        accentBar:
          "linear-gradient(90deg,#ffb800 0%,#5ce1ff 50%,#1f64ff 100%)",
      };
    case "blue":
    default:
      return {
        headerBg:
          "linear-gradient(135deg,#05113d 0%,#0a35c7 48%,#1f64ff 100%)",
        badgeBg: "rgba(255,255,255,0.14)",
        badgeBorder: "rgba(92,225,255,0.42)",
        badgeText: "#5ce1ff",
        dotColor: "#5ce1ff",
        subtextColor: "#dce8ff",
        accentBar:
          "linear-gradient(90deg,#5ce1ff 0%,#1f64ff 50%,#ffb800 100%)",
      };
  }
}

/**
 * Master Skilled4U HTML Email Template Builder
 * Crafted with inline table-based CSS for universal rendering across Gmail, Apple Mail, Outlook, and Yahoo.
 * Mirrors the Skilled4U Vibrant Electric Blue (#0e46f5 / #05113d) & Glossy Porcelain (#ffffff / #f6f9ff) design system.
 */
export function wrapBrandedHtml({
  badge,
  headline,
  subheadline,
  preheader,
  headerTone = "blue",
  bodyHtml,
  ctaLabel,
  ctaUrl,
  secondaryNoteHtml,
  footerNote,
}: WrapBrandedHtmlOptions): string {
  const theme = resolveHeaderTheme(headerTone);
  const resolvedPreheader =
    preheader ||
    `${headline} — Skilled4U Nigeria Verified Artisans & 90/10 Escrow Protection.`;

  const ctaSectionHtml =
    ctaLabel && ctaUrl
      ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:28px 0 8px;">
          <tr>
            <td align="center">
              <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:linear-gradient(180deg,#478bff 0%,#0e46f5 52%,#0a35c7 100%);background-color:#0e46f5;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:800;letter-spacing:0.01em;text-decoration:none;padding:15px 32px;border-radius:999px;border:2px solid #80b2ff;box-shadow:0 8px 20px rgba(14,70,245,0.28);">
                ${ctaLabel} &nbsp;&rarr;
              </a>
            </td>
          </tr>
        </table>`
      : "";

  const secondarySectionHtml = secondaryNoteHtml
    ? `<div style="margin-top:22px;padding-top:18px;border-top:1px dashed #dbe8ff;font-size:13px;line-height:1.6;color:#3b4e7a;">
        ${secondaryNoteHtml}
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>${escapeHtml(headline)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#edf3ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#05113d;-webkit-font-smoothing:antialiased;">
    <!-- Hidden Inbox Preheader Preview Text -->
    <div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:#edf3ff;">
      ${escapeHtml(resolvedPreheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#edf3ff;padding:28px 12px 40px;">
      <tr>
        <td align="center">
          <!-- Top Brand Masthead Bar -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin-bottom:14px;">
            <tr>
              <td align="left" valign="middle" style="padding:0 6px;">
                <a href="${APP_BASE_URL}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:inline-block;">
                  <table role="presentation" cellspacing="0" cellpadding="0">
                    <tr>
                      <td valign="middle" style="background:linear-gradient(180deg,#478bff 0%,#0e46f5 55%,#0a35c7 100%);background-color:#0e46f5;width:36px;height:36px;border-radius:11px;text-align:center;border:2px solid #ffffff;box-shadow:0 4px 12px rgba(14,70,245,0.22);">
                        <span style="font-size:16px;font-weight:900;color:#ffffff;line-height:36px;display:inline-block;">S4</span>
                      </td>
                      <td valign="middle" style="padding-left:10px;">
                        <span style="font-size:21px;font-weight:900;letter-spacing:-0.03em;color:#05113d;">skilled<span style="color:#0e46f5;">4U</span></span>
                      </td>
                    </tr>
                  </table>
                </a>
              </td>
              <td align="right" valign="middle" style="padding:0 6px;">
                <span style="display:inline-block;background-color:#ffffff;border:1.5px solid #b8d3ff;border-radius:999px;padding:5px 12px;font-size:11px;font-weight:800;color:#0a35c7;letter-spacing:0.03em;">
                  &#128274; 90/10 Escrow Safe
                </span>
              </td>
            </tr>
          </table>

          <!-- Main Glossy Porcelain Email Card -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#ffffff;border-radius:28px;border:2px solid #b8d3ff;overflow:hidden;box-shadow:0 20px 48px rgba(5,17,61,0.09);">
            <!-- Top Specular Accent Bar -->
            <tr>
              <td style="height:5px;background:${theme.accentBar};font-size:1px;line-height:1px;">&nbsp;</td>
            </tr>

            <!-- Hero Slab Header -->
            <tr>
              <td style="background:${theme.headerBg};background-color:#05113d;padding:34px 36px 30px;color:#ffffff;">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="background-color:${theme.badgeBg};border:1px solid ${theme.badgeBorder};border-radius:999px;padding:5px 14px;">
                      <span style="display:inline-block;width:7px;height:7px;border-radius:999px;background-color:${theme.dotColor};vertical-align:middle;margin-right:6px;"></span>
                      <span style="font-size:11px;font-weight:800;letter-spacing:0.09em;text-transform:uppercase;color:${theme.badgeText};vertical-align:middle;">
                        ${badge}
                      </span>
                    </td>
                  </tr>
                </table>

                <h1 style="margin:16px 0 0;font-size:26px;font-weight:900;line-height:1.22;letter-spacing:-0.02em;color:#ffffff;">
                  ${headline}
                </h1>
                ${
                  subheadline
                    ? `<p style="margin:10px 0 0;font-size:14px;font-weight:500;line-height:1.55;color:${theme.subtextColor};max-width:500px;">
                        ${subheadline}
                      </p>`
                    : ""
                }
              </td>
            </tr>

            <!-- Main Content Body -->
            <tr>
              <td style="padding:32px 36px 28px;font-size:15px;line-height:1.68;color:#05113d;background-color:#ffffff;">
                ${bodyHtml}
                ${ctaSectionHtml}
                ${secondarySectionHtml}
              </td>
            </tr>

            <!-- 3-Pillar Marketplace Trust Strip -->
            <tr>
              <td style="padding:18px 28px;background-color:#f6f9ff;border-top:1.5px solid #dbe8ff;border-bottom:1.5px solid #dbe8ff;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="33%" align="center" valign="top" style="padding:4px 6px;">
                      <div style="font-size:11px;font-weight:800;color:#05113d;letter-spacing:0.01em;">&#9989; NIN-Verified Pros</div>
                      <div style="font-size:11px;color:#5b6f9e;margin-top:2px;">Strict KYC &amp; ID Checks</div>
                    </td>
                    <td width="34%" align="center" valign="top" style="padding:4px 6px;border-left:1px solid #dbe8ff;border-right:1px solid #dbe8ff;">
                      <div style="font-size:11px;font-weight:800;color:#05113d;letter-spacing:0.01em;">&#128737; 90/10 Escrow Split</div>
                      <div style="font-size:11px;color:#5b6f9e;margin-top:2px;">Release Only When Satisfied</div>
                    </td>
                    <td width="33%" align="center" valign="top" style="padding:4px 6px;">
                      <div style="font-size:11px;font-weight:800;color:#05113d;letter-spacing:0.01em;">&#9889; Abuja &amp; Lagos</div>
                      <div style="font-size:11px;color:#5b6f9e;margin-top:2px;">Fast Neighbourhood Dispatch</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Card Footer & Support Concierge -->
            <tr>
              <td style="padding:24px 36px;background-color:#f8faff;font-size:12px;line-height:1.6;color:#5b6f9e;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="left" valign="top">
                      <strong style="color:#05113d;font-size:13px;">Skilled4U Nigeria Marketplace</strong><br />
                      <span>Verified Home &amp;Vetted Artisans ·Instant Services</span><br />
                      <span style="color:#3b4e7a;">
                        ${
                          footerNote ||
                          "Abuja (Wuse II · Maitama · Gwarinpa) &amp; Lagos (Victoria Island · Lekki · Ikeja) · Reply directly to this email to reach our 24/7 Trust &amp; Support Desk."
                        }
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:14px;">
                      <a href="${APP_BASE_URL}" target="_blank" rel="noopener noreferrer" style="color:#0e46f5;font-weight:700;text-decoration:none;margin-right:14px;">Website</a>
                      <a href="${APP_BASE_URL}/artisans" target="_blank" rel="noopener noreferrer" style="color:#0e46f5;font-weight:700;text-decoration:none;margin-right:14px;">Explore Artisans</a>
                      <a href="${APP_BASE_URL}/faq" target="_blank" rel="noopener noreferrer" style="color:#0e46f5;font-weight:700;text-decoration:none;margin-right:14px;">Help Center &amp; FAQs</a>
                      <a href="mailto:support@skilled4u.ng" style="color:#0e46f5;font-weight:700;text-decoration:none;">support@skilled4u.ng</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Bottom Legal Sub-Footer -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin-top:16px;">
            <tr>
              <td align="center" style="padding:0 16px;font-size:11px;line-height:1.5;color:#5b6f9e;">
                &copy; ${new Date().getFullYear()} Skilled4U Technologies Nigeria Ltd. All rights reserved.<br />
                Sent securely via Skilled4U Transactional Notification Service.
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
  logSubject?: string;
  logText?: string;
  logHtml?: string;
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
      subject: input.logSubject || input.subject,
      templateType: input.templateType,
      textBody: input.logText || input.text,
      htmlBody: input.logHtml || input.html,
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
  const titleMap: Record<
    typeof type,
    {
      subject: string;
      badge: string;
      headline: string;
      subheadline: string;
      purpose: string;
      headerTone: EmailHeaderTone;
      securityTip: string;
    }
  > = {
    "email-verification": {
      subject: `${otp} is your Skilled4U email verification code`,
      badge: "Email Verification",
      headline: "Verify Your Skilled4U Account",
      subheadline:
        "Enter this 6-digit security code to verify your email address and activate your Skilled4U profile.",
      purpose: "complete your account verification on Skilled4U",
      headerTone: "blue",
      securityTip:
        "Verifying your email protects your bookings, escrow wallet, and instant NUBAN payouts.",
    },
    "sign-in": {
      subject: `${otp} is your Skilled4U sign-in code`,
      badge: "One-Time Passcode · MFA",
      headline: "Your Skilled4U Sign-In Code",
      subheadline:
        "Use this single-use 6-digit verification code to complete your secure sign-in session.",
      purpose: "sign in securely to your Skilled4U account",
      headerTone: "ink",
      securityTip:
        "If you did not attempt to sign in, please rotate your password immediately or contact Skilled4U Trust & Safety.",
    },
    "forget-password": {
      subject: `${otp} is your Skilled4U password reset code`,
      badge: "Password Recovery",
      headline: "Reset Your Skilled4U Password",
      subheadline:
        "Use the 6-digit verification code below to authorize a new password for your Skilled4U account.",
      purpose: "reset your Skilled4U account password",
      headerTone: "amber",
      securityTip:
        "For your protection, all active sessions across your devices will be signed out once your password is changed.",
    },
    "change-email": {
      subject: `${otp} is your Skilled4U email change code`,
      badge: "Security Verification",
      headline: "Confirm Your New Email Address",
      subheadline:
        "Enter the 6-digit code below to authorize updating the email address linked to your Skilled4U account.",
      purpose: "confirm your email address update on Skilled4U",
      headerTone: "blue",
      securityTip:
        "Each email on Skilled4U is strictly bound to a single account role for escrow and identity security.",
    },
  };

  const config = titleMap[type] ?? titleMap["email-verification"];

  const html = wrapBrandedHtml({
    badge: config.badge,
    headline: config.headline,
    subheadline: config.subheadline,
    preheader: `Your Skilled4U ${config.badge} code is ${otp}. Valid for 10 minutes.`,
    headerTone: config.headerTone,
    bodyHtml: `
      <p style="margin:0 0 18px;font-size:15px;color:#1e293b;">
        Use the 6-digit verification code below to <strong>${config.purpose}</strong> across the Skilled4U Customer App, Artisan Pro App, or Web Admin Console:
      </p>

      <!-- Glossy OTP Code Vault Card -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;">
        <tr>
          <td align="center" style="padding:26px 20px;border-radius:22px;background:linear-gradient(180deg,#f6f9ff 0%,#edf3ff 100%);background-color:#eff5ff;border:2px dashed #1f64ff;box-shadow:inset 0 2px 6px rgba(14,70,245,0.06);">
            <div style="font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#0a35c7;margin-bottom:10px;">
              One-Time Verification Code
            </div>
            <div style="display:inline-block;background-color:#ffffff;border:2px solid #b8d3ff;border-radius:16px;padding:14px 28px;box-shadow:0 6px 16px rgba(5,17,61,0.06);">
              <span style="font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:36px;font-weight:900;letter-spacing:0.28em;color:#05113d;padding-left:0.28em;">${otp}</span>
            </div>
            <div style="margin-top:12px;">
              <span style="display:inline-block;background-color:#dbe8ff;border-radius:999px;padding:4px 12px;font-size:11px;font-weight:800;color:#091e70;">
                &#9201; Expires in 10 minutes · Single-use only
              </span>
            </div>
          </td>
        </tr>
      </table>

      <!-- Security Advisory Box -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8faff;border-left:4px solid #0e46f5;border-radius:12px;padding:14px 16px;">
        <tr>
          <td style="font-size:13px;line-height:1.55;color:#3b4e7a;">
            <strong style="color:#05113d;">Security Notice:</strong> ${config.securityTip} Never share this 6-digit code with anyone—Skilled4U staff and artisans will never ask for your OTP.
          </td>
        </tr>
      </table>
    `,
    secondaryNoteHtml: `Requested for account: <strong style="color:#05113d;">${escapeHtml(to)}</strong>. If you did not request this code, you can safely ignore this email.`,
  });

  const text = `Your Skilled4U ${config.badge} code is: ${otp}. Use this code to ${config.purpose}. It expires in 10 minutes. Never share this code with anyone.`;

  // Mask raw 6-digit OTP before persisting to email_logs so OTPs can never be harvested from logs
  const maskedOtp = "******";
  const logSubject = config.subject.replace(otp, maskedOtp);
  const logText = text.replace(otp, maskedOtp);
  const logHtml = html.replaceAll(otp, maskedOtp);

  return sendAndLogEmail({
    to,
    subject: config.subject,
    logSubject,
    templateType:
      type === "sign-in"
        ? "otp_signin"
        : type === "forget-password"
          ? "password_reset"
          : "otp_verification",
    text,
    logText,
    html,
    logHtml,
    metadata: { otpMasked: maskedOtp, otpType: type },
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
  const displayName = name || "Skilled4U User";

  const html = wrapBrandedHtml({
    badge: "Account Security",
    headline: "Reset Your Skilled4U Password",
    subheadline:
      "We received a request to reset the password associated with your Skilled4U account.",
    preheader: `Hi ${displayName}, use the secure link inside to reset your Skilled4U password.`,
    headerTone: "amber",
    ctaLabel: "Reset My Password",
    ctaUrl: url,
    bodyHtml: `
      <p style="margin:0 0 14px;">Hello <strong>${escapeHtml(displayName)}</strong>,</p>
      <p style="margin:0 0 18px;color:#3b4e7a;">
        A password reset was requested for your Skilled4U account (<strong style="color:#05113d;">${escapeHtml(to)}</strong>). Click the button below to choose a new password, or enter the recovery token directly in the Skilled4U mobile app:
      </p>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:18px 0;background-color:#f6f9ff;border:1.5px solid #dbe8ff;border-radius:16px;padding:16px 20px;">
        <tr>
          <td>
            <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#5b6f9e;margin-bottom:6px;">
              App Recovery Token
            </div>
            <code style="font-family:'SFMono-Regular',Consolas,monospace;font-size:15px;font-weight:800;color:#05113d;background-color:#ffffff;padding:6px 12px;border-radius:8px;border:1px solid #b8d3ff;display:inline-block;">${token}</code>
          </td>
        </tr>
      </table>
    `,
    secondaryNoteHtml: `If the button above does not open automatically, copy and paste this link into your browser:<br /><a href="${url}" style="color:#0e46f5;word-break:break-all;">${url}</a>`,
  });

  const text = `Hello ${displayName}, reset your Skilled4U password using this link: ${url} (Token: ${token})`;
  const maskedToken = "********";

  return sendAndLogEmail({
    to,
    subject: "Reset your Skilled4U password",
    templateType: "password_reset",
    text,
    logText: text.replaceAll(token, maskedToken),
    html,
    logHtml: html.replaceAll(token, maskedToken),
    metadata: { tokenMasked: maskedToken },
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
  const displayName = name || "Skilled4U Member";

  const html = wrapBrandedHtml({
    badge: "Email Confirmation",
    headline: "Confirm Your Email Address",
    subheadline:
      "One quick click verifies your account and unlocks escrow-protected artisan bookings.",
    preheader: `Welcome ${displayName}! Confirm your Skilled4U email address to activate your account.`,
    headerTone: "blue",
    ctaLabel: "Confirm Email Address",
    ctaUrl: url,
    bodyHtml: `
      <p style="margin:0 0 14px;">Welcome <strong>${escapeHtml(displayName)}</strong>,</p>
      <p style="margin:0 0 18px;color:#3b4e7a;">
        Thank you for joining <strong>Skilled4U Nigeria</strong>. Please confirm your email address (<strong style="color:#05113d;">${escapeHtml(to)}</strong>) by clicking the button below so we can activate your profile and escrow protection:
      </p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f6f9ff;border:1.5px solid #dbe8ff;border-radius:16px;padding:16px 20px;">
        <tr>
          <td style="font-size:13px;color:#3b4e7a;">
            <strong style="color:#05113d;">What unlocks after verification:</strong>
            <ul style="margin:8px 0 0;padding-left:18px;color:#3b4e7a;">
              <li>Instant booking of NIN-verified artisans in Abuja &amp; Lagos</li>
              <li>100% 90/10 Escrow payment protection on every job</li>
              <li>Real-time dispatch notifications and digital receipts</li>
            </ul>
          </td>
        </tr>
      </table>
    `,
    secondaryNoteHtml: `Or copy and paste this confirmation URL into your browser:<br /><a href="${url}" style="color:#0e46f5;word-break:break-all;">${url}</a>`,
  });

  const text = `Welcome ${displayName}! Confirm your Skilled4U email address: ${url}`;

  return sendAndLogEmail({
    to,
    subject: "Confirm your Skilled4U email address",
    templateType: "verification_link",
    text,
    html,
    metadata: { url, token },
  });
}

export interface WelcomeEmailParams {
  to: string;
  name: string;
  role?: "admin" | "client" | "customer" | "artisan";
  city?: string;
  trade?: string;
  adminRoleTitle?: string;
  temporaryPassword?: string;
}

/**
 * 4. Role-Specific Welcome & Onboarding Confirmation Email
 * Supports Customer (`client` / `customer`), Artisan Pro (`artisan`), and Administrator (`admin`) welcome emails.
 */
export async function sendWelcomeOnboardingEmail({
  to,
  name,
  role = "client",
  city,
  trade,
  adminRoleTitle,
  temporaryPassword,
}: WelcomeEmailParams) {
  const cleanName = (name || "Valued Member").trim();
  const resolvedCity = city || "Abuja & Lagos";

  if (role === "artisan") {
    const resolvedTrade = trade || "Skilled Trade Specialist";
    const html = wrapBrandedHtml({
      badge: "Artisan Pro Welcome",
      headline: `Welcome to Skilled4U Pros, ${escapeHtml(cleanName)}!`,
      subheadline: `Your Artisan Pro profile for ${escapeHtml(resolvedTrade)} in ${escapeHtml(resolvedCity)} is registered. Let's get you verified for live dispatch and 90% instant payouts.`,
      preheader: `Welcome to Skilled4U Artisan Pros, ${cleanName}! Complete your KYC to start receiving verified jobs in ${resolvedCity}.`,
      headerTone: "ink",
      ctaLabel: "Open Artisan Pro Portal",
      ctaUrl: `${APP_BASE_URL}/artisans`,
      bodyHtml: `
        <p style="margin:0 0 16px;">Hello <strong>${escapeHtml(cleanName)}</strong>,</p>
        <p style="margin:0 0 20px;color:#3b4e7a;">
          Welcome to Nigeria's most trusted network of verified professionals! Your <strong>${escapeHtml(resolvedTrade)}</strong> profile serving <strong>${escapeHtml(resolvedCity)}</strong> has been created on Skilled4U.
        </p>

        <!-- Artisan Profile Summary Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 22px;background:linear-gradient(180deg,#f6f9ff 0%,#edf3ff 100%);background-color:#f6f9ff;border:2px solid #b8d3ff;border-radius:20px;padding:18px 22px;">
          <tr>
            <td>
              <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#0e46f5;margin-bottom:10px;">
                Artisan Pro Dossier Summary
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:13px;color:#05113d;">
                <tr>
                  <td style="padding:4px 0;color:#5b6f9e;width:42%;">Specialist Name:</td>
                  <td style="padding:4px 0;font-weight:800;">${escapeHtml(cleanName)}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;color:#5b6f9e;">Primary Trade:</td>
                  <td style="padding:4px 0;font-weight:800;color:#0e46f5;">${escapeHtml(resolvedTrade)}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;color:#5b6f9e;">Dispatch Zone:</td>
                  <td style="padding:4px 0;font-weight:700;">${escapeHtml(resolvedCity)}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;color:#5b6f9e;">Escrow Payout Split:</td>
                  <td style="padding:4px 0;font-weight:800;color:#059669;">90% Artisan Payout · Instant NUBAN Settlement</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- 5-Step Onboarding Roadmap -->
        <div style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:#05113d;margin-bottom:12px;">
          Your 5-Step Pro Onboarding Checklist
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:20px;border:1.5px solid #dbe8ff;border-radius:18px;overflow:hidden;">
          <tr style="background-color:#ffffff;">
            <td style="padding:12px 16px;border-bottom:1px solid #edf3ff;font-size:13px;">
              <span style="display:inline-block;background-color:#d1fae5;color:#065f46;font-weight:800;font-size:11px;padding:2px 8px;border-radius:999px;margin-right:8px;">STEP 1</span>
              <strong style="color:#05113d;">Account &amp; Email Verification</strong>
              <span style="float:right;color:#059669;font-weight:800;font-size:12px;">&#10003; Completed</span>
            </td>
          </tr>
          <tr style="background-color:#f8faff;">
            <td style="padding:12px 16px;border-bottom:1px solid #edf3ff;font-size:13px;">
              <span style="display:inline-block;background-color:#d1fae5;color:#065f46;font-weight:800;font-size:11px;padding:2px 8px;border-radius:999px;margin-right:8px;">STEP 2</span>
              <strong style="color:#05113d;">Trade, Skills &amp; Hourly Rate Profile</strong>
              <span style="float:right;color:#059669;font-weight:800;font-size:12px;">&#10003; Saved</span>
            </td>
          </tr>
          <tr style="background-color:#ffffff;">
            <td style="padding:12px 16px;border-bottom:1px solid #edf3ff;font-size:13px;">
              <span style="display:inline-block;background-color:#fef3c7;color:#92400e;font-weight:800;font-size:11px;padding:2px 8px;border-radius:999px;margin-right:8px;">STEP 3</span>
              <strong style="color:#05113d;">11-Digit NIN, Live Selfie &amp; NUBAN Bank KYC</strong>
              <span style="float:right;color:#d97706;font-weight:800;font-size:12px;">&#9203; Under Verification</span>
            </td>
          </tr>
          <tr style="background-color:#f8faff;">
            <td style="padding:12px 16px;font-size:13px;">
              <span style="display:inline-block;background-color:#dbe8ff;color:#0a35c7;font-weight:800;font-size:11px;padding:2px 8px;border-radius:999px;margin-right:8px;">STEP 4</span>
              <strong style="color:#05113d;">Live GPS Job Dispatch &amp; 90% Instant Payouts</strong>
              <span style="float:right;color:#0e46f5;font-weight:800;font-size:12px;">Unlocks Next</span>
            </td>
          </tr>
        </table>

        <p style="margin:0;font-size:13px;color:#3b4e7a;">
          Once our Trust &amp; KYC desk verifies your 11-digit NIN and 10-digit NUBAN settlement account, your profile will go live for immediate customer dispatch across <strong>${escapeHtml(resolvedCity)}</strong>.
        </p>
      `,
    });

    return sendAndLogEmail({
      to,
      subject: `Welcome to Skilled4U Artisan Pros, ${cleanName}!`,
      templateType: "welcome_artisan",
      text: `Welcome to Skilled4U Artisan Pros, ${cleanName}! Your ${resolvedTrade} profile in ${resolvedCity} is registered and awaiting KYC approval for live dispatch and 90% instant escrow payouts.`,
      html,
      metadata: { role: "artisan", city: resolvedCity, trade: resolvedTrade },
    });
  }

  if (role === "admin") {
    const resolvedTitle = adminRoleTitle || "Operations Administrator";
    const tempBlockHtml = temporaryPassword
      ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;padding:20px;border-radius:18px;background:linear-gradient(180deg,#eff5ff 0%,#dbe8ff 100%);background-color:#eff5ff;border:2px dashed #0e46f5;">
          <tr>
            <td>
              <div style="font-size:11px;font-weight:800;color:#0a35c7;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">
                &#128273; Temporary First-Login Password
              </div>
              <div style="display:inline-block;background-color:#ffffff;border:1.5px solid #80b2ff;border-radius:10px;padding:8px 16px;">
                <code style="font-family:'SFMono-Regular',Consolas,monospace;font-size:18px;font-weight:900;color:#05113d;letter-spacing:0.05em;">${temporaryPassword}</code>
              </div>
              <p style="margin:10px 0 0;font-size:12px;line-height:1.5;color:#3b4e7a;">
                <strong>Mandatory Security Policy:</strong> On your first sign-in, you will verify a 6-digit Email OTP and be required to rotate this temporary password to a personal password.
              </p>
            </td>
          </tr>
        </table>`
      : "";

    const html = wrapBrandedHtml({
      badge: "Admin Operations Console",
      headline: `Welcome to the Admin Team, ${escapeHtml(cleanName)}!`,
      subheadline: `Your Skilled4U Web Administrator account has been provisioned with ${escapeHtml(resolvedTitle)} clearance.`,
      preheader: `Administrator access provisioned for ${cleanName} (${resolvedTitle}) on the Skilled4U Console.`,
      headerTone: "ink",
      ctaLabel: "Sign In to Admin Console",
      ctaUrl: `${APP_BASE_URL}/login`,
      bodyHtml: `
        <p style="margin:0 0 14px;">Hello <strong>${escapeHtml(cleanName)}</strong>,</p>
        <p style="margin:0 0 18px;color:#3b4e7a;">
          A Super Administrator has provisioned your official <strong>Skilled4U Web Admin Console</strong> account with the role <strong style="color:#0e46f5;">${escapeHtml(resolvedTitle)}</strong>.
        </p>

        ${tempBlockHtml}

        <!-- Security Clearance Summary -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:18px 0;background-color:#f6f9ff;border:1.5px solid #dbe8ff;border-radius:16px;padding:16px 20px;">
          <tr>
            <td style="font-size:13px;color:#3b4e7a;">
              <strong style="color:#05113d;display:block;margin-bottom:8px;">Admin Security &amp; Sign-In Protocol:</strong>
              <ol style="margin:0;padding-left:18px;line-height:1.7;">
                <li>Open the <a href="${APP_BASE_URL}/login" style="color:#0e46f5;font-weight:700;text-decoration:none;">Skilled4U Admin Login Portal</a> and enter your email and password.</li>
                <li>Enter the <strong>6-digit Email OTP</strong> sent to your inbox to complete mandatory 2-Step MFA.</li>
                <li>Sessions automatically lock after <strong>30 minutes of inactivity</strong> (8-hour maximum shift duration).</li>
              </ol>
            </td>
          </tr>
        </table>
      `,
    });

    const text = temporaryPassword
      ? `Welcome ${cleanName}, your Skilled4U Admin Portal account (${resolvedTitle}) is provisioned. Temporary password: ${temporaryPassword} (you must rotate this password after 6-digit Email OTP verification on first sign-in).`
      : `Welcome ${cleanName}, your Skilled4U Admin Portal account (${resolvedTitle}) is now active.`;

    const maskedTemp = "********";
    return sendAndLogEmail({
      to,
      subject: `Welcome to Skilled4U Admin Console — ${resolvedTitle} Access Active`,
      templateType: "welcome_admin",
      text,
      logText: temporaryPassword
        ? text.replaceAll(temporaryPassword, maskedTemp)
        : text,
      html,
      logHtml: temporaryPassword
        ? html.replaceAll(temporaryPassword, maskedTemp)
        : html,
      metadata: {
        role: "admin",
        adminRoleTitle: resolvedTitle,
        mustChangePassword: Boolean(temporaryPassword),
        ...(temporaryPassword ? { temporaryPasswordMasked: maskedTemp } : {}),
      },
    });
  }

  // Default: Customer / Client Welcome Email (`role === "client"` or `"customer"`)
  const html = wrapBrandedHtml({
    badge: "Welcome to Skilled4U",
    headline: `Welcome to Skilled4U, ${escapeHtml(cleanName)}!`,
    subheadline: `Your account is active and ready to book vetted, NIN-verified artisans across ${escapeHtml(resolvedCity)} with 100% escrow protection.`,
    preheader: `Welcome to Skilled4U, ${cleanName}! Book verified plumbers, AC technicians, electricians & carpenters in ${resolvedCity}.`,
    headerTone: "blue",
    ctaLabel: "Explore Verified Artisans",
    ctaUrl: `${APP_BASE_URL}/artisans`,
    bodyHtml: `
      <p style="margin:0 0 14px;">Hello <strong>${escapeHtml(cleanName)}</strong>,</p>
      <p style="margin:0 0 20px;color:#3b4e7a;">
        We're thrilled to welcome you to <strong>Skilled4U Nigeria</strong>! Whether you need an urgent A.C gas refill, solar inverter diagnostics, plumbing repair, or custom carpentry in <strong>${escapeHtml(resolvedCity)}</strong>, Skilled4U connects you with background-checked professionals in minutes.
      </p>

      <!-- Customer Account Profile Card -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 22px;background:linear-gradient(180deg,#f6f9ff 0%,#edf3ff 100%);background-color:#f6f9ff;border:2px solid #b8d3ff;border-radius:20px;padding:18px 22px;">
        <tr>
          <td>
            <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#0e46f5;margin-bottom:8px;">
              Your Skilled4U Account Summary
            </div>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:13px;color:#05113d;">
              <tr>
                <td style="padding:4px 0;color:#5b6f9e;width:40%;">Member Name:</td>
                <td style="padding:4px 0;font-weight:800;">${escapeHtml(cleanName)}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#5b6f9e;">Dispatch Neighbourhood:</td>
                <td style="padding:4px 0;font-weight:800;color:#0e46f5;">${escapeHtml(resolvedCity)}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#5b6f9e;">Payment Protection:</td>
                <td style="padding:4px 0;font-weight:800;color:#059669;">&#128274; 100% Escrow Protected</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- How Skilled4U Protects Every Booking (3 Visual Steps) -->
      <div style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:#05113d;margin-bottom:12px;">
        How Skilled4U Protects Every Booking
      </div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:18px;">
        <tr>
          <td style="padding:12px 16px;background-color:#f8faff;border:1.5px solid #dbe8ff;border-radius:14px;">
            <strong style="color:#0e46f5;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">01 · Pick a Verified Specialist</strong>
            <div style="font-size:13px;color:#3b4e7a;margin-top:3px;">
              Every artisan on Skilled4U passes mandatory 11-digit NIN verification, live selfie checks, and trade vetting before appearing in your area.
            </div>
          </td>
        </tr>
        <tr><td style="height:8px;font-size:1px;line-height:1px;">&nbsp;</td></tr>
        <tr>
          <td style="padding:12px 16px;background-color:#f8faff;border:1.5px solid #dbe8ff;border-radius:14px;">
            <strong style="color:#0e46f5;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">02 · Fund Secure Escrow</strong>
            <div style="font-size:13px;color:#3b4e7a;margin-top:3px;">
              Your payment is held safely in Skilled4U Escrow while your artisan travels to your doorstep with live ETA updates.
            </div>
          </td>
        </tr>
        <tr><td style="height:8px;font-size:1px;line-height:1px;">&nbsp;</td></tr>
        <tr>
          <td style="padding:12px 16px;background-color:#f8faff;border:1.5px solid #dbe8ff;border-radius:14px;">
            <strong style="color:#0e46f5;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">03 · Approve When Satisfied</strong>
            <div style="font-size:13px;color:#3b4e7a;margin-top:3px;">
              Funds are only released to your artisan after you inspect the completed job and tap <strong>Approve &amp; Release</strong>.
            </div>
          </td>
        </tr>
      </table>
    `,
    secondaryNoteHtml: `Need help scheduling a technician or have a special request? Simply reply to this email and our Abuja &amp; Lagos concierge team will assist you right away.`,
  });

  return sendAndLogEmail({
    to,
    subject: `Welcome to Skilled4U, ${cleanName}!`,
    templateType: "welcome_customer",
    text: `Welcome to Skilled4U, ${cleanName}! Your Customer account in ${resolvedCity} is active and ready to book NIN-verified artisans with 100% escrow protection.`,
    html,
    metadata: { role: "client", city: resolvedCity },
  });
}

/**
 * Alias for `sendWelcomeOnboardingEmail` so callers can invoke `sendWelcomeEmail(...)` directly.
 */
export const sendWelcomeEmail = sendWelcomeOnboardingEmail;

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
    ? "KYC Approved: You Are Live for Dispatch!"
    : isRejected
      ? "KYC Update: Additional Verification Needed"
      : "Your KYC Credentials Are in Review";

  const subheadline = isVerified
    ? `Congratulations ${name}! Your 11-digit NIN and NUBAN settlement account have been verified by our Trust & Safety desk.`
    : isRejected
      ? `Our Trust & KYC team reviewed your submission for ${trade} and requires a quick update before activating live dispatch.`
      : `Our Trust & KYC team has received your identity and bank credentials and is completing verification.`;

  const statusBodyHtml = isVerified
    ? `
      <p style="margin:0 0 16px;">Hello <strong>${escapeHtml(name)}</strong> (<strong>${escapeHtml(trade)}</strong>),</p>
      <p style="margin:0 0 20px;color:#3b4e7a;">
        Great news! Our Trust &amp; Safety team has verified your <strong>11-digit NIN</strong>, live selfie, and <strong>NUBAN settlement bank account</strong>. Your Artisan Pro profile now carries the <strong>Verified Pro Badge</strong>.
      </p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#ecfdf5;border:2px solid #6ee7b7;border-radius:18px;padding:18px 20px;margin-bottom:18px;">
        <tr>
          <td style="font-size:13px;color:#065f46;">
            <strong style="font-size:14px;display:block;margin-bottom:8px;">&#9989; Unlocked on Your Artisan Account:</strong>
            <ul style="margin:0;padding-left:18px;line-height:1.7;">
              <li><strong>Live Customer Job Dispatches</strong> in your neighbourhood</li>
              <li><strong>90% Instant Escrow Payouts</strong> settled directly to your NUBAN account</li>
              <li><strong>NIN-Verified Shield</strong> displayed on your public artisan card</li>
            </ul>
          </td>
        </tr>
      </table>
    `
    : isRejected
      ? `
      <p style="margin:0 0 16px;">Hello <strong>${escapeHtml(name)}</strong> (<strong>${escapeHtml(trade)}</strong>),</p>
      <p style="margin:0 0 18px;color:#3b4e7a;">
        We were unable to complete verification for your submitted KYC documents. Please review the moderator feedback below and re-submit clear credentials in the Skilled4U Artisan App:
      </p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#fffbeb;border:2px solid #fcd34d;border-radius:18px;padding:18px 20px;margin-bottom:18px;">
        <tr>
          <td style="font-size:13px;color:#92400e;">
            <strong style="font-size:12px;text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:6px;">&#9888; KYC Moderator Feedback:</strong>
            <div style="font-size:14px;font-weight:700;color:#78350f;">
              ${escapeHtml(note || "Please open the Skilled4U Artisan mobile app and re-upload a clear live selfie and unblurred government ID / NIN slip.")}
            </div>
          </td>
        </tr>
      </table>
    `
      : `
      <p style="margin:0 0 16px;">Hello <strong>${escapeHtml(name)}</strong> (<strong>${escapeHtml(trade)}</strong>),</p>
      <p style="margin:0 0 16px;color:#3b4e7a;">
        Your 11-digit NIN, live selfie, government ID document, and NUBAN bank details are currently queued for verification by our operations team. We will notify you by email as soon as your dispatch status is activated.
      </p>
    `;

  const html = wrapBrandedHtml({
    badge: `KYC Status · ${kycStatus.toUpperCase()}`,
    headline,
    subheadline,
    preheader: `${headline} — Skilled4U Artisan Pro KYC update for ${name}.`,
    headerTone: isVerified ? "emerald" : isRejected ? "amber" : "blue",
    ctaLabel: isVerified
      ? "View Your Live Artisan Profile"
      : isRejected
        ? "Update KYC Credentials"
        : "Visit Skilled4U Portal",
    ctaUrl: `${APP_BASE_URL}/artisans`,
    bodyHtml: statusBodyHtml,
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
