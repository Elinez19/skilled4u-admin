"use client";

import { useMemo, useState } from "react";
import type { FaqCategoryId, FaqCategoryTab } from "@/content/landing";

export interface UseFaqsCatalogParams {
  categories: readonly FaqCategoryTab[];
  initialCategory?: FaqCategoryId;
}

export interface UseFaqsCatalogReturn {
  activeCategoryId: FaqCategoryId;
  setActiveCategoryId: (cat: FaqCategoryId) => void;
  activeCategory: FaqCategoryTab;
}

export function useFaqsCatalog({
  categories,
  initialCategory = "customers",
}: UseFaqsCatalogParams): UseFaqsCatalogReturn {
  const [activeCategoryId, setActiveCategoryId] =
    useState<FaqCategoryId>(initialCategory);

  const activeCategory = useMemo(() => {
    return (
      categories.find((cat) => cat.id === activeCategoryId) ?? categories[0]
    );
  }, [categories, activeCategoryId]);

  return {
    activeCategoryId,
    setActiveCategoryId,
    activeCategory,
  };
}
