export type PolicyCategory = "all" | "financials" | "dispatch" | "governance";
export type PolicyGroup = "financials" | "dispatch" | "governance";
export type PolicyStatus = "active" | "pending";

export interface PolicySettingItem {
  id: string;
  keyCode: string;
  title: string;
  category: PolicyGroup;
  value: string;
  defaultValue: string;
  description: string;
  status: PolicyStatus;
  updatedAt: string;
}

export interface PolicySettingFormData {
  editingId: string | null;
  policyTitle: string;
  policyKeyCode: string;
  policyValue: string;
  policyDescription: string;
  policyCategory: PolicyGroup;
  policyStatus: PolicyStatus;
}

export interface GlobalMarketplaceParameters {
  platformFeePercent: string;
  artisanSharePercent: string;
  dispatchRadiusKm: string;
  disputeWindowHours: string;
  supportEmail: string;
  supportPhone: string;
}

