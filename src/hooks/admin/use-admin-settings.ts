"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { AdminTabOption } from "@/components/admin/ui/admin-segmented-tabs";
import { INITIAL_POLICIES } from "@/components/admin/settings/constants";
import type {
  PolicyCategory,
  PolicyGroup,
  PolicySettingItem,
  PolicyStatus,
} from "@/components/admin/settings/types";

export interface UseAdminSettingsReturn {
  // Policies & filtering
  policies: PolicySettingItem[];
  filtered: PolicySettingItem[];
  filter: PolicyCategory;
  setFilter: (f: PolicyCategory) => void;
  search: string;
  setSearch: (s: string) => void;
  selectedIds: string[];
  tabOptions: ReadonlyArray<AdminTabOption<PolicyCategory>>;

  // Global Platform Parameters
  platformFeePercent: string;
  setPlatformFeePercent: (v: string) => void;
  artisanSharePercent: string;
  setArtisanSharePercent: (v: string) => void;
  dispatchRadiusKm: string;
  setDispatchRadiusKm: (v: string) => void;
  disputeWindowHours: string;
  setDisputeWindowHours: (v: string) => void;
  supportEmail: string;
  setSupportEmail: (v: string) => void;
  supportPhone: string;
  setSupportPhone: (v: string) => void;

  // Selection
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  toggleSelectAll: (checked: boolean) => void;
  toggleSelectOne: (id: string) => void;
  clearSelection: () => void;
  deleteSelected: () => void;

  // Actions
  togglePolicyStatus: (id: string) => void;
  resetPolicyToDefault: (id: string) => void;
  deletePolicy: (id: string) => void;

  // Form State & Actions
  formRef: React.RefObject<HTMLDivElement | null>;
  formOpen: boolean;
  setFormOpen: (open: boolean) => void;
  editingId: string | null;
  policyTitle: string;
  setPolicyTitle: (title: string) => void;
  policyKeyCode: string;
  setPolicyKeyCode: (code: string) => void;
  policyValue: string;
  setPolicyValue: (val: string) => void;
  policyDescription: string;
  setPolicyDescription: (desc: string) => void;
  policyCategory: PolicyGroup;
  setPolicyCategory: (cat: PolicyGroup) => void;
  policyStatus: PolicyStatus;
  setPolicyStatus: (status: PolicyStatus) => void;
  savedBanner: string | null;
  resetForm: () => void;
  loadPolicyIntoForm: (item: PolicySettingItem) => void;
  scrollToForm: () => void;
  handleSaveSettings: (e: React.FormEvent) => void;
}

