"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { AdminTabOption } from "@/components/admin/ui/admin-segmented-tabs";
import { INITIAL_REVIEWS } from "@/components/admin/reviews/constants";
import type {
  RatingString,
  ReviewFilter,
  ReviewModerationStatus,
  ReviewRecord,
} from "@/components/admin/reviews/types";

export interface UseReviewsReturn {
  // Items & filtering
  items: ReviewRecord[];
  filtered: ReviewRecord[];
  filter: ReviewFilter;
  setFilter: (f: ReviewFilter) => void;
  search: string;
  setSearch: (s: string) => void;
  selectedIds: string[];
  tabOptions: ReadonlyArray<AdminTabOption<ReviewFilter>>;

  // KPIs
  verifiedCount: number;
  pendingCount: number;
  avgRating: string;

  // Selection
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  toggleSelectAll: (checked: boolean) => void;
  toggleSelectOne: (id: string) => void;
  clearSelection: () => void;
  verifySelected: () => void;
  deleteSelected: () => void;

  // Actions
  updateReviewStatus: (id: string, nextStatus: ReviewModerationStatus) => void;
  deleteReview: (id: string) => void;

  // Form State & Actions
  formRef: React.RefObject<HTMLDivElement | null>;
  formOpen: boolean;
  setFormOpen: (open: boolean) => void;
  editingId: string | null;
  clientName: string;
  setClientName: (name: string) => void;
  artisanName: string;
  setArtisanName: (name: string) => void;
  serviceTitle: string;
  setServiceTitle: (title: string) => void;
  rating: RatingString;
  setRating: (rating: RatingString) => void;
  status: ReviewModerationStatus;
  setStatus: (status: ReviewModerationStatus) => void;
  comment: string;
  setComment: (comment: string) => void;
  savedBanner: string | null;
  resetForm: () => void;
  loadReviewIntoForm: (rev: ReviewRecord) => void;
  scrollToForm: () => void;
  handleSaveReview: (e: React.FormEvent) => void;
}

export function useReviews(
  initialReviews: ReviewRecord[] = INITIAL_REVIEWS
): UseReviewsReturn {
  const formRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<ReviewRecord[]>(initialReviews);
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Inline Form State
  const [formOpen, setFormOpen] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [artisanName, setArtisanName] = useState("Emeka Okafor");
  const [serviceTitle, setServiceTitle] = useState(
    "Split A.C Gas Refill & Servicing"
  );
  const [rating, setRating] = useState<RatingString>("5");
  const [status, setStatus] = useState<ReviewModerationStatus>("verified");
  const [comment, setComment] = useState("");
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
    setClientName("");
    setArtisanName("Emeka Okafor");
    setServiceTitle("Split A.C Gas Refill & Servicing");
    setRating("5");
    setStatus("verified");
    setComment("");
  }, []);

  const loadReviewIntoForm = useCallback(
    (rev: ReviewRecord) => {
      setEditingId(rev.id);
      setClientName(rev.clientName);
      setArtisanName(rev.artisanName);
      setServiceTitle(rev.serviceTitle);
      setRating(String(rev.rating) as RatingString);
      setStatus(rev.status);
      setComment(rev.comment);
      scrollToForm();
    },
    [scrollToForm]
  );

  const handleSaveReview = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (editingId) {
        setItems((prev) =>
          prev.map((r) =>
            r.id === editingId
              ? {
                  ...r,
                  clientName,
                  artisanName,
                  serviceTitle,
                  rating: Number(rating) || 5,
                  comment,
                  status,
                }
              : r
          )
        );
        notifySaved(`Updated review by ${clientName}`);
        resetForm();
      } else {
        const newRev: ReviewRecord = {
          id: `rev_${Date.now()}`,
          clientName,
          artisanName,
          serviceTitle,
          rating: Number(rating) || 5,
          comment,
          status,
          createdAt: "Just now",
        };
        setItems((prev) => [newRev, ...prev]);
        notifySaved(`Added review for ${artisanName}`);
        resetForm();
      }
    },
    [
      editingId,
      clientName,
      artisanName,
      serviceTitle,
      rating,
      comment,
      status,
      notifySaved,
      resetForm,
    ]
  );

  const updateReviewStatus = useCallback(
    (id: string, nextStatus: ReviewModerationStatus) => {
      setItems((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r))
      );
      notifySaved(`Review status updated to ${nextStatus}`);
    },
    [notifySaved]
  );

  const deleteReview = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((r) => r.id !== id));
      if (editingId === id) resetForm();
      notifySaved("Review removed from ledger");
    },
    [editingId, resetForm, notifySaved]
  );

  const verifiedCount = useMemo(
    () => items.filter((r) => r.status === "verified").length,
    [items]
  );

  const pendingCount = useMemo(
    () => items.filter((r) => r.status === "pending").length,
    [items]
  );

  const avgRating = useMemo(() => {
    return (
      items.reduce((sum, r) => sum + r.rating, 0) / (items.length || 1)
    ).toFixed(1);
  }, [items]);

  const tabOptions: ReadonlyArray<AdminTabOption<ReviewFilter>> = useMemo(
    () => [
      { id: "all", label: "All Reviews", count: items.length },
      { id: "verified", label: "Verified", count: verifiedCount },
      {
        id: "pending",
        label: "Pending Moderation",
        count: pendingCount,
      },
    ],
    [items.length, verifiedCount, pendingCount]
  );

  const filtered = useMemo(() => {
    return items.filter((r) => {
      const matchesStatus = filter === "all" || r.status === filter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        r.clientName.toLowerCase().includes(q) ||
        r.artisanName.toLowerCase().includes(q) ||
        r.serviceTitle.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [items, filter, search]);

  const toggleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds((prev) => [
          ...prev,
          ...filtered.filter((r) => !prev.includes(r.id)).map((r) => r.id),
        ]);
      } else {
        const fIds = new Set(filtered.map((r) => r.id));
        setSelectedIds((prev) => prev.filter((id) => !fIds.has(id)));
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

  const verifySelected = useCallback(() => {
    const count = selectedIds.length;
    setItems((prev) =>
      prev.map((r) =>
        selectedIds.includes(r.id) ? { ...r, status: "verified" } : r
      )
    );
    notifySaved(`Verified ${count} review(s)`);
    setSelectedIds([]);
  }, [selectedIds, notifySaved]);

  const deleteSelected = useCallback(() => {
    const count = selectedIds.length;
    setItems((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
    notifySaved(`Removed ${count} review record(s)`);
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
    verifiedCount,
    pendingCount,
    avgRating,
    setSelectedIds,
    toggleSelectAll,
    toggleSelectOne,
    clearSelection,
    verifySelected,
    deleteSelected,
    updateReviewStatus,
    deleteReview,
    formRef,
    formOpen,
    setFormOpen,
    editingId,
    clientName,
    setClientName,
    artisanName,
    setArtisanName,
    serviceTitle,
    setServiceTitle,
    rating,
    setRating,
    status,
    setStatus,
    comment,
    setComment,
    savedBanner,
    resetForm,
    loadReviewIntoForm,
    scrollToForm,
    handleSaveReview,
  };
}

