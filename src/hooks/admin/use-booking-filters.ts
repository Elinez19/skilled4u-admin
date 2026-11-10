"use client";

import { useMemo, useState } from "react";
import type { BookingRow } from "@/db/schema";
import type { AdminTabOption } from "@/components/admin/ui/admin-segmented-tabs";
import type { BookingStatusFilter } from "@/components/admin/bookings/types";

export interface UseBookingFiltersReturn {
  statusFilter: BookingStatusFilter;
  setStatusFilter: (status: BookingStatusFilter) => void;
  search: string;
  setSearch: (query: string) => void;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  toggleSelectAll: () => void;
  toggleSelectOne: (id: string) => void;
  clearSelection: () => void;
  tabOptions: ReadonlyArray<AdminTabOption<BookingStatusFilter>>;
  filteredBookings: BookingRow[];
}

export function useBookingFilters(items: BookingRow[]): UseBookingFiltersReturn {
  const [statusFilter, setStatusFilter] =
    useState<BookingStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const tabOptions = useMemo<ReadonlyArray<AdminTabOption<BookingStatusFilter>>>(
    () => [
      { id: "all", label: "All Bookings", count: items.length },
      {
        id: "pending",
        label: "Pending",
        count: items.filter((b) => b.status === "pending").length,
      },
      {
        id: "accepted",
        label: "Accepted",
        count: items.filter((b) => b.status === "accepted").length,
      },
      {
        id: "in_progress",
        label: "In Progress",
        count: items.filter((b) => b.status === "in_progress").length,
      },
      {
        id: "completed",
        label: "Completed",
        count: items.filter((b) => b.status === "completed").length,
      },
    ],
    [items]
  );

  const filteredBookings = useMemo(() => {
    return items.filter((b) => {
      const matchesStatus =
        statusFilter === "all" || b.status === statusFilter;
      const matchesSearch =
        !search ||
        b.bookingCode.toLowerCase().includes(search.toLowerCase()) ||
        b.clientName.toLowerCase().includes(search.toLowerCase()) ||
        b.artisanName.toLowerCase().includes(search.toLowerCase()) ||
        b.serviceTitle.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [items, search, statusFilter]);

  const toggleSelectAll = () => {
    if (
      filteredBookings.length > 0 &&
      filteredBookings.every((b) => selectedIds.includes(b.id))
    ) {
      const fIds = new Set(filteredBookings.map((b) => b.id));
      setSelectedIds((prev) => prev.filter((id) => !fIds.has(id)));
    } else {
      setSelectedIds((prev) => [
        ...prev,
        ...filteredBookings
          .filter((b) => !prev.includes(b.id))
          .map((b) => b.id),
      ]);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  return {
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    selectedIds,
    setSelectedIds,
    toggleSelectAll,
    toggleSelectOne,
    clearSelection,
    tabOptions,
    filteredBookings,
  };
}

