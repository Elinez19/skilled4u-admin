import type { CategoryRow } from "@/db/schema";
import type { BookableServiceRecord, CategoryFormData } from "./types";

export const FORM_ENTITY_OPTIONS = [
  { id: "category", label: "Service Category" },
  { id: "service", label: "Bookable Service" },
] as const;

export const VISIBILITY_OPTIONS = [
  { id: "active", label: "Active in Catalog" },
  { id: "hidden", label: "Hidden / Draft" },
] as const;

export const SLA_OPTIONS = [
  { id: "Express 30m", label: "Express 30m" },
  { id: "Same-Day", label: "Same-Day" },
  { id: "Scheduled", label: "Scheduled" },
] as const;

export function buildInitialServices(
  categories: CategoryRow[]
): BookableServiceRecord[] {
  const list: BookableServiceRecord[] = [];
  categories.forEach((cat, cIdx) => {
    const subs =
      cat.subServices && cat.subServices.length > 0
        ? cat.subServices
        : [`${cat.title} Inspection & Servicing`];
    subs.forEach((sub, sIdx) => {
      list.push({
        id: `srv_${cat.id}_${sIdx}`,
        title: sub,
        categoryId: cat.id,
        categoryTitle: cat.title,
        price: cat.basePrice + sIdx * 2500,
        duration: sIdx % 2 === 0 ? "45 - 60 mins" : "60 - 90 mins",
        dispatchSla:
          (cIdx + sIdx) % 3 === 0
            ? "Express 30m"
            : (cIdx + sIdx) % 2 === 0
              ? "Same-Day"
              : "Scheduled",
        status: cat.isActive ? "active" : "hidden",
      });
    });
  });
  return list;
}

export const DEFAULT_CATEGORY_FORM: CategoryFormData = {
  formMode: "category",
  editingId: null,
  title: "",
  description: "",
  basePrice: "15000",
  subServices: "Solar Panel Cleaning, Inverter Battery Check, Surge Protection",
  categoryVisibility: "active",
  serviceTitle: "",
  serviceCategoryId: "",
  servicePrice: "18000",
  serviceDuration: "45 - 60 mins",
  serviceSla: "Express 30m",
  serviceStatus: "active",
};

