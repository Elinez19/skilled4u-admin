"use client";

import * as React from "react";
import {
  ArrowUpRight,
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  Layers,
  Lock,
  Pencil,
  Play,
  Scale,
  ShieldAlert,
  Trash2,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
  AdminHeroBanner,
  AdminWorkspaceSlab,
} from "@/components/admin/ui/admin-hero-banner";
import { AdminKpiCard } from "@/components/admin/ui/admin-kpi-card";
import { AdminStatusPill } from "@/components/admin/ui/admin-status-pill";
import { OffsetRing } from "@/components/brand/offset-ring";
import { RoadDispatchStrip } from "@/components/landing/composites/artisan-marquee-card";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import { Float } from "@/components/motion/float";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import type {
  ArtisanRow,
  BookingRow,
  CategoryRow,
  PaymentRow,
} from "@/db/schema";
import { formatCurrency } from "@/lib/utils";

export function resolveCategoryArtwork(slugOrTitle: string): string {
  const key = slugOrTitle.toLowerCase();
  if (key.includes("ac") || key.includes("refrig")) {
    return "/images/landing/service-ac.jpg";
  }
  if (key.includes("plumb") || key.includes("pipe")) {
    return "/images/landing/service-plumbing.svg";
  }
  if (key.includes("carpent") || key.includes("wood")) {
    return "/images/landing/service-carpentry.svg";
  }
  if (key.includes("electr") || key.includes("solar") || key.includes("inverter")) {
    return "/images/landing/service-electrical.svg";
  }
  if (key.includes("clean") || key.includes("fumig")) {
    return "/images/landing/service-cleaning.svg";
  }
  return "/images/landing/service-electronics.svg";
}

export interface OverviewDashboardProps {
  artisans: ArtisanRow[];
  bookings: BookingRow[];
  payments: PaymentRow[];
  categories: CategoryRow[];
}

