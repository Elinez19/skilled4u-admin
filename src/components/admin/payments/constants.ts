import type { PaymentFormData } from "./types";

export const CHANNEL_OPTIONS = [
  { id: "card", label: "Card" },
  { id: "bank_transfer", label: "Transfer" },
  { id: "mobile_money", label: "Mobile Money" },
  { id: "usdt", label: "USDT" },
] as const;

export const ESCROW_STATE_OPTIONS = [
  { id: "held", label: "Held in Escrow" },
  { id: "released", label: "Released Payout" },
  { id: "pending", label: "Pending Deposit" },
  { id: "refunded", label: "Refunded" },
] as const;

export const DEFAULT_PAYMENT_FORM: PaymentFormData = {
  editingId: null,
  editingRef: null,
  clientName: "Toluwalase Adeyemi",
  clientEmail: "tolu.adeyemi@gmail.com",
  artisanName: "Emeka Okafor",
  amount: "35000",
  paymentMethod: "card",
  escrowStatus: "held",
};

