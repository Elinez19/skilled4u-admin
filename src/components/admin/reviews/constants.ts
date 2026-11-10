import type { RatingString, ReviewModerationStatus, ReviewRecord } from "./types";

export const INITIAL_REVIEWS: ReviewRecord[] = [
  {
    id: "rev_1",
    clientName: "Amina Bello",
    artisanName: "Emeka Okafor",
    serviceTitle: "Emergency Pipe Leak & Heater Installation",
    rating: 5,
    comment:
      "Arrived in Wuse II within 25 minutes and fixed the burst pipe cleanly. Escrow release was seamless.",
    status: "verified",
    createdAt: "Today, 9:40 AM",
  },
  {
    id: "rev_2",
    clientName: "Tunde Bakare",
    artisanName: "Chukwudi Eze",
    serviceTitle: "Split A.C Gas Refill & Coil Wash",
    rating: 5,
    comment:
      "Super professional technician. Both units in Lekki Phase 1 are cooling like brand new.",
    status: "verified",
    createdAt: "Yesterday",
  },
  {
    id: "rev_3",
    clientName: "Ngozi Okonkwo",
    artisanName: "Ibrahim Musa",
    serviceTitle: "Custom TV Console & Wall Mounting",
    rating: 4,
    comment:
      "Neat carpentry finish and hidden cable routing. Highly recommended.",
    status: "pending",
    createdAt: "Nov 06, 2026",
  },
];

export const RATING_OPTIONS: ReadonlyArray<{
  id: RatingString;
  label: string;
}> = [
  { id: "5", label: "5.0 ★ Excellent" },
  { id: "4", label: "4.0 ★ Very Good" },
  { id: "3", label: "3.0 ★ Good" },
  { id: "2", label: "2.0 ★ Fair" },
  { id: "1", label: "1.0 ★ Poor" },
] as const;

export const MODERATION_STATUS_OPTIONS: ReadonlyArray<{
  id: ReviewModerationStatus;
  label: string;
}> = [
  { id: "verified", label: "Verified & Published" },
  { id: "pending", label: "Pending Moderation" },
  { id: "rejected", label: "Flagged / Hidden" },
] as const;

