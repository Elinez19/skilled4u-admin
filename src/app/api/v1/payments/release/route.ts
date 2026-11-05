import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments, bookings, artisans } from "@/db/schema";
import { eq } from "drizzle-orm";
import { initiateBachsArtisanPayout, type BachsCurrency } from "@/lib/bachs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json(
        { error: "paymentId is required" },
        { status: 400 }
      );
    }

    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!payment) {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
    }

    let bankName = "Access Bank";
    let accountNumber = "0148291042";

    if (payment.artisanId) {
      const [artisan] = await db
        .select()
        .from(artisans)
        .where(eq(artisans.id, payment.artisanId))
        .limit(1);

      if (artisan?.bankName) bankName = artisan.bankName;
      if (artisan?.bankAccountNumber) accountNumber = artisan.bankAccountNumber;
    }

    const payoutAmount =
      payment.artisanPayout > 0
        ? payment.artisanPayout
        : Math.round(payment.amount * 0.9);

    const payoutResult = await initiateBachsArtisanPayout({
      amount: payoutAmount,
      currency: (payment.currency as BachsCurrency) || "NGN",
      recipientName: payment.artisanName,
      bankName,
      accountNumber,
      reference: `${payment.reference}-PAYOUT`,
      narration: `Skilled4U Escrow Settlement (${payment.reference})`,
    });

    const [updatedPayment] = await db
      .update(payments)
      .set({
        status: "settled",
        escrowStatus: "released",
        releasedAt: new Date(),
      })
      .where(eq(payments.id, payment.id))
      .returning();

    if (payment.bookingId) {
      await db
        .update(bookings)
        .set({
          status: "completed",
          paymentStatus: "released",
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, payment.bookingId));
    }

    return NextResponse.json({
      data: updatedPayment,
      payout: payoutResult,
    });
  } catch (error) {
    console.error("POST /api/v1/payments/release error:", error);
    return NextResponse.json(
      { error: "Failed to release escrow via Bachs.io" },
      { status: 500 }
    );
  }
}

