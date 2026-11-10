import type { BookingRow } from "@/db/schema";

export type BookingStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

export type PaymentStatus =
  | "unpaid"
  | "escrowed"
  | "released"
  | "refunded";

export type BookingStatusFilter =
  | "all"
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed";

export interface BookingFormData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  address: string;
  serviceTitle: string;
  artisanName: string;
  scheduledDate: string;
  scheduledTime: string;
  agreedAmount: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
}

