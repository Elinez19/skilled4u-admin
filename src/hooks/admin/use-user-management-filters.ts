"use client";

import { useMemo, useState } from "react";
import type { ArtisanRow } from "@/db/schema";
import type { AdminTabOption } from "@/components/admin/ui/admin-segmented-tabs";
import type {
  AdminRecord,
  CustomerRecord,
  UserViewFilter,
} from "@/components/admin/artisans/types";

export interface UseUserManagementFiltersProps {
  artisans: ArtisanRow[];
  customers: CustomerRecord[];
  admins: AdminRecord[];
  counts: {
    all: number;
    verified: number;
    pending: number;
    rejected: number;
  };
}

export interface UseUserManagementFiltersReturn {
  filter: UserViewFilter;
  setFilter: (f: UserViewFilter) => void;
  search: string;
  setSearch: (s: string) => void;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  tabOptions: ReadonlyArray<AdminTabOption<UserViewFilter>>;
  filteredArtisans: ArtisanRow[];
  filteredCustomers: CustomerRecord[];
  filteredAdmins: AdminRecord[];
  toggleSelectAllArtisans: () => void;
  toggleSelectOne: (id: string) => void;
  clearSelection: () => void;
}

export function useUserManagementFilters({
  artisans,
  customers,
  admins,
  counts,
}: UseUserManagementFiltersProps): UseUserManagementFiltersReturn {
  const [filter, setFilter] = useState<UserViewFilter>("artisans_all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const tabOptions: ReadonlyArray<AdminTabOption<UserViewFilter>> = useMemo(
    () => [
      { id: "artisans_all", label: "Artisans", count: counts.all },
      { id: "artisans_pending", label: "Pending KYC", count: counts.pending },
      { id: "artisans_verified", label: "Verified Pros", count: counts.verified },
      { id: "customers", label: "Customers", count: customers.length },
      { id: "admins", label: "Admins", count: admins.length },
    ],
    [counts, customers.length, admins.length]
  );

  const q = search.toLowerCase();

  const filteredArtisans = useMemo(() => {
    return artisans.filter((a) => {
      const matchesStatus =
        filter === "artisans_all" ||
        (filter === "artisans_pending" && a.kycStatus === "pending") ||
        (filter === "artisans_verified" && a.kycStatus === "verified");
      const matchesSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.trade.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [artisans, filter, q]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [customers, q]);

  const filteredAdmins = useMemo(() => {
    return admins.filter(
      (adm) =>
        !q ||
        adm.name.toLowerCase().includes(q) ||
        adm.email.toLowerCase().includes(q) ||
        adm.roleTitle.toLowerCase().includes(q)
    );
  }, [admins, q]);

  const toggleSelectAllArtisans = () => {
    if (
      filteredArtisans.length > 0 &&
      filteredArtisans.every((a) => selectedIds.includes(a.id))
    ) {
      const fIds = new Set(filteredArtisans.map((a) => a.id));
      setSelectedIds((prev) => prev.filter((id) => !fIds.has(id)));
    } else {
      setSelectedIds((prev) => [
        ...prev,
        ...filteredArtisans
          .filter((a) => !prev.includes(a.id))
          .map((a) => a.id),
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
    filteredArtisans,
    filteredCustomers,
    filteredAdmins,
    toggleSelectAllArtisans,
    toggleSelectOne,
    clearSelection,
  };
}

