export type DisputeFilter = "all" | "disputed" | "held" | "resolved";
export type DisputeStatus = "disputed" | "held" | "resolved";

export interface DisputeItem {
  id: string;
  caseCode: string;
  bookingCode: string;
  clientName: string;
  artisanName: string;
  serviceTitle: string;
  escrowAmount: number;
  reason: string;
  status: DisputeStatus;
  createdAt: string;
}

export interface DisputeFormData {
  editingId: string | null;
  editingCaseCode: string | null;
  bookingCode: string;
  clientName: string;
  artisanName: string;
  serviceTitle: string;
  escrowAmount: string;
  status: DisputeStatus;
  reason: string;
}

