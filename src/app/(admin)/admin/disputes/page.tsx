"use client";

import * as React from "react";
import {
  CheckCircle2,
  Lock,
  Pencil,
  Plus,
  Save,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { AdminActionMenu } from "@/components/admin/ui/admin-action-menu";
import {
  AdminCheckbox,
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
  AdminTextareaField,
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
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { formatCurrency } from "@/lib/utils";

type DisputeFilter = "all" | "disputed" | "held" | "resolved";
type DisputeStatus = "disputed" | "held" | "resolved";

interface DisputeItem {
  id: string;
  caseCode: string;
  bookingCode: string;
  clientName: string;
  artisanName: string;
  serviceTitle: string;
  escrowAmount: number;
  reason: string;
  status: DisputeStatus;
  createdAt: string;
}

const INITIAL_DISPUTES: DisputeItem[] = [
  {
    id: "dsp_1",
    caseCode: "DSP-9041",
    bookingCode: "S4U-8821",
    clientName: "Chidinma Nwosu",
    artisanName: "Emeka Okafor",
    serviceTitle: "Pumping Machine & Tank Valve Replacement",
    escrowAmount: 28000,
    reason: "Secondary pressure valve requires follow-up calibration.",
    status: "disputed",
    createdAt: "Today, 11:20 AM",
  },
  {
    id: "dsp_2",
    caseCode: "DSP-9038",
    bookingCode: "S4U-8794",
    clientName: "Ibrahim Danjuma",
    artisanName: "Musa Abdullahi",
    serviceTitle: "Split A.C Compressor & Gas Refill",
    escrowAmount: 35000,
    reason: "Client requested cooling inspection before 90% release.",
    status: "held",
    createdAt: "Yesterday, 4:15 PM",
  },
  {
    id: "dsp_3",
    caseCode: "DSP-9019",
    bookingCode: "S4U-8710",
    clientName: "Toluwalase Adeyemi",
    artisanName: "Segun Adebayo",
    serviceTitle: "Custom Wardrobe & Door Hinge Alignment",
    escrowAmount: 42000,
    reason: "Resolved after on-site carpentry touch-up sign-off.",
    status: "resolved",
    createdAt: "Nov 05, 2026",
  },
];

const DISPUTE_STATUS_OPTIONS = [
  { id: "disputed", label: "Active Dispute" },
  { id: "held", label: "Escrow Frozen" },
  { id: "resolved", label: "Resolved & Settled" },
] as const;

export default function AdminDisputesPage() {
  const formRef = React.useRef<HTMLDivElement>(null);

  const [items, setItems] = React.useState<DisputeItem[]>(INITIAL_DISPUTES);
  const [filter, setFilter] = React.useState<DisputeFilter>("all");
  const [search, setSearch] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Inline Form State
  const [formOpen, setFormOpen] = React.useState(true);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingCaseCode, setEditingCaseCode] = React.useState<string | null>(
    null
  );
  const [bookingCode, setBookingCode] = React.useState("S4U-8890");
  const [clientName, setClientName] = React.useState("");
  const [artisanName, setArtisanName] = React.useState("Emeka Okafor");
  const [serviceTitle, setServiceTitle] = React.useState(
    "Split A.C Servicing & Gas Refill"
  );
  const [escrowAmount, setEscrowAmount] = React.useState("25000");
  const [status, setStatus] = React.useState<DisputeStatus>("disputed");
  const [reason, setReason] = React.useState("");
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
    setEditingCaseCode(null);
    setBookingCode(`S4U-${8890 + items.length}`);
    setClientName("");
    setArtisanName("Emeka Okafor");
    setServiceTitle("Split A.C Servicing & Gas Refill");
    setEscrowAmount("25000");
    setStatus("disputed");
    setReason("");
  }

  function loadDisputeIntoForm(item: DisputeItem) {
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
  }

  function handleSaveDispute(e: React.FormEvent) {
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
  }

  function updateDisputeStatus(id: string, nextStatus: DisputeStatus) {
    setItems((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: nextStatus } : d))
    );
    notifySaved(`Case status updated to ${nextStatus}`);
  }

  function deleteDispute(id: string) {
    setItems((prev) => prev.filter((d) => d.id !== id));
    if (editingId === id) resetForm();
    notifySaved("Dispute case removed");
  }

  const openCount = items.filter((d) => d.status !== "resolved").length;
  const frozenEscrow = items
    .filter((d) => d.status !== "resolved")
    .reduce((sum, d) => sum + d.escrowAmount, 0);
  const resolvedCount = items.filter((d) => d.status === "resolved").length;

  const tabOptions: ReadonlyArray<AdminTabOption<DisputeFilter>> = [
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
  ];

  const filtered = items.filter((d) => {
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

  return (
    <div className="space-y-3 sm:space-y-4">
      <AdminHeroBanner
        eyebrow="Customer & Artisan Case Resolution"
        eyebrowIcon="shield"
        headline="Disputes & Escrow Resolution."
        highlightWords={["Disputes", "Escrow", "Resolution."]}
        subtitle="Open, edit, and arbitrate service claims between customers and artisans using the inline form below, or use the table three-dots action menu."
        primaryCta={{
          label: "Open Dispute Case",
          onClick: () => {
            resetForm();
            scrollToForm();
          },
          variant: "primary",
          icon: <Plus className="h-4 w-4" />,
        }}
        secondaryCta={{
          label: "Open Financials Ledger",
          href: "/admin/financials",
          variant: "secondary",
          trailingArrow: true,
        }}
      />

      <AdminWorkspaceSlab tone="pearl" withPearlAsset>
        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StaggerItem>
            <AdminKpiCard
              label="Active Dispute Cases"
              value={`${openCount}`}
              numericValue={openCount}
              badgeText="Awaiting case resolution sign-off"
              badgeTone="porcelain"
              badgeIcon="dot"
              ringTone="blue"
              icon={<Scale className="h-4 w-4 text-ink-on-blue" />}
            />
          </StaggerItem>

          <StaggerItem>
            <AdminKpiCard
              label="Escrow Frozen in Dispute"
              value={formatCurrency(frozenEscrow)}
              badgeText="Held safely during case review"
              badgeTone="sky"
              badgeIcon="shield"
              ringTone="ink"
              icon={<Lock className="h-4 w-4 text-accent-gold" />}
            />
          </StaggerItem>

          <StaggerItem>
            <AdminKpiCard
              label="Resolved Arbitrations"
              value={`${resolvedCount}`}
              numericValue={resolvedCount}
              badgeText="100% SLA resolution compliance"
              badgeTone="blue"
              badgeIcon="shield"
              ringTone="ink"
              tone="ink"
              icon={<ShieldCheck className="h-4 w-4 text-accent-sky" />}
            />
          </StaggerItem>
        </Stagger>

        {/* Inline Form to Add, Edit, and Arbitrate Disputes */}
        <div className="mt-6">
          <AdminInlineForm
            formRef={formRef}
            eyebrow="Inline Dispute Arbitration Form"
            title={
              editingId
                ? `Edit & Arbitrate Case ${editingCaseCode || editingId}`
                : "Open, Edit & Arbitrate Dispute Case"
            }
            description="Log a new customer or artisan claim, freeze escrow funds during investigation, or select any row from the table menu below to edit arbitration findings."
            isEditing={Boolean(editingId)}
            editingBadgeText={`Case ${editingCaseCode || ""}`}
            onResetToCreate={resetForm}
            open={formOpen}
            onOpenChange={setFormOpen}
            savedMessage={savedBanner}
          >
            <form onSubmit={handleSaveDispute} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <AdminTextField
                  label="Booking Reference"
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value)}
                  required
                />
                <AdminTextField
                  label="Client Full Name"
                  placeholder="e.g. Chidinma Nwosu"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
                <AdminTextField
                  label="Assigned Artisan Pro"
                  value={artisanName}
                  onChange={(e) => setArtisanName(e.target.value)}
                  required
                />
                <AdminTextField
                  label="Service Title"
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  required
                />
                <AdminTextField
                  label="Frozen Escrow (NGN)"
                  type="number"
                  min={1000}
                  value={escrowAmount}
                  onChange={(e) => setEscrowAmount(e.target.value)}
                  required
                />
              </div>

              <AdminSelectPills
                label="Arbitration & Escrow State"
                options={DISPUTE_STATUS_OPTIONS}
                value={status}
                onChange={setStatus}
                columns={3}
              />

              <AdminTextareaField
                label="Claim Reason & Arbitration Notes"
                placeholder="Document the customer complaint, artisan inspection evidence, and settlement decision..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                required
              />

              <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-surface-frost">
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
                  {editingId ? (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Arbitration Decision</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Open Dispute &amp; Hold Escrow</span>
                    </>
                  )}
                </CtaButton>
              </div>
            </form>
          </AdminInlineForm>
        </div>

        <div className="mt-6 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <AdminSegmentedTabs
            options={tabOptions}
            value={filter}
            onChange={setFilter}
            ariaLabel="Filter disputes by state"
            layoutId="disputes-tab-pill"
          />

          <AdminSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search case code, booking, client, or artisan..."
          />
        </div>

        {/* Disputes Table with Checkboxes, Bulk Actions & Three-Dots Menu */}
        <div className="mt-4">
          <AdminDataTable
            title="Marketplace Dispute & Arbitration Queue"
            subtitle="Review customer and artisan reports, mediate service quality claims, and use the three-dots menu to edit or settle."
            badge={`${filtered.length} Showing`}
            selectedCount={selectedIds.length}
            bulkActions={
              <>
                <CtaButton
                  variant="secondary"
                  size="xs"
                  onClick={() => {
                    setItems((prev) =>
                      prev.map((i) =>
                        selectedIds.includes(i.id)
                          ? { ...i, status: "resolved" }
                          : i
                      )
                    );
                    notifySaved(`Resolved ${selectedIds.length} dispute(s)`);
                    setSelectedIds([]);
                  }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent-success" />
                  <span>Resolve Selected</span>
                </CtaButton>
                <CtaButton
                  variant="secondary"
                  size="xs"
                  className="text-accent-error hover:border-accent-error/40 hover:text-accent-error"
                  onClick={() => {
                    const toDelete = selectedIds.length;
                    setItems((prev) =>
                      prev.filter((i) => !selectedIds.includes(i.id))
                    );
                    notifySaved(`Removed ${toDelete} dispute record(s)`);
                    setSelectedIds([]);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Selected</span>
                </CtaButton>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-xs font-bold text-ink-secondary hover:text-brand-900 transition-colors px-1"
                >
                  Clear
                </button>
              </>
            }
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
                <span>Open Case</span>
              </CtaButton>
            }
          >
            {filtered.length === 0 ? (
              <AdminEmptyState
                title="No Dispute Cases Found"
                description="All marketplace dispatches are currently operating without open arbitration claims."
                icon={<ShieldAlert className="h-5 w-5 text-accent-sky" />}
              />
            ) : (
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableRow>
                    <AdminTableHead className="w-10">
                      <AdminCheckbox
                        aria-label="Select all disputes"
                        checked={
                          filtered.length > 0 &&
                          filtered.every((i) => selectedIds.includes(i.id))
                        }
                        indeterminate={
                          filtered.some((i) => selectedIds.includes(i.id)) &&
                          !filtered.every((i) => selectedIds.includes(i.id))
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds((prev) => [
                              ...prev,
                              ...filtered
                                .filter((i) => !prev.includes(i.id))
                                .map((i) => i.id),
                            ]);
                          } else {
                            const filteredIds = new Set(filtered.map((i) => i.id));
                            setSelectedIds((prev) =>
                              prev.filter((id) => !filteredIds.has(id))
                            );
                          }
                        }}
                      />
                    </AdminTableHead>
                    <AdminTableHead>Case &amp; Booking</AdminTableHead>
                    <AdminTableHead>Client &amp; Artisan</AdminTableHead>
                    <AdminTableHead>Service</AdminTableHead>
                    <AdminTableHead>Frozen Escrow</AdminTableHead>
                    <AdminTableHead>Status</AdminTableHead>
                    <AdminTableHead className="text-right">
                      Actions
                    </AdminTableHead>
                  </AdminTableRow>
                </AdminTableHeader>
                <AdminTableBody>
                  {filtered.map((item) => (
                    <AdminTableRow
                      key={item.id}
                      isSelected={selectedIds.includes(item.id)}
                    >
                      <AdminTableCell className="w-10">
                        <AdminCheckbox
                          aria-label={`Select dispute case ${item.caseCode}`}
                          checked={selectedIds.includes(item.id)}
                          onChange={() => {
                            setSelectedIds((prev) =>
                              prev.includes(item.id)
                                ? prev.filter((id) => id !== item.id)
                                : [...prev, item.id]
                            );
                          }}
                        />
                      </AdminTableCell>

                      <AdminTableCell className="whitespace-nowrap">
                        <div className="font-mono text-xs font-extrabold text-brand-700">
                          {item.caseCode}
                        </div>
                        <div className="font-mono text-[10px] font-semibold text-ink-muted">
                          Booking: {item.bookingCode}
                        </div>
                      </AdminTableCell>

                      <AdminTableCell className="whitespace-nowrap">
                        <div className="font-display text-xs font-extrabold text-brand-950">
                          {item.clientName}
                        </div>
                        <div className="text-[11px] font-semibold text-brand-600">
                          Pro: {item.artisanName}
                        </div>
                      </AdminTableCell>

                      <AdminTableCell className="max-w-[240px]">
                        <div className="truncate font-display text-xs font-extrabold text-brand-950">
                          {item.serviceTitle}
                        </div>
                      </AdminTableCell>

                      <AdminTableCell className="whitespace-nowrap">
                        <span className="font-display text-xs font-extrabold text-brand-950">
                          {formatCurrency(item.escrowAmount)}
                        </span>
                      </AdminTableCell>

                      <AdminTableCell>
                        <AdminStatusPill
                          status={
                            item.status === "resolved"
                              ? "completed"
                              : item.status
                          }
                        />
                      </AdminTableCell>

                      <AdminTableCell className="text-right whitespace-nowrap">
                        <AdminActionMenu
                          label={`Case ${item.caseCode}`}
                          ariaLabel={`Actions for dispute case ${item.caseCode}`}
                          items={[
                            {
                              id: "edit",
                              label: "Edit & Arbitrate in Form",
                              description: "Load case into inline form",
                              icon: <Pencil className="h-3.5 w-3.5" />,
                              variant: "primary",
                              onClick: () => loadDisputeIntoForm(item),
                            },
                            {
                              id: "resolve",
                              label: "Resolve & Release Escrow",
                              description: "Authorize settlement payout",
                              icon: <CheckCircle2 className="h-3.5 w-3.5" />,
                              disabled: item.status === "resolved",
                              onClick: () =>
                                updateDisputeStatus(item.id, "resolved"),
                            },
                            {
                              id: "freeze",
                              label: "Freeze Escrow in Hold",
                              description: "Lock funds pending inspection",
                              icon: <Lock className="h-3.5 w-3.5" />,
                              disabled: item.status === "held",
                              onClick: () =>
                                updateDisputeStatus(item.id, "held"),
                            },
                            {
                              id: "dispute",
                              label: "Flag Active Dispute",
                              description: "Reopen arbitration review",
                              icon: <Scale className="h-3.5 w-3.5" />,
                              disabled: item.status === "disputed",
                              onClick: () =>
                                updateDisputeStatus(item.id, "disputed"),
                            },
                            {
                              id: "delete",
                              label: "Delete Case Record",
                              description: "Remove from dispute ledger",
                              icon: <Trash2 className="h-3.5 w-3.5" />,
                              variant: "danger",
                              dividerBefore: true,
                              onClick: () => deleteDispute(item.id),
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
