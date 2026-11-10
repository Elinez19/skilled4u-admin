import type { CategoryRow } from "@/db/schema";

export type CatalogTab = "all" | "categories" | "services";
export type FormEntityMode = "category" | "service";
export type DispatchSla = "Express 30m" | "Same-Day" | "Scheduled";
export type VisibilityStatus = "active" | "hidden";

export interface BookableServiceRecord {
  id: string;
  title: string;
  categoryId: string;
  categoryTitle: string;
  price: number;
  duration: string;
  dispatchSla: DispatchSla;
  status: VisibilityStatus;
}

export interface CategoryFormData {
  formMode: FormEntityMode;
  editingId: string | null;

  // Category fields
  title: string;
  description: string;
  basePrice: string;
  subServices: string;
  categoryVisibility: VisibilityStatus;

  // Bookable Service fields
  serviceTitle: string;
  serviceCategoryId: string;
  servicePrice: string;
  serviceDuration: string;
  serviceSla: DispatchSla;
  serviceStatus: VisibilityStatus;
}

