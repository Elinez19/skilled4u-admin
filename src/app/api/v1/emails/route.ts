import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { emailLogs } from "@/db/schema";
import { sendAndLogEmail } from "@/lib/resend";

/**
 * GET /api/v1/emails?direction=outbound|inbound
 * Lists outbound and inbound emails stored in NeonDB `email_logs`.
 */
export async function GET(req: NextRequest) {
  try {
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
    console.error("GET /api/v1/emails error:", error);
    return NextResponse.json(
      { error: "Failed to fetch email logs from NeonDB" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/emails
 * Sends a transactional email via Resend and logs it in NeonDB `email_logs`.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, text, html, replyTo, metadata } = body;

    if (!to || !subject || (!text && !html)) {
      return NextResponse.json(
        { error: "Recipient `to`, `subject`, and `text` or `html` are required" },
        { status: 400 }
      );
    }

    const result = await sendAndLogEmail({
      to: String(to).trim(),
      subject: String(subject).trim(),
      templateType: "transactional",
      text: String(text || subject),
      html:
        typeof html === "string" && html.trim()
          ? html
          : `<p>${String(text)}</p>`,
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

