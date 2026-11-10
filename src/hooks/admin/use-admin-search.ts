"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_NAV_ITEMS } from "@/components/admin/navigation/constants";
import type { AdminNavItem } from "@/components/admin/navigation/types";

export interface UseAdminSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  searchFocused: boolean;
  setSearchFocused: (focused: boolean) => void;
  searchRef: React.RefObject<HTMLDivElement | null>;
  matchingModules: ReadonlyArray<AdminNavItem>;
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  selectModule: (href: string) => void;
  clearSearch: () => void;
}

export function useAdminSearch(): UseAdminSearchReturn {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const matchingModules = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ADMIN_NAV_ITEMS;
    return ADMIN_NAV_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
    );
  }, [query]);

  const selectModule = (href: string) => {
    setSearchFocused(false);
    setQuery("");
    router.push(href);
  };

  const clearSearch = () => {
    setQuery("");
    setSearchFocused(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && matchingModules.length > 0) {
      selectModule(matchingModules[0].href);
    }
  };

  return {
    query,
    setQuery,
    searchFocused,
    setSearchFocused,
    searchRef,
    matchingModules,
    handleKeyDown,
    selectModule,
    clearSearch,
  };
}

