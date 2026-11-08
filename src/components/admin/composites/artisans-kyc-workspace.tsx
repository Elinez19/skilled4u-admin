"use client";

import * as React from "react";
import {
  CheckCircle2,
  Landmark,
  ShieldCheck,
  Star,
  Users,
  XCircle,
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
import type { ArtisanRow } from "@/db/schema";

type KycFilter = "all" | "verified" | "pending" | "rejected";

export function ArtisansKycWorkspace({
  initialArtisans,
}: {
  initialArtisans: ArtisanRow[];
}) {
  const router = useRouter();
  const [items, setItems] = React.useState<ArtisanRow[]>(initialArtisans);
  const [filter, setFilter] = React.useState<KycFilter>("all");
  const [search, setSearch] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function updateArtisanKyc(id: string, kycStatus: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/v1/artisans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, kycStatus }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setItems((prev) => prev.map((a) => (a.id === id ? data : a)));
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  }

  const counts = React.useMemo(
    () => ({
      all: items.length,
      verified: items.filter((a) => a.kycStatus === "verified").length,
      pending: items.filter((a) => a.kycStatus === "pending").length,
      rejected: items.filter((a) => a.kycStatus === "rejected").length,
    }),
    [items]
  );

  const tabOptions: ReadonlyArray<AdminTabOption<KycFilter>> = [
    { id: "all", label: "All Artisans", count: counts.all },
    { id: "verified", label: "Verified", count: counts.verified },
    { id: "pending", label: "Pending KYC", count: counts.pending },
    { id: "rejected", label: "Rejected", count: counts.rejected },
  ];

  const filtered = items.filter((a) => {
    const matchesStatus = filter === "all" || a.kycStatus === filter;
    const matchesSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.trade.toLowerCase().includes(search.toLowerCase()) ||
      a.city.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-2 sm:space-y-4">
      <AdminHeroBanner
        eyebrow="Identity & Settlement Verification"
        eyebrowIcon="shield"
        headline="Artisans & NIN/KYC Desk."
        highlightWords={["Artisans", "NIN/KYC", "Desk."]}
        subtitle="Review artisan trade credentials, verify Nigerian NIN records, and approve NUBAN bank accounts for instant Bachs.io payouts."
        primaryCta={{
          label: "View Bookings Dispatch",
          href: "/admin/bookings",
          variant: "primary",
          trailingArrow: true,
        }}
        secondaryCta={{
          label: "Public Artisans Page",
          href: "/artisans",
          variant: "secondary",
        }}
      />

      <AdminWorkspaceSlab tone="pearl" withPearlAsset>
        {/* Top 3 KPI Summary Cards */}
        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StaggerItem>
            <AdminKpiCard
              label="Total Registered Pros"
              value={`${counts.all}`}
              numericValue={counts.all}
              badgeText="Active across Abuja & Lagos"
              badgeTone="sky"
              badgeIcon="pin"
              ringTone="blue"
              icon={<Users className="h-4 w-4 text-ink-on-blue" />}
            />
          </StaggerItem>

          <StaggerItem>
            <AdminKpiCard
              label="Verified & Dispatch-Ready"
              value={`${counts.verified}`}
              numericValue={counts.verified}
              badgeText="NIN & NUBAN bank verified"
              badgeTone="porcelain"
              badgeIcon="dot"
              ringTone="ink"
              icon={<ShieldCheck className="h-4 w-4 text-accent-success" />}
            />
          </StaggerItem>

          <StaggerItem>
            <AdminKpiCard
              label="Awaiting KYC Review"
              value={`${counts.pending}`}
              numericValue={counts.pending}
              badgeText="Requires identity sign-off"
              badgeTone="blue"
              badgeIcon="shield"
              ringTone="ink"
              tone="ink"
              icon={<Landmark className="h-4 w-4 text-accent-gold" />}
            />
          </StaggerItem>
        </Stagger>

        {/* Filter & Search Bar */}
        <div className="mt-6 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <AdminSegmentedTabs
            options={tabOptions}
            value={filter}
            onChange={setFilter}
            ariaLabel="Filter artisans by KYC status"
            layoutId="artisans-kyc-tab-pill"
          />

          <AdminSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by artisan name, trade, or city..."
          />
        </div>

        {/* Artisans Data Table */}
        <div className="mt-4">
          <AdminDataTable
            title="Artisan Verification Directory"
            subtitle="Approve or reject artisan identity documents and NUBAN payout accounts."
            badge={`${filtered.length} Showing`}
          >
            {filtered.length === 0 ? (
              <AdminEmptyState
                title="No Matching Artisans"
                description="Try clearing your search query or switching the KYC status filter."
                icon={<Users className="h-5 w-5 text-accent-sky" />}
                action={
                  <CtaButton
                    variant="secondary"
                    size="xs"
                    onClick={() => {
                      setFilter("all");
                      setSearch("");
                    }}
                  >
                    Reset Filters
                  </CtaButton>
                }
              />
            ) : (
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableRow>
                    <AdminTableHead>Artisan Pro</AdminTableHead>
                    <AdminTableHead>Trade &amp; Rate</AdminTableHead>
                    <AdminTableHead>NIN &amp; Bank Payout Details</AdminTableHead>
                    <AdminTableHead>Rating &amp; Jobs</AdminTableHead>
                    <AdminTableHead>KYC Status</AdminTableHead>
                    <AdminTableHead className="text-right">
                      Verification Actions
                    </AdminTableHead>
                  </AdminTableRow>
                </AdminTableHeader>
                <AdminTableBody>
                  {filtered.map((art) => (
                    <AdminTableRow key={art.id}>
                      <AdminTableCell>
                        <div className="flex items-center gap-2.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={art.profileImage}
                            alt={art.name}
                            className="h-9 w-9 shrink-0 rounded-xl object-cover border-2 border-brand-200 shadow-gloss-card"
                          />
                          <div>
                            <div className="flex items-center gap-1 font-display text-xs sm:text-sm font-extrabold text-brand-950 whitespace-nowrap">
                              <span>{art.name}</span>
                              {art.kycStatus === "verified" && (
                                <ShieldCheck
                                  className="h-3.5 w-3.5 text-accent-success shrink-0"
                                  aria-label="Verified Artisan"
                                />
                              )}
                            </div>
                            <div className="text-[11px] font-semibold text-ink-secondary whitespace-nowrap">
                              {art.phone} · {art.city}
                            </div>
                          </div>
                        </div>
                      </AdminTableCell>

                      <AdminTableCell>
                        <div className="font-display text-xs font-extrabold text-brand-950">
                          {art.trade}
                        </div>
                        <PillBadge
                          tone="sky"
                          className="mt-1 px-2.5 py-0.5 text-[10px]"
                        >
                          {art.hourlyRate}/hr
                        </PillBadge>
                      </AdminTableCell>

                      <AdminTableCell>
                        <div className="font-mono text-[11px] font-bold text-brand-800 whitespace-nowrap">
                          NIN: {art.ninNumber || "48192038471"}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-ink-secondary whitespace-nowrap">
                          <Landmark className="h-3 w-3 text-brand-600 shrink-0" />
                          <span>
                            {art.bankName || "Access Bank"} ·{" "}
                            {art.bankAccountNumber || "0148291042"}
                          </span>
                        </div>
                      </AdminTableCell>

                      <AdminTableCell>
                        <div className="inline-flex items-center gap-1 rounded-pill bg-surface-porcelain px-2.5 py-0.5 font-display text-[11px] font-extrabold text-brand-950 border border-brand-100 shadow-gloss-card whitespace-nowrap">
                          <Star className="h-3 w-3 fill-accent-gold text-accent-gold" />
                          <span>
                            {art.rating.toFixed(1)} ({art.reviewsCount})
                          </span>
                        </div>
                        <div className="mt-0.5 text-[11px] font-semibold text-ink-secondary whitespace-nowrap">
                          {art.completedJobs} completed jobs
                        </div>
                      </AdminTableCell>

                      <AdminTableCell>
                        <AdminStatusPill status={art.kycStatus} />
                      </AdminTableCell>

                      <AdminTableCell className="text-right">
                        <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                          {art.kycStatus !== "verified" && (
                            <CtaButton
                              variant="primary"
                              size="xs"
                              disabled={busyId === art.id}
                              onClick={() =>
                                updateArtisanKyc(art.id, "verified")
                              }
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Approve</span>
                            </CtaButton>
                          )}
                          {art.kycStatus !== "rejected" && (
                            <CtaButton
                              variant="secondary"
                              size="xs"
                              disabled={busyId === art.id}
                              onClick={() =>
                                updateArtisanKyc(art.id, "rejected")
                              }
                            >
                              <XCircle className="h-3 w-3 text-accent-warm" />
                              <span>Reject</span>
                            </CtaButton>
                          )}
                        </div>
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