export function OverviewDashboard({
  artisans,
  bookings: initialBookings,
  payments,
  categories,
}: OverviewDashboardProps) {
  const [bookings, setBookings] = React.useState<BookingRow[]>(initialBookings);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  async function updateBookingStatus(id: string, status: string) {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
    try {
      await fetch("/api/v1/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    } catch {
      // Optimistically updated
    }
  }

  const totalGmv = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalCommission = payments.reduce((sum, p) => sum + p.platformFee, 0);
  const escrowHeldAmount = payments
    .filter((p) => p.escrowStatus === "held")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingKycArtisans = artisans.filter((a) => a.kycStatus === "pending");
  const verifiedArtisansCount = artisans.filter(
    (a) => a.kycStatus === "verified"
  ).length;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* 1. Hero Banner Slab with hero-bg.jpg + OffsetRing Cluster + Strictly 2 CTAs */}
      <AdminHeroBanner
        eyebrow="User Management"
        eyebrowIcon="dot"
        headline="User Management Desk"
        highlightWords={["User", "Management"]}
        subtitle="Manage customers, artisans, and administrators, coordinate service bookings and dispatches, oversee categories and reviews, and resolve disputes and support tickets."
        primaryCta={{
          label: "Manage Users",
          href: "/admin/user-management",
          variant: "primary",
          icon: <Users className="h-3.5 w-3.5" />,
          trailingArrow: true,
        }}
        secondaryCta={{
          label: "Bookings & Dispatch",
          href: "/admin/bookings",
          variant: "secondary",
          icon: <CalendarCheck className="h-3.5 w-3.5" />,
        }}
        rightSlot={
          <div className="hidden xl:flex items-center gap-3.5 pr-1">
            <Float amplitude={5} duration={4.8}>
              <OffsetRing
                size="md"
                faceTone="ink"
                className="h-20 w-20 text-xs"
              >
                <div className="space-y-0.5 leading-tight">
                  <span className="block text-accent-sky text-lg font-extrabold">
                    {verifiedArtisansCount}
                  </span>
                  <span className="block text-[9px] font-bold text-ink-on-blue-muted">
                    Verified Pros
                  </span>
                </div>
              </OffsetRing>
            </Float>
            <Float amplitude={6} duration={5.4} delay={0.3}>
              <OffsetRing
                size="sm"
                faceTone="porcelain"
                className="h-15 w-15 text-[10px]"
              >
                <div className="space-y-0.5 leading-tight">
                  <span className="block text-brand-700 text-xs font-extrabold">
                    90/10
                  </span>
                  <span className="block text-[8px] font-bold text-ink-secondary">
                    Escrow Split
                  </span>
                </div>
              </OffsetRing>
            </Float>
          </div>
        }
      />

      {/* 2. KPI Cards & Operations Tables inside Pearl Workspace Slab */}
      <AdminWorkspaceSlab tone="pearl" withPearlAsset>
        {/* 4 Glossy KPI Cards */}
        <Stagger className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <AdminKpiCard
              label="Gross Booking Volume"
              value={formatCurrency(totalGmv)}
              badgeText={`${formatCurrency(totalCommission)} platform commission (10%)`}
              badgeTone="porcelain"
              badgeIcon="dot"
              ringTone="blue"
              icon={<TrendingUp className="h-4 w-4 text-ink-on-blue" />}
            />
          </StaggerItem>

          <StaggerItem>
            <AdminKpiCard
              label="Escrow Funds on Hold"
              value={formatCurrency(escrowHeldAmount)}
              badgeText="Awaiting customer job completion sign-off"
              badgeTone="sky"
              badgeIcon="shield"
              ringTone="ink"
              icon={<Lock className="h-4 w-4 text-accent-gold" />}
            />
          </StaggerItem>

          <StaggerItem>
            <AdminKpiCard
              label="Total Service Bookings"
              value={`${bookings.length}`}
              numericValue={bookings.length}
              badgeText={`Across ${categories.length} service categories`}
              badgeTone="sky"
              badgeIcon="pin"
              ringTone="porcelain"
              icon={<CalendarCheck className="h-4 w-4 text-brand-600" />}
            />
          </StaggerItem>

          <StaggerItem>
            <AdminKpiCard
              label="Users & Artisan KYC"
              value={`${verifiedArtisansCount} Verified`}
              badgeText={`${pendingKycArtisans.length} artisans pending verification`}
              badgeTone="blue"
              badgeIcon="shield"
              ringTone="ink"
              tone="ink"
              icon={<Users className="h-4 w-4 text-accent-sky" />}
            />
          </StaggerItem>
        </Stagger>

        {/* Main Operations Grid: Recent Service Bookings + Pending KYC Desk */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Left 7/8 Cols: Recent Bookings Table */}
          <div className="lg:col-span-7 xl:col-span-8 min-w-0">
            <AdminDataTable
              title="Recent Service Bookings"
              subtitle="Live bookings dispatched from the skilled4U mobile app."
              badge={`${bookings.length} Total`}
              selectedCount={selectedIds.length}
              bulkActions={
                <>
                  <CtaButton
                    variant="secondary"
                    size="xs"
                    onClick={() => {
                      setBookings((prev) =>
                        prev.map((b) =>
                          selectedIds.includes(b.id)
                            ? { ...b, status: "completed" }
                            : b
                        )
                      );
                      setSelectedIds([]);
                    }}
                  >
                    <span>Mark Completed</span>
                  </CtaButton>
                  <CtaButton
                    variant="secondary"
                    size="xs"
                    className="text-accent-error hover:border-accent-error/40 hover:text-accent-error"
                    onClick={() => {
                      setBookings((prev) =>
                        prev.filter((b) => !selectedIds.includes(b.id))
                      );
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
                  variant="secondary"
                  size="xs"
                  href="/admin/bookings"
                >
                  <span>View All</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </CtaButton>
              }
            >
              {bookings.length === 0 ? (
                <AdminEmptyState
                  title="No Service Bookings Yet"
                  description="New client dispatches from the mobile app will stream here automatically."
                  icon={<CalendarCheck className="h-5 w-5 text-accent-sky" />}
                  action={
                    <CtaButton
                      variant="primary"
                      size="xs"
                      href="/admin/bookings"
                    >
                      Open Dispatch Console
                    </CtaButton>
                  }
                />
              ) : (
                <AdminTable>
                  <AdminTableHeader>
                    <AdminTableRow>
                      <AdminTableHead className="w-10">
                        <AdminCheckbox
                          aria-label="Select all bookings"
                          checked={
                            bookings.slice(0, 6).length > 0 &&
                            bookings
                              .slice(0, 6)
                              .every((b) => selectedIds.includes(b.id))
                          }
                          indeterminate={
                            bookings
                              .slice(0, 6)
                              .some((b) => selectedIds.includes(b.id)) &&
                            !bookings
                              .slice(0, 6)
                              .every((b) => selectedIds.includes(b.id))
                          }
                          onChange={(e) => {
                            const visible = bookings.slice(0, 6);
                            if (e.target.checked) {
                              setSelectedIds((prev) => [
                                ...prev,
                                ...visible
                                  .filter((b) => !prev.includes(b.id))
                                  .map((b) => b.id),
                              ]);
                            } else {
                              const fIds = new Set(visible.map((b) => b.id));
                              setSelectedIds((prev) =>
                                prev.filter((id) => !fIds.has(id))
                              );
                            }
                          }}
                        />
                      </AdminTableHead>
                      <AdminTableHead>Booking Code</AdminTableHead>
                      <AdminTableHead>Client &amp; Service</AdminTableHead>
                      <AdminTableHead>Artisan Pro</AdminTableHead>
                      <AdminTableHead>Amount</AdminTableHead>
                      <AdminTableHead>Status</AdminTableHead>
                      <AdminTableHead className="text-right">
                        Actions
                      </AdminTableHead>
                    </AdminTableRow>
                  </AdminTableHeader>
                  <AdminTableBody>
                    {bookings.slice(0, 6).map((bk) => (
                      <AdminTableRow
                        key={bk.id}
                        isSelected={selectedIds.includes(bk.id)}
                      >
                        <AdminTableCell className="w-10">
                          <AdminCheckbox
                            aria-label={`Select booking ${bk.bookingCode}`}
                            checked={selectedIds.includes(bk.id)}
                            onChange={() => {
                              setSelectedIds((prev) =>
                                prev.includes(bk.id)
                                  ? prev.filter((id) => id !== bk.id)
                                  : [...prev, bk.id]
                              );
                            }}
                          />
                        </AdminTableCell>
                        <AdminTableCell className="font-mono text-[11px] font-extrabold text-brand-700 whitespace-nowrap">
                          {bk.bookingCode}
                        </AdminTableCell>
                        <AdminTableCell className="max-w-[200px]">
                          <div className="truncate font-display text-xs font-extrabold text-brand-950">
                            {bk.clientName}
                          </div>
                          <div className="truncate text-[11px] font-semibold text-ink-secondary">
                            {bk.serviceTitle}
                          </div>
                        </AdminTableCell>
                        <AdminTableCell className="font-display text-xs font-bold text-ink-primary whitespace-nowrap">
                          {bk.artisanName}
                        </AdminTableCell>
                        <AdminTableCell className="font-display text-xs font-extrabold text-brand-600 whitespace-nowrap">
                          {formatCurrency(bk.agreedAmount)}
                        </AdminTableCell>
                        <AdminTableCell>
                          <AdminStatusPill status={bk.status} />
                        </AdminTableCell>
                        <AdminTableCell className="text-right whitespace-nowrap">
                          <AdminActionMenu
                            label={`Booking ${bk.bookingCode}`}
                            ariaLabel={`Actions for booking ${bk.bookingCode}`}
                            items={[
                              {
                                id: "manage",
                                label: "Edit & Manage in Form",
                                description: "Open in Bookings Console",
                                icon: <Pencil className="h-3.5 w-3.5" />,
                                variant: "primary",
                                href: "/admin/bookings",
                              },
                              {
                                id: "accept",
                                label: "Accept Dispatch",
                                description: "Confirm artisan assignment",
                                icon: <CalendarCheck className="h-3.5 w-3.5" />,
                                disabled: bk.status === "accepted",
                                onClick: () =>
                                  updateBookingStatus(bk.id, "accepted"),
                              },
                              {
                                id: "in-progress",
                                label: "Mark In Progress",
                                description: "Artisan arrived on-site",
                                icon: <Play className="h-3.5 w-3.5" />,
                                disabled: bk.status === "in_progress",
                                onClick: () =>
                                  updateBookingStatus(bk.id, "in_progress"),
                              },
                              {
                                id: "complete",
                                label: "Complete Job",
                                description: "Finalize service & sign-off",
                                icon: <CheckCircle2 className="h-3.5 w-3.5" />,
                                disabled: bk.status === "completed",
                                onClick: () =>
                                  updateBookingStatus(bk.id, "completed"),
                              },
                              {
                                id: "financials",
                                label: "Open Financials & Escrow",
                                description: "View payment settlement",
                                icon: <CreditCard className="h-3.5 w-3.5" />,
                                dividerBefore: true,
                                href: "/admin/financials",
                              },
                              {
                                id: "dispute",
                                label: "Open Dispute Case",
                                description: "Escalate to arbitration",
                                icon: <Scale className="h-3.5 w-3.5" />,
                                href: "/admin/disputes",
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

          {/* Right 5/4 Cols: Pending KYC Queue & Verification Checklist */}
          <div className="lg:col-span-5 xl:col-span-4 min-w-0">
            <div className="surface-gloss-card p-4 sm:p-5 space-y-4">
              <div className="flex items-start justify-between gap-2.5">
                <div className="min-w-0">
                  <h2 className="font-display text-base sm:text-lg font-extrabold text-brand-950">
                    Pending KYC Queue
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-ink-secondary">
                    Artisans awaiting NIN &amp; NUBAN verification.
                  </p>
                </div>
                <PillBadge
                  tone="sky"
                  className="px-2.5 py-0.5 text-[11px] shrink-0"
                >
                  {pendingKycArtisans.length} Pending
                </PillBadge>
              </div>

              {pendingKycArtisans.length === 0 ? (
                <div className="rounded-2xl border-2 border-brand-100 bg-surface-mist p-3.5 flex items-center gap-3">
                  <OffsetRing size="xs" faceTone="ink" className="shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-accent-success" />
                  </OffsetRing>
                  <div>
                    <p className="font-display text-xs font-extrabold text-brand-950">
                      All Artisans Verified!
                    </p>
                    <p className="text-[11px] font-medium text-ink-secondary">
                      Every registered pro has passed NIN &amp; bank checks.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pendingKycArtisans.slice(0, 4).map((art) => (
                    <div
                      key={art.id}
                      className="flex items-center justify-between gap-2.5 rounded-2xl border-2 border-brand-100 bg-surface-porcelain p-2.5 shadow-gloss-card"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={art.profileImage}
                          alt={art.name}
                          className="h-9 w-9 shrink-0 rounded-xl object-cover border-2 border-brand-200"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display text-xs font-extrabold text-brand-950">
                            {art.name}
                          </p>
                          <p className="truncate text-[11px] font-semibold text-ink-secondary">
                            {art.trade} · NIN: {art.ninNumber || "Submitted"}
                          </p>
                        </div>
                      </div>
                      <CtaButton
                        variant="secondary"
                        size="xs"
                        href="/admin/artisans"
                        className="shrink-0"
                      >
                        Review
                      </CtaButton>
                    </div>
                  ))}
                </div>
              )}

              {/* Dark Ink Verification Checklist Slab */}
              <div className="surface-slab-ink rounded-2xl border-2 border-brand-700 p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-accent-gold shrink-0" />
                  <span className="font-display text-xs font-extrabold text-ink-on-blue">
                    User &amp; Role Management Guide
                  </span>
                </div>
                <p className="text-[11px] font-medium leading-relaxed text-ink-on-blue-muted">
                  Verify artisan identity and bank payout accounts, review
                  customer booking activity, and manage administrator roles from
                  the user management desk.
                </p>
                <div className="pt-0.5">
                  <CtaButton
                    variant="primary"
                    size="xs"
                    href="/admin/user-management"
                    trailingArrow
                    className="w-full"
                  >
                    Open User Management Desk
                  </CtaButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Taxonomy Strip with 3D Service Artwork Assets */}
        <Reveal delay={0.15} className="mt-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <OffsetRing size="xs" faceTone="blue">
                <Layers className="h-3.5 w-3.5 text-ink-on-blue" />
              </OffsetRing>
              <div>
                <h2 className="font-display text-base sm:text-lg font-extrabold text-brand-950">
                  Active Marketplace Categories
                </h2>
                <p className="text-xs font-medium text-ink-secondary">
                  Synced directly with the skilled4U customer &amp; artisan apps.
                </p>
              </div>
            </div>
            <CtaButton
              variant="secondary"
              size="xs"
              href="/admin/categories"
              trailingArrow
            >
              Manage Categories
            </CtaButton>
          </div>

          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
            {categories.slice(0, 3).map((cat) => (
              <Link
                key={cat.id}
                href="/admin/categories"
                className="surface-gloss-card group flex items-center gap-3 p-3 sm:p-3.5 transition-transform hover:-translate-y-1 min-w-0"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-brand-100 bg-surface-mist">
                  <Image
                    src={resolveCategoryArtwork(cat.slug || cat.title)}
                    alt={cat.title}
                    fill
                    sizes="64px"
                    className="object-contain p-1.5"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-display text-xs sm:text-sm font-extrabold text-brand-950 group-hover:text-brand-600">
                      {cat.title}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] font-semibold text-ink-secondary truncate">
                    {(cat.subServices || []).length} sub-services active
                  </p>
                  <div className="mt-1.5 inline-flex items-center gap-1 rounded-pill bg-brand-50 px-2.5 py-0.5 font-display text-[11px] font-extrabold text-brand-700 border border-brand-100">
                    <Wrench className="h-2.5 w-2.5 text-brand-600" />
                    <span>From {formatCurrency(cat.basePrice)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>

        {/* Signature Road Dispatch Strip at Bottom */}
        <div className="mt-6 overflow-hidden rounded-2xl">
          <RoadDispatchStrip />
        </div>
      </AdminWorkspaceSlab>
    </div>
  );
}

