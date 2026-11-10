"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  ArtisanRow,
  BookingRow,
  CategoryRow,
  PaymentRow,
} from "@/db/schema";
import type { OverviewKpiData } from "@/components/admin/overview/types";

export interface UseOverviewDashboardParams {
  artisans: ArtisanRow[];
  initialBookings: BookingRow[];
  payments: PaymentRow[];
  categories: CategoryRow[];
}

export interface UseOverviewDashboardReturn {
  bookings: BookingRow[];
  setBookings: React.Dispatch<React.SetStateAction<BookingRow[]>>;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  pendingKycArtisans: ArtisanRow[];
  kpis: OverviewKpiData;
  updateBookingStatus: (id: string, status: string) => Promise<void>;
  markSelectedCompleted: () => void;
  removeSelectedBookings: () => void;
  clearSelection: () => void;
  toggleSelectAllVisible: (checked: boolean, visibleItems: BookingRow[]) => void;
  toggleSelectOne: (id: string) => void;
}

export function useOverviewDashboard({
  artisans,
  initialBookings,
  payments,
  categories,
}: UseOverviewDashboardParams): UseOverviewDashboardReturn {
  const [bookings, setBookings] = useState<BookingRow[]>(initialBookings);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const updateBookingStatus = useCallback(async (id: string, status: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
    try {
      await fetch("/api/v1/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    } catch {
      // Optimistically updated
    }
  }, []);

  const totalGmv = useMemo(
    () => payments.reduce((sum, p) => sum + p.amount, 0),
    [payments]
  );

  const totalCommission = useMemo(
    () => payments.reduce((sum, p) => sum + p.platformFee, 0),
    [payments]
  );

  const escrowHeldAmount = useMemo(
    () =>
      payments
        .filter((p) => p.escrowStatus === "held")
        .reduce((sum, p) => sum + p.amount, 0),
    [payments]
  );

  const pendingKycArtisans = useMemo(
    () => artisans.filter((a) => a.kycStatus === "pending"),
    [artisans]
  );

  const verifiedArtisansCount = useMemo(
    () => artisans.filter((a) => a.kycStatus === "verified").length,
    [artisans]
  );

  const kpis: OverviewKpiData = useMemo(
    () => ({
      totalGmv,
      totalCommission,
      escrowHeldAmount,
      totalBookingsCount: bookings.length,
      categoriesCount: categories.length,
      verifiedArtisansCount,
      pendingKycArtisansCount: pendingKycArtisans.length,
    }),
    [
      totalGmv,
      totalCommission,
      escrowHeldAmount,
      bookings.length,
      categories.length,
      verifiedArtisansCount,
      pendingKycArtisans.length,
    ]
  );

  const markSelectedCompleted = useCallback(() => {
    setBookings((prev) =>
      prev.map((b) =>
        selectedIds.includes(b.id) ? { ...b, status: "completed" } : b
      )
    );
    setSelectedIds([]);
  }, [selectedIds]);

  const removeSelectedBookings = useCallback(() => {
    setBookings((prev) => prev.filter((b) => !selectedIds.includes(b.id)));
    setSelectedIds([]);
  }, [selectedIds]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const toggleSelectAllVisible = useCallback(
    (checked: boolean, visibleItems: BookingRow[]) => {
      if (checked) {
        setSelectedIds((prev) => [
          ...prev,
          ...visibleItems.filter((b) => !prev.includes(b.id)).map((b) => b.id),
        ]);
      } else {
        const fIds = new Set(visibleItems.map((b) => b.id));
        setSelectedIds((prev) => prev.filter((id) => !fIds.has(id)));
      }
    },
    []
  );

  const toggleSelectOne = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  return {
    bookings,
    setBookings,
    selectedIds,
    setSelectedIds,
    pendingKycArtisans,
    kpis,
    updateBookingStatus,
    markSelectedCompleted,
    removeSelectedBookings,
    clearSelection,
    toggleSelectAllVisible,
    toggleSelectOne,
  };
}

