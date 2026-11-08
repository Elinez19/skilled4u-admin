"use client";

import * as React from "react";
import {
  CheckCircle2,
  Lock,
  Scale,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
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
import { AdminSearchInput } from "@/components/admin/ui/admin-form-controls";
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
import { formatCurrency } from "@/lib/utils";

type DisputeFilter = "all" | "disputed" | "held" | "resolved";

interface DisputeItem {
  id: string;
  caseCode: string;
  bookingCode: string;
  clientName: string;
  artisanName: string;
  serviceTitle: string;
  escrowAmount: number;
  reason: string;
  status: "disputed" | "held" | "resolved";
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

export default function AdminDisputesPage() {
  const [items, setItems] = React.useState<DisputeItem[]>(INITIAL_DISPUTES);
  const [filter, setFilter] = React.useState<DisputeFilter>("all");
  const [search, setSearch] = React.useState("");

  function resolveDispute(id: string) {
    setItems((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "resolved" } : d))
    );
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
        eyebrow="Bachs.io Escrow Arbitration Desk"
        eyebrowIcon="shield"
        headline="Disputes & Escrow Resolution."
        highlightWords={["Disputes", "Escrow", "Resolution."]}
        subtitle="Audit client-artisan job claims, freeze or release locked 90/10 Bachs.io escrow funds, and enforce marketplace quality guarantees."
        primaryCta={{
          label: "Open Financials Ledger",
          href: "/admin/financials",
          variant: "primary",
          trailingArrow: true,
        }}
        secondaryCta={{
          label: "Bookings Dispatch",
          href: "/admin/bookings",
          variant: "secondary",
        }}
      />

      <AdminWorkspaceSlab tone="pearl" withPearlAsset>
        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StaggerItem>
            <AdminKpiCard
              label="Active Dispute Cases"
              value={`${openCount}`}
              numericValue={openCount}
              badgeText="Awaiting arbitration sign-off"
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
              badgeText="Protected in Bachs.io vault"
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

        <div className="mt-4">
          <AdminDataTable
            title="Marketplace Arbitration Queue"
            subtitle="Review evidence logs and authorize Bachs.io escrow release or client refund."
            badge={`${filtered.length} Showing`}
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
                    <AdminTableHead>Case &amp; Booking</AdminTableHead>
                    <AdminTableHead>Client &amp; Artisan</AdminTableHead>
                    <AdminTableHead>Service &amp; Claim Reason</AdminTableHead>
                    <AdminTableHead>Frozen Escrow</AdminTableHead>
                    <AdminTableHead>Status</AdminTableHead>
                    <AdminTableHead className="text-right">
                      Arbitration Action
                    </AdminTableHead>
                  </AdminTableRow>
                </AdminTableHeader>
                <AdminTableBody>
                  {filtered.map((item) => (
                    <AdminTableRow key={item.id}>
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

                      <AdminTableCell className="max-w-[260px]">
                        <div className="truncate font-display text-xs font-extrabold text-brand-950">
                          {item.serviceTitle}
                        </div>
                        <div className="truncate text-[11px] font-medium text-ink-secondary">
                          {item.reason}
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
                        {item.status !== "resolved" ? (
                          <CtaButton
                            variant="primary"
                            size="xs"
                            onClick={() => resolveDispute(item.id)}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Resolve &amp; Settle</span>
                          </CtaButton>
                        ) : (
                          <PillBadge
                            tone="sky"
                            className="px-2.5 py-0.5 text-[10px]"
                          >
                            Settled
                          </PillBadge>
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
    </div>
  );
}

