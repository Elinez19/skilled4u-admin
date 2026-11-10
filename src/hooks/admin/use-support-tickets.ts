"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { AdminTabOption } from "@/components/admin/ui/admin-segmented-tabs";
import { INITIAL_TICKETS } from "@/components/admin/support/constants";
import type {
  RequesterRole,
  SupportTicket,
  TicketFilter,
  TicketPriority,
  TicketStatus,
} from "@/components/admin/support/types";

export interface UseSupportTicketsReturn {
  // Items & filtering
  items: SupportTicket[];
  filtered: SupportTicket[];
  filter: TicketFilter;
  setFilter: (f: TicketFilter) => void;
  search: string;
  setSearch: (s: string) => void;
  selectedIds: string[];
  tabOptions: ReadonlyArray<AdminTabOption<TicketFilter>>;

  // KPIs
  openTickets: number;

  // Selection
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  toggleSelectAll: (checked: boolean) => void;
  toggleSelectOne: (id: string) => void;
  clearSelection: () => void;
  resolveSelected: () => void;
  deleteSelected: () => void;

  // Actions
  updateTicketStatus: (id: string, nextStatus: TicketStatus) => void;
  togglePriority: (id: string) => void;
  deleteTicket: (id: string) => void;

  // Form State & Actions
  formRef: React.RefObject<HTMLDivElement | null>;
  formOpen: boolean;
  setFormOpen: (open: boolean) => void;
  editingId: string | null;
  editingCode: string | null;
  requesterName: string;
  setRequesterName: (name: string) => void;
  requesterRole: RequesterRole;
  setRequesterRole: (role: RequesterRole) => void;
  city: string;
  setCity: (city: string) => void;
  priority: TicketPriority;
  setPriority: (priority: TicketPriority) => void;
  status: TicketStatus;
  setStatus: (status: TicketStatus) => void;
  subject: string;
  setSubject: (subject: string) => void;
  savedBanner: string | null;
  resetForm: () => void;
  loadTicketIntoForm: (tkt: SupportTicket) => void;
  scrollToForm: () => void;
  handleSaveTicket: (e: React.FormEvent) => void;
}

export function useSupportTickets(
  initialTickets: SupportTicket[] = INITIAL_TICKETS
): UseSupportTicketsReturn {
  const formRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<SupportTicket[]>(initialTickets);
  const [filter, setFilter] = useState<TicketFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Inline Form State
  const [formOpen, setFormOpen] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [requesterName, setRequesterName] = useState("");
  const [requesterRole, setRequesterRole] = useState<RequesterRole>("Client");
  const [city, setCity] = useState("Abuja");
  const [priority, setPriority] = useState<TicketPriority>("Normal");
  const [status, setStatus] = useState<TicketStatus>("pending");
  const [subject, setSubject] = useState("");
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
    setEditingCode(null);
    setRequesterName("");
    setRequesterRole("Client");
    setCity("Abuja");
    setPriority("Normal");
    setStatus("pending");
    setSubject("");
  }, []);

  const loadTicketIntoForm = useCallback(
    (tkt: SupportTicket) => {
      setEditingId(tkt.id);
      setEditingCode(tkt.ticketCode);
      setRequesterName(tkt.requesterName);
      setRequesterRole(tkt.requesterRole);
      setCity(tkt.city);
      setPriority(tkt.priority);
      setStatus(tkt.status);
      setSubject(tkt.subject);
      scrollToForm();
    },
    [scrollToForm]
  );

  const handleSaveTicket = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (editingId) {
        setItems((prev) =>
          prev.map((t) =>
            t.id === editingId
              ? {
                  ...t,
                  requesterName,
                  requesterRole,
                  city,
                  priority,
                  status,
                  subject,
                  updatedAt: "Just now",
                }
              : t
          )
        );
        notifySaved(`Updated ticket ${editingCode || editingId}`);
        resetForm();
      } else {
        const code = `SUP-${Math.floor(4105 + Math.random() * 890)}`;
        const newTicket: SupportTicket = {
          id: `tkt_${Date.now()}`,
          ticketCode: code,
          requesterName,
          requesterRole,
          city,
          priority,
          status,
          subject,
          updatedAt: "Just now",
        };
        setItems((prev) => [newTicket, ...prev]);
        notifySaved(`Created support ticket ${code}`);
        resetForm();
      }
    },
    [
      editingId,
      editingCode,
      requesterName,
      requesterRole,
      city,
      priority,
      status,
      subject,
      notifySaved,
      resetForm,
    ]
  );

  const updateTicketStatus = useCallback(
    (id: string, nextStatus: TicketStatus) => {
      setItems((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: nextStatus, updatedAt: "Just now" } : t
        )
      );
      notifySaved(`Ticket marked ${nextStatus.replace("_", " ")}`);
    },
    [notifySaved]
  );

  const togglePriority = useCallback(
    (id: string) => {
      setItems((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                priority: t.priority === "High" ? "Normal" : "High",
                updatedAt: "Just now",
              }
            : t
        )
      );
      notifySaved("Ticket priority updated");
    },
    [notifySaved]
  );

  const deleteTicket = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((t) => t.id !== id));
      if (editingId === id) resetForm();
      notifySaved("Support ticket deleted");
    },
    [editingId, resetForm, notifySaved]
  );

  const openTickets = useMemo(
    () => items.filter((t) => t.status !== "completed").length,
    [items]
  );

  const tabOptions: ReadonlyArray<AdminTabOption<TicketFilter>> = useMemo(
    () => [
      { id: "all", label: "All Tickets", count: items.length },
      {
        id: "pending",
        label: "Open",
        count: items.filter((t) => t.status === "pending").length,
      },
      {
        id: "in_progress",
        label: "In Progress",
        count: items.filter((t) => t.status === "in_progress").length,
      },
      {
        id: "completed",
        label: "Resolved",
        count: items.filter((t) => t.status === "completed").length,
      },
    ],
    [items]
  );

  const filtered = useMemo(() => {
    return items.filter((t) => {
      const matchesStatus = filter === "all" || t.status === filter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        t.ticketCode.toLowerCase().includes(q) ||
        t.requesterName.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [items, filter, search]);

  const toggleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds((prev) => [
          ...prev,
          ...filtered.filter((t) => !prev.includes(t.id)).map((t) => t.id),
        ]);
      } else {
        const filteredIds = new Set(filtered.map((t) => t.id));
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
        selectedIds.includes(i.id) ? { ...i, status: "completed" } : i
      )
    );
    notifySaved(`Resolved ${count} ticket(s)`);
    setSelectedIds([]);
  }, [selectedIds, notifySaved]);

  const deleteSelected = useCallback(() => {
    const toDelete = selectedIds.length;
    setItems((prev) => prev.filter((i) => !selectedIds.includes(i.id)));
    notifySaved(`Removed ${toDelete} ticket record(s)`);
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
    openTickets,
    setSelectedIds,
    toggleSelectAll,
    toggleSelectOne,
    clearSelection,
    resolveSelected,
    deleteSelected,
    updateTicketStatus,
    togglePriority,
    deleteTicket,
    formRef,
    formOpen,
    setFormOpen,
    editingId,
    editingCode,
    requesterName,
    setRequesterName,
    requesterRole,
    setRequesterRole,
    city,
    setCity,
    priority,
    setPriority,
    status,
    setStatus,
    subject,
    setSubject,
    savedBanner,
    resetForm,
    loadTicketIntoForm,
    scrollToForm,
    handleSaveTicket,
  };
}

