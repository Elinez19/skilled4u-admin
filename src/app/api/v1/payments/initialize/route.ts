import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments } from "@/db/schema";
import {
  initializeBachsPayment,
  type BachsCurrency,
  type BachsPaymentMethod,
} from "@/lib/bachs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bookingId,
      clientName,
      clientEmail,
      artisanId,
      artisanName,
      amount,
      currency = "NGN",
      paymentMethod = "card",
    } = body;

    if (!amount || !clientEmail || !clientName || !artisanName) {
      return NextResponse.json(
        {
          error:
            "amount, clientName, clientEmail, and artisanName are required",
        },
        { status: 400 }
      );
    }

    const reference = `BCHS-S4U-${Date.now().toString().slice(-6)}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const bachsResult = await initializeBachsPayment({
      amount: Number(amount),
      currency: currency as BachsCurrency,
      customerEmail: clientEmail,
      customerName: clientName,
      reference,
      callbackUrl: `${appUrl}/admin/payments`,
      paymentMethods: [paymentMethod as BachsPaymentMethod],
      metadata: {
        bookingId,
        artisanId,
        artisanName,
      },
    });

    const [createdPayment] = await db
      .insert(payments)
      .values({
        id: `pay_${Date.now()}`,
        reference,
        bachsTransactionId: bachsResult.data.transactionId,
        bookingId: bookingId || null,
        clientName,
        clientEmail,
        artisanId: artisanId || null,
        artisanName,
        amount: Number(amount),
        platformFee: bachsResult.data.platformFee,
        artisanPayout: bachsResult.data.artisanPayout,
        currency,
        paymentMethod,
        status: "escrowed",
        escrowStatus: "held",
        checkoutUrl: bachsResult.data.checkoutUrl,
        paidAt: new Date(),
      })
      .returning();

    return NextResponse.json(
      {
        data: createdPayment,
        checkout: bachsResult.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/v1/payments/initialize error:", error);
    return NextResponse.json(
      { error: "Failed to initialize Bachs.io payment" },
      { status: 500 }
    );
  }
}

