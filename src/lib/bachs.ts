import crypto from "crypto";

const BACHS_API_BASE = process.env.BACHS_API_URL || "https://api.bachs.io/v1";

export type BachsCurrency = "NGN" | "USD" | "GHS" | "KES" | "USDT";
export type BachsPaymentMethod = "card" | "bank_transfer" | "mobile_money" | "usdt";

export interface InitializeBachsPaymentInput {
  amount: number;
  currency?: BachsCurrency;
  customerEmail: string;
  customerName: string;
  reference: string;
  callbackUrl: string;
  paymentMethods?: BachsPaymentMethod[];
  metadata?: Record<string, unknown>;
}

export interface InitializeBachsPaymentResponse {
  status: boolean;
  message: string;
  data: {
    reference: string;
    checkoutUrl: string;
    transactionId: string;
    currency: BachsCurrency;
    amount: number;
    platformFee: number;
    artisanPayout: number;
    mode: "live" | "sandbox";
  };
}

export interface InitiateBachsPayoutInput {
  amount: number;
  currency?: BachsCurrency;
  recipientName: string;
  bankName: string;
  accountNumber: string;
  reference: string;
  narration?: string;
}

/**
 * Calculates the marketplace split: 10% platform commission, 90% artisan payout
 */
export function calculateMarketplaceSplit(amount: number) {
  const platformFee = Math.round(amount * 0.1);
  const artisanPayout = amount - platformFee;
  return { platformFee, artisanPayout };
}

/**
 * Initializes a Bachs.io checkout session.
 * Automatically falls back to deterministic sandbox checkout if placeholder test keys are active.
 */
export async function initializeBachsPayment(
  input: InitializeBachsPaymentInput
): Promise<InitializeBachsPaymentResponse> {
  const secretKey = process.env.BACHS_SECRET_KEY || "";
  const currency = input.currency || "NGN";
  const { platformFee, artisanPayout } = calculateMarketplaceSplit(input.amount);

  const isPlaceholderKey =
    !secretKey || secretKey.includes("placeholder") || secretKey.startsWith("sk_test_bachs_skilled4u");

  if (isPlaceholderKey) {
    // Sandbox simulation for local development & demo testing
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return {
      status: true,
      message: "Bachs.io sandbox checkout session initialized",
      data: {
        reference: input.reference,
        checkoutUrl: `${appUrl}/admin/payments?checkout_ref=${encodeURIComponent(input.reference)}`,
        transactionId: `bch_tx_${crypto.randomBytes(6).toString("hex")}`,
        currency,
        amount: input.amount,
        platformFee,
        artisanPayout,
        mode: "sandbox",
      },
    };
  }

  const response = await fetch(`${BACHS_API_BASE}/checkout/initialize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secretKey}`,
    },
    body: JSON.stringify({
      amount: input.amount,
      currency,
      email: input.customerEmail,
      name: input.customerName,
      reference: input.reference,
      callback_url: input.callbackUrl,
      channels: input.paymentMethods || ["card", "bank_transfer", "mobile_money", "usdt"],
      metadata: {
        ...input.metadata,
        platformFee,
        artisanPayout,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "Unknown error");
    throw new Error(`Bachs.io API error (${response.status}): ${errText}`);
  }

  const result = await response.json();
  return {
    status: true,
    message: result.message || "Checkout initialized",
    data: {
      reference: input.reference,
      checkoutUrl: result.data?.checkout_url || result.data?.authorization_url,
      transactionId: result.data?.id || `bch_${input.reference}`,
      currency,
      amount: input.amount,
      platformFee,
      artisanPayout,
      mode: "live",
    },
  };
}

/**
 * Initiates an escrow payout to the artisan's bank account via Bachs.io Settlement API
 */
export async function initiateBachsArtisanPayout(input: InitiateBachsPayoutInput) {
  const secretKey = process.env.BACHS_SECRET_KEY || "";
  const isPlaceholderKey =
    !secretKey || secretKey.includes("placeholder") || secretKey.startsWith("sk_test_bachs_skilled4u");

  if (isPlaceholderKey) {
    return {
      status: true,
      payoutId: `bch_payout_${crypto.randomBytes(5).toString("hex")}`,
      reference: input.reference,
      settledAt: new Date().toISOString(),
      mode: "sandbox" as const,
    };
  }

  const response = await fetch(`${BACHS_API_BASE}/transfers/initiate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secretKey}`,
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: input.currency || "NGN",
      recipient_name: input.recipientName,
      bank_name: input.bankName,
      account_number: input.accountNumber,
      reference: input.reference,
      narration: input.narration || "Skilled4U Artisan Escrow Payout",
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "Unknown error");
    throw new Error(`Bachs.io transfer error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return {
    status: true,
    payoutId: data.data?.id || `bch_payout_${input.reference}`,
    reference: input.reference,
    settledAt: new Date().toISOString(),
    mode: "live" as const,
  };
}

/**
 * Verifies the cryptographic HMAC-SHA256 webhook signature from Bachs.io
 */
export function verifyBachsWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const webhookSecret = process.env.BACHS_WEBHOOK_SECRET;
  if (!signatureHeader || !webhookSecret) return false;

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf8"),
      Buffer.from(signatureHeader, "utf8")
    );
  } catch {
    return false;
  }
}

