export type ReviewFilter = "all" | "verified" | "pending";
export type ReviewModerationStatus = "verified" | "pending" | "rejected";
export type RatingString = "5" | "4" | "3" | "2" | "1";

export interface ReviewRecord {
  id: string;
  clientName: string;
  artisanName: string;
  serviceTitle: string;
  rating: number;
  comment: string;
  status: ReviewModerationStatus;
  createdAt: string;
}

export interface ReviewFormData {
  editingId: string | null;
  clientName: string;
  artisanName: string;
  serviceTitle: string;
  rating: RatingString;
  status: ReviewModerationStatus;
  comment: string;
}

