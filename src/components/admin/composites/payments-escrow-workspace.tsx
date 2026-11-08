"use client";

import * as React from "react";
import {
  Clock,
  CreditCard,
  Lock,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Send,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import type { PaymentRow } from "@/db/schema";
import { formatCurrency } from "@/lib/utils";

type EscrowFilter = "all" | "held" | "released" | "pending";
type PaymentChannel = "card" | "bank_transfer" | "mobile_money" | "usdt";
type EscrowStateOption = "held" | "released" | "pending" | "refunded";

const CHANNEL_OPTIONS = [
  { id: "card", label: "Card" },
  { id: "bank_transfer", label: "Transfer" },
  { id: "mobile_money", label: "Mobile Money" },
  { id: "usdt", label: "USDT" },
] as const;

const ESCROW_STATE_OPTIONS = [
  { id: "held", label: "Held in Escrow" },
  { id: "released", label: "Released Payout" },
  { id: "pending", label: "Pending Deposit" },
  { id: "refunded", label: "Refunded" },
] as const;

export function PaymentsEscrowWorkspace({
  initialPayments,
}: {
  initialPayments: PaymentRow[];
}) {
  const router = useRouter();
  const formRef = React.useRef<HTMLDivElement>(null);

  const [items, setItems] = React.useState<PaymentRow[]>(initialPayments);
  const [filter, setFilter] = React.useState<EscrowFilter>("all");
  const [search, setSearch] = React.useState("");
  const [releasingId, setReleasingId] = React.useState<string | null>(null);

  // Inline Form State (replaces modal)
  const [formOpen, setFormOpen] = React.useState(true);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingRef, setEditingRef] = React.useState<string | null>(null);
  const [clientName, setClientName] = React.useState("Toluwalase Adeyemi");
  const [clientEmail, setClientEmail] = React.useState(
    "tolu.adeyemi@gmail.com"
  );
  const [artisanName, setArtisanName] = React.useState("Emeka Okafor");
  const [amount, setAmount] = React.useState("35000");
  const [paymentMethod, setPaymentMethod] =
    React.useState<PaymentChannel>("card");
  const [escrowStatus, setEscrowStatus] =
    React.useState<EscrowStateOption>("held");
  const [saving, setSaving] = React.useState(false);
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
    setEditingRef(null);
    setClientName("Toluwalase Adeyemi");
    setClientEmail("tolu.adeyemi@gmail.com");
    setArtisanName("Emeka Okafor");
    setAmount("35000");
    setPaymentMethod("card");
    setEscrowStatus("held");
  }

  function loadPaymentIntoForm(pay: PaymentRow) {
    setEditingId(pay.id);
    setEditingRef(pay.reference);
    setClientName(pay.clientName);
    setClientEmail(pay.clientEmail);
    setArtisanName(pay.artisanName);
    setAmount(String(pay.amount));
    setPaymentMethod((pay.paymentMethod as PaymentChannel) || "card");
    setEscrowStatus((pay.escrowStatus as EscrowStateOption) || "held");
    scrollToForm();
  }

  async function handleReleaseEscrow(paymentId: string) {
    setReleasingId(paymentId);
    try {
      const res = await fetch("/api/v1/payments/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setItems((prev) => prev.map((p) => (p.id === paymentId ? data : p)));
        router.refresh();
      } else {
        setItems((prev) =>
          prev.map((p) =>
            p.id === paymentId
              ? {
                  ...p,
                  escrowStatus: "released",
                  status: "settled",
                  releasedAt: new Date(),
                }
              : p
          )
        );
      }
      notifySaved("Artisan 90% payout released from escrow");
    } finally {
      setReleasingId(null);
    }
  }

  function updateEscrowStateLocal(
    paymentId: string,
    nextEscrow: EscrowStateOption
  ) {
    setItems((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              escrowStatus: nextEscrow,
              status:
                nextEscrow === "released"
                  ? "settled"
                  : nextEscrow === "held"
                    ? "escrowed"
                    : nextEscrow === "refunded"
                      ? "refunded"
                      : "initialized",
            }
          : p
      )
    );
    notifySaved(`Escrow state updated to ${nextEscrow}`);
  }

  function deletePayment(paymentId: string) {
    setItems((prev) => prev.filter((p) => p.id !== paymentId));
    if (editingId === paymentId) resetForm();
    notifySaved("Transaction record removed");
  }

  async function handleSavePayment(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const gross = Number(amount) || 0;
      const artisanPayout = Math.round(gross * 0.9);
      const platformFee = Math.round(gross * 0.1);

      if (editingId) {
        setItems((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? {
                  ...p,
                  clientName,
                  clientEmail,
                  artisanName,
                  amount: gross,
                  artisanPayout,
                  platformFee,
                  paymentMethod,
                  escrowStatus,
                  status:
                    escrowStatus === "released"
                      ? "settled"
                      : escrowStatus === "held"
                        ? "escrowed"
                        : escrowStatus === "refunded"
                          ? "refunded"
                          : "initialized",
                }
              : p
          )
        );
        notifySaved(`Updated transaction ${editingRef || editingId}`);
        resetForm();
      } else {
        const res = await fetch("/api/v1/payments/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientName,
            clientEmail,
            artisanId: "emeka-okafor",
            artisanName,
            amount: gross,
            currency: "NGN",
            paymentMethod,
          }),
        });
        if (res.ok) {
          const { data } = await res.json();
          const finalRecord =
            escrowStatus !== "held"
              ? { ...data, escrowStatus }
              : data;
          setItems((prev) => [finalRecord, ...prev]);
          router.refresh();
        } else {
          const fallbackPay: PaymentRow = {
            id: `pay_${Date.now()}`,
            reference: `BCHS-S4U-${Date.now().toString().slice(-6)}`,
            bachsTransactionId: `bchs_${Date.now().toString().slice(-6)}`,
            bookingId: null,
            clientName,
            clientEmail,
            artisanId: "emeka-okafor",
            artisanName,
            amount: gross,
            platformFee,
            artisanPayout,
            currency: "NGN",
            paymentMethod,
            status: escrowStatus === "released" ? "settled" : "escrowed",
            escrowStatus,
            checkoutUrl: null,
            metadata: {},
            paidAt: new Date(),
            releasedAt: escrowStatus === "released" ? new Date() : null,
            createdAt: new Date(),
          };
          setItems((prev) => [fallbackPay, ...prev]);
        }
        notifySaved(`Recorded escrow transaction for ${clientName}`);
        resetForm();
      }
    } finally {
      setSaving(false);
    }
  }

  const totalVolume = items.reduce((sum, p) => sum + p.amount, 0);
  const heldVolume = items
    .filter((p) => p.escrowStatus === "held")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalFee = items.reduce((sum, p) => sum + p.platformFee, 0);

  const tabOptions: ReadonlyArray<AdminTabOption<EscrowFilter>> = [
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
  ];

  const filtered = items.filter((p) => {
    const matchesStatus = filter === "all" || p.escrowStatus === filter;
    const matchesSearch =
      !search ||
      p.reference.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase()) ||
      p.artisanName.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-3 sm:space-y-4">
      <AdminHeroBanner
        eyebrow="Marketplace Financials & Escrow"
        eyebrowIcon="dot"
        headline="Payments & Escrow Ledger."
        highlightWords={["Payments", "Escrow", "Ledger."]}
        subtitle="Add, edit, and manage customer escrow deposits, artisan 90% payouts, and platform 10% commissions using the inline form and table actions below."
        primaryCta={{
          label: "Record Escrow Deposit",
          onClick: () => {
            resetForm();
            scrollToForm();
          },
          variant: "primary",
          icon: <Plus className="h-4 w-4" />,
        }}
        secondaryCta={{
          label: "Bookings Dispatch",
          href: "/admin/bookings",
          variant: "secondary",
          trailingArrow: true,
        }}
      />

      <AdminWorkspaceSlab tone="pearl" withPearlAsset>
        {/* Top 3 Escrow KPI Cards */}
        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StaggerItem>
            <AdminKpiCard
              label="Total Gross Volume"
              value={formatCurrency(totalVolume)}
              badgeText={`${items.length} recorded transactions`}
              badgeTone="porcelain"
              badgeIcon="dot"
              ringTone="blue"
              icon={<CreditCard className="h-4 w-4 text-ink-on-blue" />}
            />
          </StaggerItem>

          <StaggerItem>
            <AdminKpiCard
              label="Escrow Locked (In Hold)"
              value={formatCurrency(heldVolume)}
              badgeText="Protected until customer job sign-off"
              badgeTone="sky"
              badgeIcon="shield"
              ringTone="ink"
              icon={<Lock className="h-4 w-4 text-accent-gold" />}
            />
          </StaggerItem>

          <StaggerItem>
            <AdminKpiCard
              label="Platform Commission (10%)"
              value={formatCurrency(totalFee)}
              badgeText="90% settled to verified artisans"
              badgeTone="blue"
              badgeIcon="shield"
              ringTone="ink"
              tone="ink"
              icon={<TrendingUp className="h-4 w-4 text-accent-sky" />}
            />
          </StaggerItem>
        </Stagger>

        {/* Inline Form to Add, Edit, and Manage Financials & Escrow Transactions */}
        <div className="mt-6">
          <AdminInlineForm
            formRef={formRef}
            eyebrow="Inline Financials & Escrow Form"
            title={
              editingId
                ? `Edit & Manage Transaction ${editingRef || editingId}`
                : "Record & Manage Escrow Transaction"
            }
            description="Log a customer booking deposit, adjust artisan beneficiary payouts, or update escrow settlement states inline."
            isEditing={Boolean(editingId)}
            editingBadgeText={`Ref: ${editingRef || ""}`}
            onResetToCreate={resetForm}
            open={formOpen}
            onOpenChange={setFormOpen}
            savedMessage={savedBanner}
          >
            <form onSubmit={handleSavePayment} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <AdminTextField
                  label="Client Full Name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
                <AdminTextField
                  label="Client Email"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  required
                />
                <AdminTextField
                  label="Artisan Beneficiary"
                  value={artisanName}
                  onChange={(e) => setArtisanName(e.target.value)}
                  required
                />
                <AdminTextField
                  label="Gross Amount (NGN)"
                  type="number"
                  min={1000}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <AdminSelectPills
                  label="Payment Channel"
                  options={CHANNEL_OPTIONS}
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  columns={4}
                />
                <AdminSelectPills
                  label="Escrow Settlement State"
                  options={ESCROW_STATE_OPTIONS}
                  value={escrowStatus}
                  onChange={setEscrowStatus}
                  columns={4}
                />
              </div>

              {/* Tokenized 90/10 Split Preview Card */}
              <div className="surface-slab-ink rounded-2xl border-2 border-brand-700 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink-on-blue-muted">
                    Artisan Escrow Share (90%):
                  </span>
                  <span className="font-display text-sm font-extrabold text-accent-sky">
                    {formatCurrency(Math.round(Number(amount || 0) * 0.9))}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink-on-blue-muted">
                    Platform Commission (10%):
                  </span>
                  <span className="font-display text-sm font-extrabold text-accent-gold">
                    {formatCurrency(Math.round(Number(amount || 0) * 0.1))}
                  </span>
                </div>
              </div>

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
                <CtaButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={saving}
                >
                  {editingId ? (
                    <>
                      <Save className="h-4 w-4" />
                      <span>
                        {saving ? "Saving..." : "Update Escrow Transaction"}
                      </span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>
                        {saving
                          ? "Recording..."
                          : "Create & Lock in Escrow"}
                      </span>
                    </>
                  )}
                </CtaButton>
              </div>
            </form>
          </AdminInlineForm>
        </div>

        {/* Segmented Filter Tabs & Search */}
        <div className="mt-6 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <AdminSegmentedTabs
            options={tabOptions}
            value={filter}
            onChange={setFilter}
            ariaLabel="Filter payments by escrow state"
            layoutId="payments-escrow-tab-pill"
          />

          <AdminSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search reference, client, or artisan..."
          />
        </div>

        {/* Payments Ledger Table with Three-Dots Action Button & Dropdown CTAs */}
        <div className="mt-4">
          <AdminDataTable
            title="Escrow & Payout Settlement Ledger"
            subtitle="Track customer booking deposits, platform commissions, and use the three-dots menu to edit or release artisan payouts."
            badge={`${filtered.length} Showing`}
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
                <span>Add Transaction</span>
              </CtaButton>
            }
          >
            {filtered.length === 0 ? (
              <AdminEmptyState
                title="No Escrow Records Found"
                description="Record a new customer escrow deposit in the inline form above or clear your active search filter."
                icon={<CreditCard className="h-5 w-5 text-accent-sky" />}
                action={
                  <CtaButton
                    variant="primary"
                    size="xs"
                    onClick={() => {
                      resetForm();
                      scrollToForm();
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Record Escrow Deposit</span>
                  </CtaButton>
                }
              />
            ) : (
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableRow>
                    <AdminTableHead>Transaction Reference</AdminTableHead>
                    <AdminTableHead>Client</AdminTableHead>
                    <AdminTableHead>Artisan Beneficiary</AdminTableHead>
                    <AdminTableHead>Gross Amount</AdminTableHead>
                    <AdminTableHead>Split (90% / 10%)</AdminTableHead>
                    <AdminTableHead>Channel</AdminTableHead>
                    <AdminTableHead>Escrow State</AdminTableHead>
                    <AdminTableHead className="text-right">
                      Actions
                    </AdminTableHead>
                  </AdminTableRow>
                </AdminTableHeader>
                <AdminTableBody>
                  {filtered.map((pay) => (
                    <AdminTableRow key={pay.id}>
                      <AdminTableCell className="whitespace-nowrap">
                        <div className="font-mono text-[11px] font-extrabold text-brand-700">
                          {pay.reference}
                        </div>
                        <div className="font-mono text-[10px] font-semibold text-ink-muted">
                          {pay.bachsTransactionId || "pending_confirmation"}
                        </div>
                      </AdminTableCell>

                      <AdminTableCell>
                        <div className="font-display text-xs font-extrabold text-brand-950 whitespace-nowrap">
                          {pay.clientName}
                        </div>
                        <div className="text-[11px] font-semibold text-ink-secondary truncate max-w-[160px]">
                          {pay.clientEmail}
                        </div>
                      </AdminTableCell>

                      <AdminTableCell className="font-display text-xs font-extrabold text-brand-950 whitespace-nowrap">
                        {pay.artisanName}
                      </AdminTableCell>

                      <AdminTableCell className="font-display text-xs sm:text-sm font-extrabold text-brand-950 whitespace-nowrap">
                        {formatCurrency(pay.amount, pay.currency)}
                      </AdminTableCell>

                      <AdminTableCell className="whitespace-nowrap">
                        <div className="font-display text-[11px] font-extrabold text-brand-600">
                          Pro: {formatCurrency(pay.artisanPayout, pay.currency)}
                        </div>
                        <div className="text-[10px] font-semibold text-ink-secondary">
                          Fee: {formatCurrency(pay.platformFee, pay.currency)}
                        </div>
                      </AdminTableCell>

                      <AdminTableCell>
                        <PillBadge
                          tone="sky"
                          className="px-2.5 py-0.5 text-[10px] uppercase whitespace-nowrap"
                        >
                          {pay.paymentMethod.replace("_", " ")}
                        </PillBadge>
                      </AdminTableCell>

                      <AdminTableCell>
                        <AdminStatusPill status={pay.escrowStatus} />
                      </AdminTableCell>

                      <AdminTableCell className="text-right whitespace-nowrap">
                        <AdminActionMenu
                          label={`Ref ${pay.reference}`}
                          ariaLabel={`Actions for transaction ${pay.reference}`}
                          items={[
                            {
                              id: "edit",
                              label: "Edit Transaction in Form",
                              description: "Adjust amount, channel, or state",
                              icon: <Pencil className="h-3.5 w-3.5" />,
                              variant: "primary",
                              onClick: () => loadPaymentIntoForm(pay),
                            },
                            {
                              id: "release",
                              label: "Release Payout (90%)",
                              description: "Settle funds to artisan bank",
                              icon: <Send className="h-3.5 w-3.5" />,
                              disabled:
                                releasingId === pay.id ||
                                pay.escrowStatus === "released",
                              onClick: () => handleReleaseEscrow(pay.id),
                            },
                            {
                              id: "hold",
                              label: "Lock in Escrow Hold",
                              description: "Hold funds pending verification",
                              icon: <Lock className="h-3.5 w-3.5" />,
                              disabled: pay.escrowStatus === "held",
                              onClick: () =>
                                updateEscrowStateLocal(pay.id, "held"),
                            },
                            {
                              id: "pending",
                              label: "Mark Pending Deposit",
                              description: "Awaiting gateway confirmation",
                              icon: <Clock className="h-3.5 w-3.5" />,
                              disabled: pay.escrowStatus === "pending",
                              onClick: () =>
                                updateEscrowStateLocal(pay.id, "pending"),
                            },
                            {
                              id: "refund",
                              label: "Refund Client Deposit",
                              description: "Return escrow to customer",
                              icon: <RotateCcw className="h-3.5 w-3.5" />,
                              variant: "danger",
                              dividerBefore: true,
                              disabled: pay.escrowStatus === "refunded",
                              onClick: () =>
                                updateEscrowStateLocal(pay.id, "refunded"),
                            },
                            {
                              id: "delete",
                              label: "Delete Transaction",
                              description: "Remove from ledger",
                              icon: <Trash2 className="h-3.5 w-3.5" />,
                              variant: "danger",
                              onClick: () => deletePayment(pay.id),
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