export function useAdminSettings(
  initialPolicies: PolicySettingItem[] = INITIAL_POLICIES
): UseAdminSettingsReturn {
  const formRef = useRef<HTMLDivElement>(null);

  const [policies, setPolicies] = useState<PolicySettingItem[]>(initialPolicies);
  const [filter, setFilter] = useState<PolicyCategory>("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Core KPI & Global Settings state
  const [platformFeePercent, setPlatformFeePercent] = useState("10");
  const [artisanSharePercent, setArtisanSharePercent] = useState("90");
  const [dispatchRadiusKm, setDispatchRadiusKm] = useState("15");
  const [disputeWindowHours, setDisputeWindowHours] = useState("48");
  const [supportEmail, setSupportEmail] = useState("support@skilled4u.ng");
  const [supportPhone, setSupportPhone] = useState("+234 800 754 5533");

  // Inline Form State for adding/editing policy settings
  const [formOpen, setFormOpen] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [policyTitle, setPolicyTitle] = useState("");
  const [policyKeyCode, setPolicyKeyCode] = useState("");
  const [policyValue, setPolicyValue] = useState("");
  const [policyDescription, setPolicyDescription] = useState("");
  const [policyCategory, setPolicyCategory] = useState<PolicyGroup>("financials");
  const [policyStatus, setPolicyStatus] = useState<PolicyStatus>("active");
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
    setPolicyTitle("");
    setPolicyKeyCode("");
    setPolicyValue("");
    setPolicyDescription("");
    setPolicyCategory("financials");
    setPolicyStatus("active");
  }, []);

  const loadPolicyIntoForm = useCallback(
    (item: PolicySettingItem) => {
      setEditingId(item.id);
      setPolicyTitle(item.title);
      setPolicyKeyCode(item.keyCode);
      setPolicyValue(item.value);
      setPolicyDescription(item.description);
      setPolicyCategory(item.category);
      setPolicyStatus(item.status);
      scrollToForm();
    },
    [scrollToForm]
  );

  const handleSaveSettings = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (editingId) {
        setPolicies((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? {
                  ...p,
                  title: policyTitle,
                  keyCode:
                    policyKeyCode ||
                    policyTitle.toUpperCase().replace(/[^A-Z0-9]+/g, "_"),
                  value: policyValue,
                  description: policyDescription,
                  category: policyCategory,
                  status: policyStatus,
                  updatedAt: "Updated just now",
                }
              : p
          )
        );
        notifySaved(`Updated setting "${policyTitle}"`);
        resetForm();
        return;
      }

      if (policyTitle.trim() && policyValue.trim()) {
        const code =
          policyKeyCode.trim() ||
          policyTitle
            .trim()
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, "_");
        const newPolicy: PolicySettingItem = {
          id: `pol_${Date.now()}`,
          keyCode: code,
          title: policyTitle.trim(),
          category: policyCategory,
          value: policyValue.trim(),
          defaultValue: policyValue.trim(),
          description:
            policyDescription.trim() ||
            `Configured ${policyCategory} rule for marketplace operations.`,
          status: policyStatus,
          updatedAt: "Created just now",
        };
        setPolicies((prev) => [newPolicy, ...prev]);
        notifySaved(`Added policy rule "${policyTitle}"`);
        resetForm();
        return;
      }

      // Sync global parameters into the core policy rows
      setPolicies((prev) =>
        prev.map((p) => {
          if (p.keyCode === "ESCROW_COMMISSION_SPLIT") {
            return {
              ...p,
              value: `${artisanSharePercent}% / ${platformFeePercent}%`,
              updatedAt: "Updated just now",
            };
          }
          if (p.keyCode === "MAX_DISPATCH_RADIUS_KM") {
            return {
              ...p,
              value: `${dispatchRadiusKm} km`,
              updatedAt: "Updated just now",
            };
          }
          if (p.keyCode === "DISPUTE_HOLD_WINDOW") {
            return {
              ...p,
              value: `${disputeWindowHours} Hours`,
              updatedAt: "Updated just now",
            };
          }
          return p;
        })
      );
      notifySaved("Marketplace settings & policies saved");
    },
    [
      editingId,
      policyTitle,
      policyKeyCode,
      policyValue,
      policyDescription,
      policyCategory,
      policyStatus,
      artisanSharePercent,
      platformFeePercent,
      dispatchRadiusKm,
      disputeWindowHours,
      notifySaved,
      resetForm,
    ]
  );

  const togglePolicyStatus = useCallback(
    (id: string) => {
      setPolicies((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                status: p.status === "active" ? "pending" : "active",
                updatedAt: "Updated just now",
              }
            : p
        )
      );
      notifySaved("Policy status toggled");
    },
    [notifySaved]
  );

  const resetPolicyToDefault = useCallback(
    (id: string) => {
      setPolicies((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, value: p.defaultValue, updatedAt: "Reset to default" }
            : p
        )
      );
      notifySaved("Policy reset to default value");
    },
    [notifySaved]
  );

  const deletePolicy = useCallback(
    (id: string) => {
      setPolicies((prev) => prev.filter((p) => p.id !== id));
      if (editingId === id) resetForm();
      notifySaved("Policy setting removed");
    },
    [editingId, resetForm, notifySaved]
  );

  const tabOptions: ReadonlyArray<AdminTabOption<PolicyCategory>> = useMemo(
    () => [
      { id: "all", label: "All Settings", count: policies.length },
      {
        id: "financials",
        label: "Financials & Fees",
        count: policies.filter((p) => p.category === "financials").length,
      },
      {
        id: "dispatch",
        label: "Dispatch SLAs",
        count: policies.filter((p) => p.category === "dispatch").length,
      },
      {
        id: "governance",
        label: "KYC & Governance",
        count: policies.filter((p) => p.category === "governance").length,
      },
    ],
    [policies]
  );

  const filtered = useMemo(() => {
    return policies.filter((p) => {
      const matchesCategory = filter === "all" || p.category === filter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.keyCode.toLowerCase().includes(q) ||
        p.value.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [policies, filter, search]);

  const toggleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds((prev) => [
          ...prev,
          ...filtered.filter((p) => !prev.includes(p.id)).map((p) => p.id),
        ]);
      } else {
        const fIds = new Set(filtered.map((p) => p.id));
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

  const deleteSelected = useCallback(() => {
    const count = selectedIds.length;
    setPolicies((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
    notifySaved(`Removed ${count} setting rule(s)`);
    setSelectedIds([]);
  }, [selectedIds, notifySaved]);

  return {
    policies,
    filtered,
    filter,
    setFilter,
    search,
    setSearch,
    selectedIds,
    tabOptions,
    platformFeePercent,
    setPlatformFeePercent,
    artisanSharePercent,
    setArtisanSharePercent,
    dispatchRadiusKm,
    setDispatchRadiusKm,
    disputeWindowHours,
    setDisputeWindowHours,
    supportEmail,
    setSupportEmail,
    supportPhone,
    setSupportPhone,
    setSelectedIds,
    toggleSelectAll,
    toggleSelectOne,
    clearSelection,
    deleteSelected,
    togglePolicyStatus,
    resetPolicyToDefault,
    deletePolicy,
    formRef,
    formOpen,
    setFormOpen,
    editingId,
    policyTitle,
    setPolicyTitle,
    policyKeyCode,
    setPolicyKeyCode,
    policyValue,
    setPolicyValue,
    policyDescription,
    setPolicyDescription,
    policyCategory,
    setPolicyCategory,
    policyStatus,
    setPolicyStatus,
    savedBanner,
    resetForm,
    loadPolicyIntoForm,
    scrollToForm,
    handleSaveSettings,
  };
}

