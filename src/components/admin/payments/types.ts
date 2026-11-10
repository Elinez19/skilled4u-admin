import type { PaymentRow } from "@/db/schema";

export type EscrowFilter = "all" | "held" | "released" | "pending";
export type PaymentChannel = "card" | "bank_transfer" | "mobile_money" | "usdt";
export type EscrowStateOption = "held" | "released" | "pending" | "refunded";

export interface PaymentFormData {
  editingId: string | null;
  editingRef: string | null;
  clientName: string;
  clientEmail: string;
  artisanName: string;
  amount: string;
  paymentMethod: PaymentChannel;
  escrowStatus: EscrowStateOption;
}

