"use client";

import * as React from "react";
import {
  CheckCircle2,
  Clock,
  Lock,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Settings,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { AdminActionMenu } from "@/components/admin/ui/admin-action-menu";
import {
  AdminDataTable,
  AdminEmptyState,
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-data-table";
import {
  AdminInlineForm,
  AdminSearchInput,
  AdminSelectPills,
  AdminTextField,
} from "@/components/admin/ui/admin-form-controls";
import {
  AdminHeroBanner,
  AdminWorkspaceSlab,
} from "@/components/admin/ui/admin-hero-banner";
import { AdminKpiCard } from "@/components/admin/ui/admin-kpi-card";
import {
  AdminSegmentedTabs,
  type AdminTabOption,
} from "@/components/admin/ui/admin-segmented-tabs";
import { AdminStatusPill } from "@/components/admin/ui/admin-status-pill";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

type PolicyCategory = "all" | "financials" | "dispatch" | "governance";
type PolicyGroup = "financials" | "dispatch" | "governance";
type PolicyStatus = "active" | "pending";

interface PolicySettingItem {
  id: string;
  keyCode: string;
  title: string;
  category: PolicyGroup;
  value: string;
  defaultValue: string;
  description: string;
  status: PolicyStatus;
  updatedAt: string;
}

const INITIAL_POLICIES: PolicySettingItem[] = [
  {
    id: "pol_1",
    keyCode: "ESCROW_COMMISSION_SPLIT",
    title: "Booking Escrow Commission Split (Artisan / Platform)",
    category: "financials",
    value: "90% / 10%",
    defaultValue: "90% / 10%",
    description:
      "Artisans receive 90% upon customer completion sign-off; 10% platform service fee.",
    status: "active",
    updatedAt: "Active policy",
  },
  {
    id: "pol_2",
    keyCode: "MAX_DISPATCH_RADIUS_KM",
    title: "Maximum Artisan Dispatch Radius",
    category: "dispatch",
    value: "15 km",
    defaultValue: "15 km",
    description:
      "Maximum distance for automatic pro matching across Abuja and Lagos zones.",
    status: "active",
    updatedAt: "Active policy",
  },
  {
    id: "pol_3",
    keyCode: "DISPUTE_HOLD_WINDOW",
    title: "Customer Escrow Dispute Protection Window",
    category: "governance",
    value: "48 Hours",
    defaultValue: "48 Hours",
    description:
      "Window after service completion during which customers can request arbitration.",
    status: "active",
    updatedAt: "Active policy",
  },
  {
    id: "pol_4",
    keyCode: "MANDATORY_NIN_NUBAN_KYC",
    title: "Mandatory Artisan NIN & Bank Account Verification",
    category: "governance",
    value: "Required before payout",
    defaultValue: "Required before payout",
    description:
      "Requires verified NIN and NUBAN settlement account before escrow release.",
    status: "active",
    updatedAt: "Active policy",
  },
];

const POLICY_CATEGORY_OPTIONS = [
  { id: "financials", label: "Financials & Fees" },
  { id: "dispatch", label: "Dispatch & SLA" },
  { id: "governance", label: "User & KYC Governance" },
] as const;

const POLICY_STATUS_OPTIONS = [
  { id: "active", label: "Active Policy" },
  { id: "pending", label: "Paused / Draft" },
] as const;

export default function AdminSettingsPage() {
  const formRef = React.useRef<HTMLDivElement>(null);

  const [policies, setPolicies] =
    React.useState<PolicySettingItem[]>(INITIAL_POLICIES);
  const [filter, setFilter] = React.useState<PolicyCategory>("all");
  const [search, setSearch] = React.useState("");

  // Core KPI & Global Settings state
  const [platformFeePercent, setPlatformFeePercent] = React.useState("10");
  const [artisanSharePercent, setArtisanSharePercent] = React.useState("90");
  const [dispatchRadiusKm, setDispatchRadiusKm] = React.useState("15");
  const [disputeWindowHours, setDisputeWindowHours] = React.useState("48");
  const [supportEmail, setSupportEmail] =
    React.useState("support@skilled4u.ng");
  const [supportPhone, setSupportPhone] =
    React.useState("+234 800 754 5533");

  // Inline Form State for adding/editing policy settings
  const [formOpen, setFormOpen] = React.useState(true);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [policyTitle, setPolicyTitle] = React.useState("");
  const [policyKeyCode, setPolicyKeyCode] = React.useState("");
  const [policyValue, setPolicyValue] = React.useState("");
  const [policyDescription, setPolicyDescription] = React.useState("");
  const [policyCategory, setPolicyCategory] =
    React.useState<PolicyGroup>("financials");
  const [policyStatus, setPolicyStatus] =
    React.useState<PolicyStatus>("active");
  const [savedBanner, setSavedBanner] = React.useState<string | null>(null);

  function notifySaved(msg: string) {
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(null), 3500);
  }

  function scrollToForm() {
    setFormOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  function resetForm() {
    setEditingId(null);
    setPolicyTitle("");
    setPolicyKeyCode("");
    setPolicyValue("");
    setPolicyDescription("");
    setPolicyCategory("financials");
    setPolicyStatus("active");
  }

  function loadPolicyIntoForm(item: PolicySettingItem) {
    setEditingId(item.id);
    setPolicyTitle(item.title);
    setPolicyKeyCode(item.keyCode);
    setPolicyValue(item.value);
    setPolicyDescription(item.description);
    setPolicyCategory(item.category);
    setPolicyStatus(item.status);
    scrollToForm();
  }

  function handleSaveSettings(e: React.FormEvent) {
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
  }

  function togglePolicyStatus(id: string) {
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
  }

  function resetPolicyToDefault(id: string) {
    setPolicies((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, value: p.defaultValue, updatedAt: "Reset to default" }
          : p
      )
    );
    notifySaved("Policy reset to default value");
  }

  function deletePolicy(id: string) {
    setPolicies((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) resetForm();
    notifySaved("Policy setting removed");
  }

  const tabOptions: ReadonlyArray<AdminTabOption<PolicyCategory>> = [
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
  ];

  const filtered = policies.filter((p) => {
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

  return (
    <div className="space-y-3 sm:space-y-4">
      <AdminHeroBanner
        eyebrow="Platform Governance & Operations"
        eyebrowIcon="shield"
        headline="Marketplace Settings & Policies."
        highlightWords={["Settings", "Policies."]}
        subtitle="Add, edit, and manage platform settings, commission splits, dispatch limits, and KYC verification rules using the inline form and table actions below."
        primaryCta={{
          label: "Add Policy Setting",
          onClick: () => {
            resetForm();
            scrollToForm();
          },
          variant: "primary",
          icon: <Plus className="h-4 w-4" />,
        }}
        secondaryCta={{
          label: "Manage Users",
          href: "/admin/user-management",
          variant: "secondary",
          trailingArrow: true,
        }}
      />

      <AdminWorkspaceSlab tone="pearl" withPearlAsset>
        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StaggerItem>
            <AdminKpiCard
              label="Booking Commission Split"
              value={`${artisanSharePercent}% / ${platformFeePercent}%`}
              badgeText="Artisan payout vs Platform service fee"
              badgeTone="porcelain"
              badgeIcon="dot"
              ringTone="blue"
              icon={<Lock className="h-4 w-4 text-ink-on-blue" />}
            />
          </StaggerItem>

          <StaggerItem>
            <AdminKpiCard
              label="Service Dispatch Radius"
              value={`${dispatchRadiusKm} km`}
              badgeText="Maximum artisan assignment distance"
              badgeTone="sky"
              badgeIcon="pin"
              ringTone="ink"
              icon={<Settings className="h-4 w-4 text-accent-gold" />}
            />
          </StaggerItem>

          <StaggerItem>
            <AdminKpiCard
              label="User & Dispute Governance"
              value={`${disputeWindowHours}h Window`}
              badgeText="Mandatory KYC & customer protection"
              badgeTone="blue"
              badgeIcon="shield"
              ringTone="ink"
              tone="ink"
              icon={<Users className="h-4 w-4 text-accent-sky" />}
            />
          </StaggerItem>
        </Stagger>

        {/* Inline Form to Add, Edit, and Manage Platform Settings & Policies */}
        <div className="mt-6">
          <AdminInlineForm
            formRef={formRef}
            eyebrow="Inline Platform Settings & Policy Form"
            title={
              editingId
                ? `Edit & Manage Setting: ${policyTitle}`
                : "Add, Edit & Manage Marketplace Settings"
            }
            description="Configure global commission splits, dispatch radius, and support channels—or add and edit individual governance policy rules."
            isEditing={Boolean(editingId)}
            editingBadgeText={`Key: ${policyKeyCode}`}
            onResetToCreate={resetForm}
            open={formOpen}
            onOpenChange={setFormOpen}
            savedMessage={savedBanner}
          >
            <form onSubmit={handleSaveSettings} className="space-y-5">
              {/* Global Platform Parameters */}
              {!editingId && (
                <div className="space-y-4 pb-4 border-b border-surface-frost">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <AdminTextField
                      label="Artisan Earnings Share (%)"
                      type="number"
                      value={artisanSharePercent}
                      onChange={(e) => setArtisanSharePercent(e.target.value)}
                      required
                    />
                    <AdminTextField
                      label="Platform Service Fee (%)"
                      type="number"
                      value={platformFeePercent}
                      onChange={(e) => setPlatformFeePercent(e.target.value)}
                      required
                    />
                    <AdminTextField
                      label="Max Dispatch Radius (km)"
                      type="number"
                      value={dispatchRadiusKm}
                      onChange={(e) => setDispatchRadiusKm(e.target.value)}
                      required
                    />
                    <AdminTextField
                      label="Dispute Claim Window (Hours)"
                      type="number"
                      value={disputeWindowHours}
                      onChange={(e) => setDisputeWindowHours(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <AdminTextField
                      label="Customer & Artisan Support Email"
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      required
                    />
                    <AdminTextField
                      label="Support & Dispatch Hotline"
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Add / Edit Individual Policy Setting Rule */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <AdminTextField
                    label="Policy / Setting Title"
                    placeholder="e.g. Express 30-Min Dispatch Surge Cap"
                    value={policyTitle}
                    onChange={(e) => setPolicyTitle(e.target.value)}
                    required={Boolean(editingId)}
                  />
                  <AdminTextField
                    label="Config Key Code"
                    placeholder="e.g. EXPRESS_SURGE_CAP"
                    value={policyKeyCode}
                    onChange={(e) => setPolicyKeyCode(e.target.value)}
                  />
                  <AdminTextField
                    label="Configured Value"
                    placeholder="e.g. 15% Max Cap"
                    value={policyValue}
                    onChange={(e) => setPolicyValue(e.target.value)}
                    required={Boolean(editingId)}
                  />
                  <AdminTextField
                    label="Policy Description"
                    placeholder="Operational scope and enforcement note"
                    value={policyDescription}
                    onChange={(e) => setPolicyDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <AdminSelectPills
                    label="Policy Category"
                    options={POLICY_CATEGORY_OPTIONS}
                    value={policyCategory}
                    onChange={setPolicyCategory}
                    columns={3}
                  />
                  <AdminSelectPills
                    label="Enforcement Status"
                    options={POLICY_STATUS_OPTIONS}
                    value={policyStatus}
                    onChange={setPolicyStatus}
                    columns={2}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-surface-frost">
                <div className="flex items-center gap-2 text-xs font-semibold text-ink-secondary">
                  <ShieldCheck className="h-4 w-4 text-accent-success shrink-0" />
                  <span>
                    Artisan identity &amp; bank account verification required
                    before job dispatch and payout
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  {editingId && (
                    <CtaButton
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={resetForm}
                    >
                      Cancel Edit
                    </CtaButton>
                  )}
                  <CtaButton type="submit" variant="primary" size="sm">
                    <Save className="h-4 w-4" />
                    <span>
                      {editingId
                        ? "Update Policy Setting"
                        : policyTitle.trim()
                          ? "Add & Save Policy Setting"
                          : "Save Marketplace Settings"}
                    </span>
                  </CtaButton>
                </div>
              </div>
            </form>
          </AdminInlineForm>
        </div>

        <div className="mt-6 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <AdminSegmentedTabs
            options={tabOptions}
            value={filter}
            onChange={setFilter}
            ariaLabel="Filter settings by category"
            layoutId="settings-tab-pill"
          />

          <AdminSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search setting key, title, or value..."
          />
        </div>

        {/* Settings & Policies Table with Three-Dots Action Button & Dropdown CTAs */}
        <div className="mt-4">
          <AdminDataTable
            title="Platform Settings & Governance Rules Ledger"
            subtitle="Inspect active marketplace configuration rules and use the three-dots action menu to edit, pause, or reset any setting."
            badge={`${filtered.length} Rules`}
            headerAction={
              <CtaButton
                variant="primary"
                size="xs"
                onClick={() => {
                  resetForm();
                  scrollToForm();
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Setting</span>
              </CtaButton>
            }
          >
            {filtered.length === 0 ? (
              <AdminEmptyState
                title="No Matching Settings Found"
                description="Try clearing your search filter or add a new policy rule in the inline form above."
                icon={<Settings className="h-5 w-5 text-accent-sky" />}
              />
            ) : (
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableRow>
                    <AdminTableHead>Setting &amp; Key</AdminTableHead>
                    <AdminTableHead>Category</AdminTableHead>
                    <AdminTableHead>Configured Value</AdminTableHead>
                    <AdminTableHead>Operational Scope</AdminTableHead>
                    <AdminTableHead>Status</AdminTableHead>
                    <AdminTableHead className="text-right">
                      Actions
                    </AdminTableHead>
                  </AdminTableRow>
                </AdminTableHeader>
                <AdminTableBody>
                  {filtered.map((item) => (
                    <AdminTableRow key={item.id}>
                      <AdminTableCell className="whitespace-nowrap">
                        <div className="font-display text-xs font-extrabold text-brand-950">
                          {item.title}
                        </div>
                        <div className="font-mono text-[10px] font-semibold text-brand-600">
                          {item.keyCode} · {item.updatedAt}
                        </div>
                      </AdminTableCell>

                      <AdminTableCell className="whitespace-nowrap">
                        <PillBadge
                          tone="porcelain"
                          className="px-2.5 py-0.5 text-[10px] uppercase"
                        >
                          {item.category}
                        </PillBadge>
                      </AdminTableCell>

                      <AdminTableCell className="whitespace-nowrap">
                        <span className="font-display text-xs sm:text-sm font-extrabold text-brand-950">
                          {item.value}
                        </span>
                      </AdminTableCell>

                      <AdminTableCell className="max-w-[280px]">
                        <p className="truncate text-xs font-medium text-ink-secondary">
                          {item.description}
                        </p>
                      </AdminTableCell>

                      <AdminTableCell>
                        <AdminStatusPill status={item.status} />
                      </AdminTableCell>

                      <AdminTableCell className="text-right whitespace-nowrap">
                        <AdminActionMenu
                          label={`Setting ${item.keyCode}`}
                          ariaLabel={`Actions for setting ${item.title}`}
                          items={[
                            {
                              id: "edit",
                              label: "Edit Setting in Form",
                              description: "Load rule into inline form",
                              icon: <Pencil className="h-3.5 w-3.5" />,
                              variant: "primary",
                              onClick: () => loadPolicyIntoForm(item),
                            },
                            {
                              id: "toggle",
                              label:
                                item.status === "active"
                                  ? "Pause Policy Rule"
                                  : "Activate Policy Rule",
                              description: "Toggle live rule enforcement",
                              icon:
                                item.status === "active" ? (
                                  <Clock className="h-3.5 w-3.5" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                ),
                              onClick: () => togglePolicyStatus(item.id),
                            },
                            {
                              id: "reset",
                              label: "Reset to Default",
                              description: `Restore (${item.defaultValue})`,
                              icon: <RotateCcw className="h-3.5 w-3.5" />,
                              onClick: () => resetPolicyToDefault(item.id),
                            },
                            {
                              id: "delete",
                              label: "Delete Policy Rule",
                              description: "Remove setting from ledger",
                              icon: <Trash2 className="h-3.5 w-3.5" />,
                              variant: "danger",
                              dividerBefore: true,
                              onClick: () => deletePolicy(item.id),
                            },
                          ]}
                        />
                      </AdminTableCell>
                    </AdminTableRow>
                  ))}
                </AdminTableBody>
              </AdminTable>
            )}
          </AdminDataTable>
        </div>
      </AdminWorkspaceSlab>
    </div>
  );
}
