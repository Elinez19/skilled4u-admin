"use client";

import { useMemo, useState } from "react";
import type { CategoryRow } from "@/db/schema";
import type { AdminTabOption } from "@/components/admin/ui/admin-segmented-tabs";
import type {
  BookableServiceRecord,
  CatalogTab,
} from "@/components/admin/categories/types";

export interface UseCategoryFiltersProps {
  categories: CategoryRow[];
  services: BookableServiceRecord[];
}

export interface UseCategoryFiltersReturn {
  tab: CatalogTab;
  setTab: (t: CatalogTab) => void;
  search: string;
  setSearch: (s: string) => void;
  selectedCategoryIds: string[];
  setSelectedCategoryIds: React.Dispatch<React.SetStateAction<string[]>>;
  selectedServiceIds: string[];
  setSelectedServiceIds: React.Dispatch<React.SetStateAction<string[]>>;
  tabOptions: ReadonlyArray<AdminTabOption<CatalogTab>>;
  filteredCategories: CategoryRow[];
  filteredServices: BookableServiceRecord[];
  toggleSelectAllCategories: () => void;
  toggleSelectOneCategory: (id: string) => void;
  toggleSelectAllServices: () => void;
  toggleSelectOneService: (id: string) => void;
  clearAllSelections: () => void;
}

export function useCategoryFilters({
  categories,
  services,
}: UseCategoryFiltersProps): UseCategoryFiltersReturn {
  const [tab, setTab] = useState<CatalogTab>("all");
  const [search, setSearch] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  const q = search.toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!q) return categories;
    return categories.filter(
      (cat) =>
        cat.title.toLowerCase().includes(q) ||
        (cat.description || "").toLowerCase().includes(q) ||
        cat.slug.toLowerCase().includes(q)
    );
  }, [categories, q]);

  const filteredServices = useMemo(() => {
    if (!q) return services;
    return services.filter(
      (srv) =>
        srv.title.toLowerCase().includes(q) ||
        srv.categoryTitle.toLowerCase().includes(q) ||
        srv.dispatchSla.toLowerCase().includes(q)
    );
  }, [services, q]);

  const tabOptions: ReadonlyArray<AdminTabOption<CatalogTab>> = useMemo(
    () => [
      {
        id: "all",
        label: "All Categories & Services",
        count: categories.length + services.length,
      },
      { id: "categories", label: "Categories", count: categories.length },
      { id: "services", label: "Bookable Services", count: services.length },
    ],
    [categories.length, services.length]
  );

  const toggleSelectAllCategories = () => {
    if (
      filteredCategories.length > 0 &&
      filteredCategories.every((c) => selectedCategoryIds.includes(c.id))
    ) {
      const fIds = new Set(filteredCategories.map((c) => c.id));
      setSelectedCategoryIds((prev) => prev.filter((id) => !fIds.has(id)));
    } else {
      setSelectedCategoryIds((prev) => [
        ...prev,
        ...filteredCategories
          .filter((c) => !prev.includes(c.id))
          .map((c) => c.id),
      ]);
    }
  };

  const toggleSelectOneCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllServices = () => {
    if (
      filteredServices.length > 0 &&
      filteredServices.every((s) => selectedServiceIds.includes(s.id))
    ) {
      const fIds = new Set(filteredServices.map((s) => s.id));
      setSelectedServiceIds((prev) => prev.filter((id) => !fIds.has(id)));
    } else {
      setSelectedServiceIds((prev) => [
        ...prev,
        ...filteredServices
          .filter((s) => !prev.includes(s.id))
          .map((s) => s.id),
      ]);
    }
  };

  const toggleSelectOneService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const clearAllSelections = () => {
    setSelectedCategoryIds([]);
    setSelectedServiceIds([]);
  };

  return {
    tab,
    setTab,
    search,
    setSearch,
    selectedCategoryIds,
    setSelectedCategoryIds,
    selectedServiceIds,
    setSelectedServiceIds,
    tabOptions,
    filteredCategories,
    filteredServices,
    toggleSelectAllCategories,
    toggleSelectOneCategory,
    toggleSelectAllServices,
    toggleSelectOneService,
    clearAllSelections,
  };
}

