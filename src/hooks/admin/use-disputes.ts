"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { AdminTabOption } from "@/components/admin/ui/admin-segmented-tabs";
import { INITIAL_DISPUTES } from "@/components/admin/disputes/constants";
import type {
  DisputeFilter,
  DisputeItem,
  DisputeStatus,
} from "@/components/admin/disputes/types";

export interface UseDisputesReturn {
  // Items & filtering
  items: DisputeItem[];
  filtered: DisputeItem[];
  filter: DisputeFilter;
  setFilter: (filter: DisputeFilter) => void;
  search: string;
  setSearch: (search: string) => void;
  selectedIds: string[];
  tabOptions: ReadonlyArray<AdminTabOption<DisputeFilter>>;

  // KPIs
  openCount: number;
  frozenEscrow: number;
  resolvedCount: number;

  // Selection
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  toggleSelectAll: (checked: boolean) => void;
  toggleSelectOne: (id: string) => void;
  clearSelection: () => void;
  resolveSelected: () => void;
  deleteSelected: () => void;

  // Actions
  updateDisputeStatus: (id: string, nextStatus: DisputeStatus) => void;
  deleteDispute: (id: string) => void;

  // Form State & Actions
  formRef: React.RefObject<HTMLDivElement | null>;
  formOpen: boolean;
  setFormOpen: (open: boolean) => void;
  editingId: string | null;
  editingCaseCode: string | null;
  bookingCode: string;
  setBookingCode: (code: string) => void;
  clientName: string;
  setClientName: (name: string) => void;
  artisanName: string;
  setArtisanName: (name: string) => void;
  serviceTitle: string;
  setServiceTitle: (title: string) => void;
  escrowAmount: string;
  setEscrowAmount: (amt: string) => void;
  status: DisputeStatus;
  setStatus: (status: DisputeStatus) => void;
  reason: string;
  setReason: (reason: string) => void;
  savedBanner: string | null;
  resetForm: () => void;
  loadDisputeIntoForm: (item: DisputeItem) => void;
  scrollToForm: () => void;
  handleSaveDispute: (e: React.FormEvent) => void;
}

