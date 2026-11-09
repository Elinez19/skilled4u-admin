import { NextRequest, NextResponse } from "next/server";
import { normalizeUserRole, requireAuth } from "@/lib/auth-guard";
import { protectMutationApi } from "@/lib/arcjet";
import { db } from "@/db";
import { payments } from "@/db/schema";
import {
  initializeBachsPayment,
  type BachsCurrency,
  type BachsPaymentMethod,
} from "@/lib/bachs";

export async function POST(req: NextRequest) {
  try {
    const blocked = await protectMutationApi(req);
    if (blocked) return blocked;

    const guard = await requireAuth(req);
    if (!guard.ok) return guard.response;

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

    const isAdmin = normalizeUserRole(guard.auth.user.role) === "admin";
    const resolvedClientName = clientName || guard.auth.user.name;
    const resolvedClientEmail =
      isAdmin && clientEmail ? clientEmail : guard.auth.user.email;

    if (!amount || !resolvedClientEmail || !resolvedClientName || !artisanName) {
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
      customerEmail: resolvedClientEmail,
      customerName: resolvedClientName,
      reference,
      callbackUrl: `${appUrl}/admin/payments`,
      paymentMethods: [paymentMethod as BachsPaymentMethod],
      metadata: {
        bookingId,
        artisanId,
        artisanName,
      },
    });

    // SECURITY FIX S8: Only mark "escrowed"/"held" immediately if an Admin creates a manual escrow entry;
    // customer checkout initializations start as "initialized" / "pending" until confirmed by webhook.
    const initialStatus = isAdmin && body.simulateEscrowed ? "escrowed" : "initialized";
    const initialEscrowStatus = isAdmin && body.simulateEscrowed ? "held" : "pending";

    const [createdPayment] = await db
      .insert(payments)
      .values({
        id: `pay_${Date.now()}`,
        reference,
        bachsTransactionId: bachsResult.data.transactionId,
        bookingId: bookingId || null,
        clientName: resolvedClientName,
        clientEmail: resolvedClientEmail,
        artisanId: artisanId || null,
        artisanName,
        amount: Number(amount),
        platformFee: bachsResult.data.platformFee,
        artisanPayout: bachsResult.data.artisanPayout,
        currency,
        paymentMethod,
        status: initialStatus,
        escrowStatus: initialEscrowStatus,
        checkoutUrl: bachsResult.data.checkoutUrl,
        paidAt: initialStatus === "escrowed" ? new Date() : null,
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
