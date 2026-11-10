import type { DisputeItem, DisputeStatus } from "./types";

export const INITIAL_DISPUTES: DisputeItem[] = [
  {
    id: "dsp_1",
    caseCode: "DSP-9041",
    bookingCode: "S4U-8821",
    clientName: "Chidinma Nwosu",
    artisanName: "Emeka Okafor",
    serviceTitle: "Pumping Machine & Tank Valve Replacement",
    escrowAmount: 28000,
    reason: "Secondary pressure valve requires follow-up calibration.",
    status: "disputed",
    createdAt: "Today, 11:20 AM",
  },
  {
    id: "dsp_2",
    caseCode: "DSP-9038",
    bookingCode: "S4U-8794",
    clientName: "Ibrahim Danjuma",
    artisanName: "Musa Abdullahi",
    serviceTitle: "Split A.C Compressor & Gas Refill",
    escrowAmount: 35000,
    reason: "Client requested cooling inspection before 90% release.",
    status: "held",
    createdAt: "Yesterday, 4:15 PM",
  },
  {
    id: "dsp_3",
    caseCode: "DSP-9019",
    bookingCode: "S4U-8710",
    clientName: "Toluwalase Adeyemi",
    artisanName: "Segun Adebayo",
    serviceTitle: "Custom Wardrobe & Door Hinge Alignment",
    escrowAmount: 42000,
    reason: "Resolved after on-site carpentry touch-up sign-off.",
    status: "resolved",
    createdAt: "Nov 05, 2026",
  },
];

export const DISPUTE_STATUS_OPTIONS: ReadonlyArray<{
  id: DisputeStatus;
  label: string;
}> = [
  { id: "disputed", label: "Active Dispute" },
  { id: "held", label: "Escrow Frozen" },
  { id: "resolved", label: "Resolved & Settled" },
] as const;

