import { NextRequest, NextResponse } from "next/server";
import {
  fetchReceivedEmailFromResend,
  recordInboundEmail,
  updateEmailDeliveryStatus,
  verifyResendWebhookSignature,
} from "@/lib/resend";

/**
 * POST /api/webhooks/resend
 * Resend Webhook Handler for:
 * 1. Inbound Email Receiving (`email.received` / `inbox.email.received`)
 * 2. Outbound Email Delivery Lifecycle (`email.sent`, `email.delivered`, `email.bounced`, `email.complained`, `email.failed`)
 * Persists all inbound messages and delivery updates in NeonDB `email_logs`.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    const verification = verifyResendWebhookSignature({
      rawBody,
      svixId,
      svixTimestamp,
      svixSignature,
    });

    if (!verification.verified || !verification.event) {
      return NextResponse.json(
        { error: verification.error || "Invalid Resend webhook signature" },
        { status: 400 }
      );
    }

    const event = verification.event as unknown as {
      type: string;
      created_at?: string;
      data?: Record<string, unknown>;
    };
    const eventType = event.type;
    const data = event.data || {};

    // Handle Inbound Email Receiving (`email.received` or `inbox.email.received`)
    if (
      eventType === "email.received" ||
      eventType === "inbox.email.received"
    ) {
      const emailId = String(data.email_id || data.id || "");
      const retrieved = emailId
        ? await fetchReceivedEmailFromResend(emailId)
        : null;

      const fromEmail =
        retrieved?.from ||
        String(data.from || "unknown-sender@external.com");
      const rawTo = retrieved?.to || data.to || ["support@skilled4u.ng"];
      const toEmail = Array.isArray(rawTo) ? rawTo.join(", ") : String(rawTo);
      const subject =
        retrieved?.subject || String(data.subject || "(No Subject)");
      const textBody =
        retrieved?.text ||
        (typeof data.text === "string" ? data.text : null);
      const htmlBody =
        retrieved?.html ||
        (typeof data.html === "string" ? data.html : null);

      const savedInbound = await recordInboundEmail({
        resendId: emailId || null,
        fromEmail,
        toEmail,
        subject,
        textBody,
        htmlBody,
        metadata: {
          eventType,
          messageId: retrieved?.message_id || data.message_id || null,
          attachments: retrieved?.attachments || data.attachments || [],
          receivedAt: event.created_at || new Date().toISOString(),
        },
      });

      return NextResponse.json({
        received: true,
        direction: "inbound",
        eventType,
        logId: savedInbound.id,
        from: savedInbound.fromEmail,
        to: savedInbound.toEmail,
        subject: savedInbound.subject,
      });
    }

    // Handle Outbound Delivery Status Events
    const emailId = String(data.email_id || data.id || "");
    if (eventType === "email.delivered") {
      await updateEmailDeliveryStatus(emailId, "delivered", {
        eventType,
        deliveredAt: event.created_at || new Date().toISOString(),
      });
    } else if (eventType === "email.bounced") {
      await updateEmailDeliveryStatus(emailId, "bounced", {
        eventType,
        bounce: data.bounce || null,
      });
    } else if (eventType === "email.complained") {
      await updateEmailDeliveryStatus(emailId, "complained", {
        eventType,
      });
    } else if (eventType === "email.failed") {
      await updateEmailDeliveryStatus(emailId, "failed", {
        eventType,
        failed: data.failed || null,
      });
    } else if (eventType === "email.sent") {
      await updateEmailDeliveryStatus(emailId, "sent", {
        eventType,
      });
    }

    return NextResponse.json({
      received: true,
      direction: "outbound",
      eventType,
      emailId,
    });
  } catch (error) {
    console.error("POST /api/webhooks/resend error:", error);
    return NextResponse.json(
      { error: "Failed to process Resend webhook" },
      { status: 500 }
    );
  }
}

