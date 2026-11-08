"use client";

import * as React from "react";
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  Plus,
  Send,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
  AdminSearchInput,
  AdminSelectPills,
  AdminTextField,
} from "@/components/admin/ui/admin-form-controls";
import {
  AdminHeroBanner,
  AdminWorkspaceSlab,
} from "@/components/admin/ui/admin-hero-banner";
import { AdminKpiCard } from "@/components/admin/ui/admin-kpi-card";
import { AdminModal } from "@/components/admin/ui/admin-modal";
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

const CHANNEL_OPTIONS = [
  { id: "card", label: "Card" },
  { id: "bank_transfer", label: "Transfer" },
  { id: "mobile_money", label: "Mobile Money" },
  { id: "usdt", label: "USDT" },
] as const;

export function PaymentsEscrowWorkspace({
  initialPayments,
}: {
  initialPayments: PaymentRow[];
}) {
  const router = useRouter();
  const [items, setItems] = React.useState<PaymentRow[]>(initialPayments);
  const [filter, setFilter] = React.useState<EscrowFilter>("all");
  const [search, setSearch] = React.useState("");
  const [releasingId, setReleasingId] = React.useState<string | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  // New Bachs checkout simulation fields
  const [clientName, setClientName] = React.useState("Toluwalase Adeyemi");
  const [clientEmail, setClientEmail] = React.useState(
    "tolu.adeyemi@gmail.com"
  );
  const [artisanName, setArtisanName] = React.useState("Emeka Okafor");
  const [amount, setAmount] = React.useState("35000");
  const [paymentMethod, setPaymentMethod] =
    React.useState<PaymentChannel>("card");
  const [creating, setCreating] = React.useState(false);

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
      }
    } finally {
      setReleasingId(null);
    }
  }

  async function handleInitializePayment(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/v1/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          clientEmail,
          artisanId: "emeka-okafor",
          artisanName,
          amount: Number(amount),
          currency: "NGN",
          paymentMethod,
        }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setItems((prev) => [data, ...prev]);
        setModalOpen(false);
        router.refresh();
      }
    } finally {
      setCreating(false);
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
    <div className="space-y-2 sm:space-y-4">
      <AdminHeroBanner
        eyebrow="Bachs.io Multi-Currency Escrow"
        eyebrowIcon="dot"
        headline="Payments & Escrow Ledger."
        highlightWords={["Payments", "Escrow", "Ledger."]}
        subtitle="Audit client escrow deposits, track the 90% Artisan / 10% Platform commission split, and trigger instant NUBAN bank settlements."
        primaryCta={{
          label: "Initialize Bachs.io Checkout",
          onClick: () => setModalOpen(true),
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
              badgeText={`${items.length} Bachs.io transactions`}
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
              badgeText="Protected until job sign-off"
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

        {/* Payments Ledger Table */}
        <div className="mt-4">
          <AdminDataTable
            title="Bachs.io Escrow & Settlement Ledger"
            subtitle="All marketplace deposits, 10% platform commissions, and 90% artisan bank settlements."
            badge={`${filtered.length} Showing`}
          >
            {filtered.length === 0 ? (
              <AdminEmptyState
                title="No Escrow Records Found"
                description="Initialize a new Bachs.io checkout deposit or clear your search filter."
                icon={<CreditCard className="h-5 w-5 text-accent-sky" />}
                action={
                  <CtaButton
                    variant="primary"
                    size="xs"
                    onClick={() => setModalOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Initialize Bachs.io Checkout</span>
                  </CtaButton>
                }
              />
            ) : (
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableRow>
                    <AdminTableHead>Bachs Reference</AdminTableHead>
                    <AdminTableHead>Client</AdminTableHead>
                    <AdminTableHead>Artisan Beneficiary</AdminTableHead>
                    <AdminTableHead>Gross Amount</AdminTableHead>
                    <AdminTableHead>Split (90% / 10%)</AdminTableHead>
                    <AdminTableHead>Channel</AdminTableHead>
                    <AdminTableHead>Escrow State</AdminTableHead>
                    <AdminTableHead className="text-right">
                      Settlement Action
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
                          {pay.bachsTransactionId || "awaiting_webhook"}
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
                        {pay.escrowStatus === "held" ? (
                          <CtaButton
                            variant="primary"
                            size="xs"
                            disabled={releasingId === pay.id}
                            onClick={() => handleReleaseEscrow(pay.id)}
                          >
                            {releasingId === pay.id ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Settling...</span>
                              </>
                            ) : (
                              <>
                                <Send className="h-3 w-3" />
                                <span>Release Payout</span>
                              </>
                            )}
                          </CtaButton>
                        ) : pay.escrowStatus === "released" ? (
                          <span className="inline-flex items-center gap-1 rounded-pill bg-brand-50 px-2.5 py-1 font-display text-[11px] font-extrabold text-brand-700 border border-brand-200">
                            <CheckCircle2 className="h-3 w-3 text-accent-success" />
                            <span>Settled</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-ink-muted">
                            Awaiting Deposit
                          </span>
                        )}
                      </AdminTableCell>
                    </AdminTableRow>
                  ))}
                </AdminTableBody>
              </AdminTable>
            )}
          </AdminDataTable>
        </div>
      </AdminWorkspaceSlab>

      {/* Initialize Bachs.io Checkout Modal */}
      <AdminModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        eyebrow="Bachs.io Escrow Deposit"
        title="Initialize Escrow Checkout"
        description="Creates a new transaction via `/api/v1/payments/initialize` and locks the 90/10 marketplace escrow split."
      >
        <form onSubmit={handleInitializePayment} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AdminTextField
              label="Client Name"
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
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

          <AdminSelectPills
            label="Bachs.io Payment Channel"
            options={CHANNEL_OPTIONS}
            value={paymentMethod}
            onChange={setPaymentMethod}
          />

          {/* Tokenized 90/10 Split Preview Card */}
          <div className="surface-slab-ink rounded-2xl border-2 border-brand-700 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink-on-blue-muted">
                Artisan Escrow Share (90%):
              </span>
              <span className="font-display text-sm font-extrabold text-accent-sky">
                {formatCurrency(Math.round(Number(amount || 0) * 0.9))}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink-on-blue-muted">
                Platform Commission (10%):
              </span>
              <span className="font-display text-sm font-extrabold text-accent-gold">
                {formatCurrency(Math.round(Number(amount || 0) * 0.1))}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-surface-frost">
            <CtaButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </CtaButton>
            <CtaButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={creating}
            >
              {creating ? "Initializing..." : "Create & Lock in Escrow"}
            </CtaButton>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

