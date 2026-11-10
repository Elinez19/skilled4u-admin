import type { PolicyGroup, PolicySettingItem, PolicyStatus } from "./types";

export const INITIAL_POLICIES: PolicySettingItem[] = [
  {
    id: "pol_1",
    keyCode: "ESCROW_COMMISSION_SPLIT",
    title: "Booking Escrow Commission Split (Artisan / Platform)",
    category: "financials",
    value: "90% / 10%",
    defaultValue: "90% / 10%",
    description:
      "Artisans receive 90% upon customer completion sign-off; 10% platform service fee.",
    status: "active",
    updatedAt: "Active policy",
  },
  {
    id: "pol_2",
    keyCode: "MAX_DISPATCH_RADIUS_KM",
    title: "Maximum Artisan Dispatch Radius",
    category: "dispatch",
    value: "15 km",
    defaultValue: "15 km",
    description:
      "Maximum distance for automatic pro matching across Abuja and Lagos zones.",
    status: "active",
    updatedAt: "Active policy",
  },
  {
    id: "pol_3",
    keyCode: "DISPUTE_HOLD_WINDOW",
    title: "Customer Escrow Dispute Protection Window",
    category: "governance",
    value: "48 Hours",
    defaultValue: "48 Hours",
    description:
      "Window after service completion during which customers can request arbitration.",
    status: "active",
    updatedAt: "Active policy",
  },
  {
    id: "pol_4",
    keyCode: "MANDATORY_NIN_NUBAN_KYC",
    title: "Mandatory Artisan NIN & Bank Account Verification",
    category: "governance",
    value: "Required before payout",
    defaultValue: "Required before payout",
    description:
      "Requires verified NIN and NUBAN settlement account before escrow release.",
    status: "active",
    updatedAt: "Active policy",
  },
];

export const POLICY_CATEGORY_OPTIONS: ReadonlyArray<{
  id: PolicyGroup;
  label: string;
}> = [
  { id: "financials", label: "Financials & Fees" },
  { id: "dispatch", label: "Dispatch & SLA" },
  { id: "governance", label: "User & KYC Governance" },
] as const;

export const POLICY_STATUS_OPTIONS: ReadonlyArray<{
  id: PolicyStatus;
  label: string;
}> = [
  { id: "active", label: "Active Policy" },
  { id: "pending", label: "Paused / Draft" },
] as const;

