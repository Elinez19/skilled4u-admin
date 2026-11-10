"use client";

import { useMemo, useState } from "react";
import type { BlogCategoryId, WhatsNewItem } from "@/content/landing";

export interface UseBlogCatalogParams {
  items: readonly WhatsNewItem[];
  initialCategory?: BlogCategoryId;
  initialPageSize?: number;
}

export interface UseBlogCatalogReturn {
  activeCategoryId: BlogCategoryId;
  setActiveCategoryId: (cat: BlogCategoryId) => void;
  showAll: boolean;
  setShowAll: React.Dispatch<React.SetStateAction<boolean>>;
  filteredItems: readonly WhatsNewItem[];
  visibleItems: readonly WhatsNewItem[];
}

export function useBlogCatalog({
  items,
  initialCategory = "all",
  initialPageSize = 3,
}: UseBlogCatalogParams): UseBlogCatalogReturn {
  const [activeCategoryId, setActiveCategoryId] =
    useState<BlogCategoryId>(initialCategory);
  const [showAll, setShowAll] = useState(false);

  const filteredItems = useMemo(() => {
    if (activeCategoryId === "all") {
      return items;
    }
    return items.filter((item) => item.categoryId === activeCategoryId);
  }, [activeCategoryId, items]);

  const visibleItems = useMemo(() => {
    if (activeCategoryId === "all" && !showAll) {
      return filteredItems.slice(0, initialPageSize);
    }
    return filteredItems;
  }, [activeCategoryId, showAll, filteredItems, initialPageSize]);

  return {
    activeCategoryId,
    setActiveCategoryId,
    showAll,
    setShowAll,
    filteredItems,
    visibleItems,
  };
}