export function useDisputes(
  initialDisputes: DisputeItem[] = INITIAL_DISPUTES
): UseDisputesReturn {
  const formRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<DisputeItem[]>(initialDisputes);
  const [filter, setFilter] = useState<DisputeFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Inline Form State
  const [formOpen, setFormOpen] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCaseCode, setEditingCaseCode] = useState<string | null>(null);
  const [bookingCode, setBookingCode] = useState("S4U-8890");
  const [clientName, setClientName] = useState("");
  const [artisanName, setArtisanName] = useState("Emeka Okafor");
  const [serviceTitle, setServiceTitle] = useState(
    "Split A.C Servicing & Gas Refill"
  );
  const [escrowAmount, setEscrowAmount] = useState("25000");
  const [status, setStatus] = useState<DisputeStatus>("disputed");
  const [reason, setReason] = useState("");
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  const notifySaved = useCallback((msg: string) => {
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(null), 3500);
  }, []);

  const scrollToForm = useCallback(() => {
    setFormOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }, []);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setEditingCaseCode(null);
    setBookingCode(`S4U-${8890 + items.length}`);
    setClientName("");
    setArtisanName("Emeka Okafor");
    setServiceTitle("Split A.C Servicing & Gas Refill");
    setEscrowAmount("25000");
    setStatus("disputed");
    setReason("");
  }, [items.length]);

  const loadDisputeIntoForm = useCallback(
    (item: DisputeItem) => {
      setEditingId(item.id);
      setEditingCaseCode(item.caseCode);
      setBookingCode(item.bookingCode);
      setClientName(item.clientName);
      setArtisanName(item.artisanName);
      setServiceTitle(item.serviceTitle);
      setEscrowAmount(String(item.escrowAmount));
      setStatus(item.status);
      setReason(item.reason);
      scrollToForm();
    },
    [scrollToForm]
  );

  const handleSaveDispute = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (editingId) {
        setItems((prev) =>
          prev.map((d) =>
            d.id === editingId
              ? {
                  ...d,
                  bookingCode,
                  clientName,
                  artisanName,
                  serviceTitle,
                  escrowAmount: Number(escrowAmount) || 0,
                  status,
                  reason,
                }
              : d
          )
        );
        notifySaved(`Updated arbitration case ${editingCaseCode || editingId}`);
        resetForm();
      } else {
        const nextNum = 9042 + items.length;
        const code = `DSP-${nextNum}`;
        const newCase: DisputeItem = {
          id: `dsp_${nextNum}`,
          caseCode: code,
          bookingCode,
          clientName,
          artisanName,
          serviceTitle,
          escrowAmount: Number(escrowAmount) || 0,
          status,
          reason,
          createdAt: "Just now",
        };
        setItems((prev) => [newCase, ...prev]);
        notifySaved(`Opened dispute case ${code}`);
        resetForm();
      }
    },
    [
      editingId,
      bookingCode,
      clientName,
      artisanName,
      serviceTitle,
      escrowAmount,
      status,
      reason,
      editingCaseCode,
      items.length,
      notifySaved,
      resetForm,
    ]
  );

  const updateDisputeStatus = useCallback(
    (id: string, nextStatus: DisputeStatus) => {
      setItems((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: nextStatus } : d))
      );
      notifySaved(`Case status updated to ${nextStatus}`);
    },
    [notifySaved]
  );

  const deleteDispute = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((d) => d.id !== id));
      if (editingId === id) resetForm();
      notifySaved("Dispute case removed");
    },
    [editingId, resetForm, notifySaved]
  );

  const openCount = useMemo(
    () => items.filter((d) => d.status !== "resolved").length,
    [items]
  );

  const frozenEscrow = useMemo(
    () =>
      items
        .filter((d) => d.status !== "resolved")
        .reduce((sum, d) => sum + d.escrowAmount, 0),
    [items]
  );

  const resolvedCount = useMemo(
    () => items.filter((d) => d.status === "resolved").length,
    [items]
  );

  const tabOptions: ReadonlyArray<AdminTabOption<DisputeFilter>> = useMemo(
    () => [
      { id: "all", label: "All Cases", count: items.length },
      {
        id: "disputed",
        label: "Disputed",
        count: items.filter((d) => d.status === "disputed").length,
      },
      {
        id: "held",
        label: "Escrow Frozen",
        count: items.filter((d) => d.status === "held").length,
      },
      { id: "resolved", label: "Resolved", count: resolvedCount },
    ],
    [items, resolvedCount]
  );

  const filtered = useMemo(() => {
    return items.filter((d) => {
      const matchesStatus = filter === "all" || d.status === filter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        d.caseCode.toLowerCase().includes(q) ||
        d.bookingCode.toLowerCase().includes(q) ||
        d.clientName.toLowerCase().includes(q) ||
        d.artisanName.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [items, filter, search]);

  const toggleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds((prev) => [
          ...prev,
          ...filtered.filter((i) => !prev.includes(i.id)).map((i) => i.id),
        ]);
      } else {
        const filteredIds = new Set(filtered.map((i) => i.id));
        setSelectedIds((prev) => prev.filter((id) => !filteredIds.has(id)));
      }
    },
    [filtered]
  );

  const toggleSelectOne = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const resolveSelected = useCallback(() => {
    const count = selectedIds.length;
    setItems((prev) =>
      prev.map((i) =>
        selectedIds.includes(i.id) ? { ...i, status: "resolved" } : i
      )
    );
    notifySaved(`Resolved ${count} dispute(s)`);
    setSelectedIds([]);
  }, [selectedIds, notifySaved]);

  const deleteSelected = useCallback(() => {
    const toDelete = selectedIds.length;
    setItems((prev) => prev.filter((i) => !selectedIds.includes(i.id)));
    notifySaved(`Removed ${toDelete} dispute record(s)`);
    setSelectedIds([]);
  }, [selectedIds, notifySaved]);

  return {
    items,
    filtered,
    filter,
    setFilter,
    search,
    setSearch,
    selectedIds,
    tabOptions,
    openCount,
    frozenEscrow,
    resolvedCount,
    setSelectedIds,
    toggleSelectAll,
    toggleSelectOne,
    clearSelection,
    resolveSelected,
    deleteSelected,
    updateDisputeStatus,
    deleteDispute,
    formRef,
    formOpen,
    setFormOpen,
    editingId,
    editingCaseCode,
    bookingCode,
    setBookingCode,
    clientName,
    setClientName,
    artisanName,
    setArtisanName,
    serviceTitle,
    setServiceTitle,
    escrowAmount,
    setEscrowAmount,
    status,
    setStatus,
    reason,
    setReason,
    savedBanner,
    resetForm,
    loadDisputeIntoForm,
    scrollToForm,
    handleSaveDispute,
  };
}

