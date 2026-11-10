import type { BookingFormData } from "./types";

export const BOOKING_STATUS_OPTIONS = [
  { id: "pending", label: "Pending" },
  { id: "accepted", label: "Accepted" },
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
] as const;

export const PAYMENT_STATUS_OPTIONS = [
  { id: "unpaid", label: "Unpaid" },
  { id: "escrowed", label: "Escrowed" },
  { id: "released", label: "Released" },
  { id: "refunded", label: "Refunded" },
] as const;

export const DEFAULT_BOOKING_FORM: BookingFormData = {
  clientName: "Amina Bello",
  clientEmail: "amina.bello@gmail.com",
  clientPhone: "+234 809 332 1104",
  address: "14 Adetokunbo Ademola Crescent, Wuse II, Abuja",
  serviceTitle: "Split AC Gas Refill & Servicing",
  artisanName: "Emeka Okafor",
  scheduledDate: "2026-11-10",
  scheduledTime: "10:30 AM",
  agreedAmount: "18000",
  bookingStatus: "pending",
  paymentStatus: "escrowed",
};

