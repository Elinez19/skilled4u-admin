import { NextRequest, NextResponse, connection } from "next/server";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-guard";
import { protectMutationApi } from "@/lib/arcjet";
import { db } from "@/db";
import { emailLogs } from "@/db/schema";
import {
  sendAndLogEmail,
  sendArtisanKycStatusEmail,
  sendWelcomeOnboardingEmail,
  wrapBrandedHtml,
} from "@/lib/resend";

/**
 * GET /api/v1/emails?direction=outbound|inbound
 * Lists outbound and inbound emails stored in `email_logs` (Admin only).
 */
export async function GET(req: NextRequest) {
  try {
    await connection();
  } catch {
    // Direct invocation outside Next.js request store
  }

  try {
    const adminGuard = await requireAdmin(req);
    if (!adminGuard.ok) return adminGuard.response;

    const { searchParams } = new URL(req.url);
    const direction = searchParams.get("direction");

    const rows = direction
      ? await db
          .select()
          .from(emailLogs)
          .where(eq(emailLogs.direction, direction))
          .orderBy(desc(emailLogs.createdAt))
          .limit(100)
      : await db
          .select()
          .from(emailLogs)
          .orderBy(desc(emailLogs.createdAt))
          .limit(100);

    return NextResponse.json({ data: rows });
  } catch (error) {
    if (
      (error as { digest?: string })?.digest === "NEXT_PRERENDER_INTERRUPTED"
    ) {
      throw error;
    }
    console.error("GET /api/v1/emails error:", error);
    return NextResponse.json(
      { error: "Failed to fetch email logs" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/emails
 * Sends a branded transactional or welcome/KYC template email via Resend and logs it in `email_logs` (Admin only).
 */
export async function POST(req: NextRequest) {
  try {
    const blocked = await protectMutationApi(req);
    if (blocked) return blocked;

    const adminGuard = await requireAdmin(req);
    if (!adminGuard.ok) return adminGuard.response;

    const body = await req.json();
    const {
      to,
      subject,
      text,
      html,
      templateType,
      name,
      role,
      city,
      trade,
      adminRoleTitle,
      temporaryPassword,
      kycStatus,
      note,
      badge,
      subheadline,
      ctaLabel,
      ctaUrl,
      replyTo,
      metadata,
    } = body;

    if (!to) {
      return NextResponse.json(
        { error: "Recipient `to` email address is required" },
        { status: 400 }
      );
    }

    const recipient = String(to).trim();

    // Support direct Welcome Email template dispatch (`templateType: "welcome" | "welcome_customer" | "welcome_artisan" | "welcome_admin"`)
    if (
      templateType === "welcome" ||
      templateType === "welcome_customer" ||
      templateType === "welcome_artisan" ||
      templateType === "welcome_admin"
    ) {
      const resolvedRole =
        templateType === "welcome_artisan"
          ? "artisan"
          : templateType === "welcome_admin"
            ? "admin"
            : role === "artisan" || role === "admin"
              ? role
              : "client";

      const welcomeResult = await sendWelcomeOnboardingEmail({
        to: recipient,
        name: String(name || recipient.split("@")[0] || "Valued Member"),
        role: resolvedRole,
        city: city ? String(city) : undefined,
        trade: trade ? String(trade) : undefined,
        adminRoleTitle: adminRoleTitle ? String(adminRoleTitle) : undefined,
        temporaryPassword: temporaryPassword
          ? String(temporaryPassword)
          : undefined,
      });

      return NextResponse.json({ data: welcomeResult }, { status: 201 });
    }

    // Support direct Artisan KYC Status Email template dispatch (`templateType: "kyc_status"`)
    if (templateType === "kyc_status") {
      const kycResult = await sendArtisanKycStatusEmail({
        to: recipient,
        name: String(name || "Skilled4U Artisan"),
        trade: String(trade || "Skilled Specialist"),
        kycStatus:
          kycStatus === "verified" || kycStatus === "rejected"
            ? kycStatus
            : "pending",
        note: note ? String(note) : undefined,
      });

      return NextResponse.json({ data: kycResult }, { status: 201 });
    }

    if (!subject || (!text && !html)) {
      return NextResponse.json(
        {
          error:
            "Recipient `to`, `subject`, and `text` or `html` are required for custom transactional emails",
        },
        { status: 400 }
      );
    }

    const cleanSubject = String(subject).trim();
    const rawHtml = typeof html === "string" ? html.trim() : "";
    const isFullDocument = /^<!doctype html/i.test(rawHtml) || /^<html/i.test(rawHtml);

    const formattedBodyHtml = rawHtml
      ? rawHtml
      : String(text || cleanSubject)
          .split(/\n{2,}/)
          .map(
            (para) =>
              `<p style="margin:0 0 14px;color:#1e293b;">${para.replaceAll("\n", "<br />")}</p>`
          )
          .join("");

    const brandedHtml = isFullDocument
      ? rawHtml
      : wrapBrandedHtml({
          badge: typeof badge === "string" && badge.trim() ? badge.trim() : "Skilled4U Official Notice",
          headline: cleanSubject,
          subheadline:
            typeof subheadline === "string" && subheadline.trim()
              ? subheadline.trim()
              : undefined,
          bodyHtml: formattedBodyHtml,
          ctaLabel:
            typeof ctaLabel === "string" && ctaLabel.trim()
              ? ctaLabel.trim()
              : undefined,
          ctaUrl:
            typeof ctaUrl === "string" && ctaUrl.trim()
              ? ctaUrl.trim()
              : undefined,
        });

    const result = await sendAndLogEmail({
      to: recipient,
      subject: cleanSubject,
      templateType: "transactional",
      text: String(text || cleanSubject),
      html: brandedHtml,
      replyTo,
      metadata,
    });

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/emails error:", error);
    return NextResponse.json(
      { error: "Failed to send transactional email" },
      { status: 500 }
    );
  }
}
