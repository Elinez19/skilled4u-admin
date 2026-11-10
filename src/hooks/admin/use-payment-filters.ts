"use client";

import { useMemo, useState } from "react";
import type { PaymentRow } from "@/db/schema";
import type { AdminTabOption } from "@/components/admin/ui/admin-segmented-tabs";
import type { EscrowFilter } from "@/components/admin/payments/types";

export interface UsePaymentFiltersReturn {
  filter: EscrowFilter;
  setFilter: (f: EscrowFilter) => void;
  search: string;
  setSearch: (s: string) => void;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  tabOptions: ReadonlyArray<AdminTabOption<EscrowFilter>>;
  filteredPayments: PaymentRow[];
  toggleSelectAll: () => void;
  toggleSelectOne: (id: string) => void;
  clearSelection: () => void;
}

export function usePaymentFilters(
  items: PaymentRow[]
): UsePaymentFiltersReturn {
  const [filter, setFilter] = useState<EscrowFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const tabOptions = useMemo<ReadonlyArray<AdminTabOption<EscrowFilter>>>(
    () => [
      { id: "all", label: "All Transactions", count: items.length },
      {
        id: "held",
        label: "Held in Escrow",
        count: items.filter((p) => p.escrowStatus === "held").length,
      },
      {
        id: "released",
        label: "Released",
        count: items.filter((p) => p.escrowStatus === "released").length,
      },
      {
        id: "pending",
        label: "Pending",
        count: items.filter((p) => p.escrowStatus === "pending").length,
      },
    ],
    [items]
  );

  const filteredPayments = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((p) => {
      const matchesStatus = filter === "all" || p.escrowStatus === filter;
      const matchesSearch =
        !q ||
        p.reference.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.artisanName.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [items, filter, search]);

  const toggleSelectAll = () => {
    if (
      filteredPayments.length > 0 &&
      filteredPayments.every((p) => selectedIds.includes(p.id))
    ) {
      const fIds = new Set(filteredPayments.map((p) => p.id));
      setSelectedIds((prev) => prev.filter((id) => !fIds.has(id)));
    } else {
      setSelectedIds((prev) => [
        ...prev,
        ...filteredPayments
          .filter((p) => !prev.includes(p.id))
          .map((p) => p.id),
      ]);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  return {
    filter,
    setFilter,
    search,
    setSearch,
    selectedIds,
    setSelectedIds,
    tabOptions,
    filteredPayments,
    toggleSelectAll,
    toggleSelectOne,
    clearSelection,
  };
}

