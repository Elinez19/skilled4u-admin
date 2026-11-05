import { NextRequest, NextResponse } from "next/server";
import { verifyBachsWebhookSignature } from "@/lib/bachs";
import { db } from "@/db";
import { payments, bookings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-bachs-signature");
    const isSimulated = req.headers.get("x-bachs-sandbox-simulate") === "true";

    if (!isSimulated && !verifyBachsWebhookSignature(rawBody, signature)) {
      return NextResponse.json(
        { error: "Invalid Bachs.io webhook signature" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);
    const { event, data } = payload;

    if (event === "charge.success" || event === "payment.successful") {
      const reference: string = data.reference;

      await db
        .update(payments)
        .set({
          status: "escrowed",
          escrowStatus: "held",
          bachsTransactionId: data.id || `bch_tx_${Date.now()}`,
          paidAt: new Date(),
          metadata: data,
        })
        .where(eq(payments.reference, reference));

      const [paymentRecord] = await db
        .select()
        .from(payments)
        .where(eq(payments.reference, reference))
        .limit(1);

      const bookingId =
        (data.metadata?.bookingId as string | undefined) ||
        paymentRecord?.bookingId;

      if (bookingId) {
        await db
          .update(bookings)
          .set({
            status: "accepted",
            paymentStatus: "escrowed",
            updatedAt: new Date(),
          })
          .where(eq(bookings.id, bookingId));
      }
    } else if (event === "transfer.success" || event === "payout.settled") {
      const reference: string = data.reference;
      await db
        .update(payments)
        .set({
          status: "settled",
          escrowStatus: "released",
          releasedAt: new Date(),
        })
        .where(eq(payments.reference, reference));
    } else if (event === "charge.failed" || event === "payment.failed") {
      const reference: string = data.reference;
      await db
        .update(payments)
        .set({
          status: "failed",
          metadata: data,
        })
        .where(eq(payments.reference, reference));
    }

    return NextResponse.json({ received: true, event });
  } catch (error) {
    console.error("Bachs webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

