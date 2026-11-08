"use client";

import * as React from "react";
import { CheckCircle2, ShieldCheck, Star, ThumbsUp } from "lucide-react";
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
import { Stagger, StaggerItem } from "@/components/motion/reveal";

type ReviewFilter = "all" | "verified" | "pending";

interface ReviewRecord {
  id: string;
  clientName: string;
  artisanName: string;
  serviceTitle: string;
  rating: number;
  comment: string;
  status: "verified" | "pending";
  createdAt: string;
}

const INITIAL_REVIEWS: ReviewRecord[] = [
  {
    id: "rev_1",
    clientName: "Amina Bello",
    artisanName: "Emeka Okafor",
    serviceTitle: "Emergency Pipe Leak & Heater Installation",
    rating: 5,
    comment:
      "Arrived in Wuse II within 25 minutes and fixed the burst pipe cleanly. Escrow release was seamless.",
    status: "verified",
    createdAt: "Today, 9:40 AM",
  },
  {
    id: "rev_2",
    clientName: "Tunde Bakare",
    artisanName: "Chukwudi Eze",
    serviceTitle: "Split A.C Gas Refill & Coil Wash",
    rating: 5,
    comment:
      "Super professional technician. Both units in Lekki Phase 1 are cooling like brand new.",
    status: "verified",
    createdAt: "Yesterday",
  },
  {
    id: "rev_3",
    clientName: "Ngozi Okonkwo",
    artisanName: "Ibrahim Musa",
    serviceTitle: "Custom TV Console & Wall Mounting",
    rating: 4,
    comment:
      "Neat carpentry finish and hidden cable routing. Highly recommended.",
    status: "pending",
    createdAt: "Nov 06, 2026",
  },
];

export default function AdminReviewsPage() {
  const [items, setItems] = React.useState<ReviewRecord[]>(INITIAL_REVIEWS);
  const [filter, setFilter] = React.useState<ReviewFilter>("all");
  const [search, setSearch] = React.useState("");

  function verifyReview(id: string) {
    setItems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "verified" } : r))
    );
  }

  const verifiedCount = items.filter((r) => r.status === "verified").length;
  const avgRating = (
    items.reduce((sum, r) => sum + r.rating, 0) / (items.length || 1)
  ).toFixed(1);

  const tabOptions: ReadonlyArray<AdminTabOption<ReviewFilter>> = [
    { id: "all", label: "All Reviews", count: items.length },
    { id: "verified", label: "Verified", count: verifiedCount },
    {
      id: "pending",
      label: "Pending Moderation",
      count: items.length - verifiedCount,
    },
  ];

  const filtered = items.filter((r) => {
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

  return (
    <div className="space-y-3 sm:space-y-4">
      <AdminHeroBanner
        eyebrow="Verified Client Feedback & Trust"
        eyebrowIcon="dot"
        headline="Reviews & Rating Moderation."
        highlightWords={["Reviews", "Rating", "Moderation."]}
        subtitle="Audit verified post-booking client ratings, moderate artisan testimonials, and maintain high-trust marketplace quality scores."
        primaryCta={{
          label: "UserManagement Desk",
          href: "/admin/user-management",
          variant: "primary",
          trailingArrow: true,
        }}
        secondaryCta={{
          label: "Public Testimonials",
          href: "/#testimonials",
          variant: "secondary",
        }}
      />

      <AdminWorkspaceSlab tone="pearl" withPearlAsset>
        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StaggerItem>
            <AdminKpiCard
              label="Marketplace Rating Average"
              value={`${avgRating} / 5.0`}
              badgeText="Across verified completed bookings"
              badgeTone="porcelain"
              badgeIcon="dot"
              ringTone="blue"
              icon={<Star className="h-4 w-4 text-accent-gold" />}
            />
          </StaggerItem>

          <StaggerItem>
            <AdminKpiCard
              label="Verified Reviews Published"
              value={`${verifiedCount}`}
              numericValue={verifiedCount}
              badgeText="Synced to artisan public profiles"
              badgeTone="sky"
              badgeIcon="shield"
              ringTone="ink"
              icon={<ShieldCheck className="h-4 w-4 text-accent-success" />}
            />
          </StaggerItem>

          <StaggerItem>
            <AdminKpiCard
              label="Client Satisfaction Score"
              value="98.4%"
              badgeText="Escrow release approval rate"
              badgeTone="blue"
              badgeIcon="shield"
              ringTone="ink"
              tone="ink"
              icon={<ThumbsUp className="h-4 w-4 text-accent-sky" />}
            />
          </StaggerItem>
        </Stagger>

        <div className="mt-6 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <AdminSegmentedTabs
            options={tabOptions}
            value={filter}
            onChange={setFilter}
            ariaLabel="Filter reviews"
            layoutId="reviews-tab-pill"
          />

          <AdminSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search client, artisan, or comment..."
          />
        </div>

        <div className="mt-4">
          <AdminDataTable
            title="Customer Reviews & Ratings Ledger"
            subtitle="Every review is linked to a completed Bachs.io escrow booking."
            badge={`${filtered.length} Showing`}
          >
            {filtered.length === 0 ? (
              <AdminEmptyState
                title="No Matching Reviews"
                description="Try clearing your search query or switching the moderation filter."
                icon={<Star className="h-5 w-5 text-accent-gold" />}
              />
            ) : (
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableRow>
                    <AdminTableHead>Client</AdminTableHead>
                    <AdminTableHead>Artisan Pro</AdminTableHead>
                    <AdminTableHead>Rating</AdminTableHead>
                    <AdminTableHead>Service &amp; Review Comment</AdminTableHead>
                    <AdminTableHead>Status</AdminTableHead>
                    <AdminTableHead className="text-right">
                      Moderation
                    </AdminTableHead>
                  </AdminTableRow>
                </AdminTableHeader>
                <AdminTableBody>
                  {filtered.map((rev) => (
                    <AdminTableRow key={rev.id}>
                      <AdminTableCell className="whitespace-nowrap">
                        <div className="font-display text-xs font-extrabold text-brand-950">
                          {rev.clientName}
                        </div>
                        <div className="text-[10px] font-semibold text-ink-muted">
                          {rev.createdAt}
                        </div>
                      </AdminTableCell>

                      <AdminTableCell className="font-display text-xs font-extrabold text-brand-700 whitespace-nowrap">
                        {rev.artisanName}
                      </AdminTableCell>

                      <AdminTableCell className="whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 rounded-pill border border-brand-100 bg-surface-porcelain px-2.5 py-0.5 font-display text-xs font-extrabold text-brand-950 shadow-gloss-card">
                          <Star className="h-3 w-3 fill-accent-gold text-accent-gold" />
                          <span>{rev.rating}.0</span>
                        </div>
                      </AdminTableCell>

                      <AdminTableCell className="max-w-[320px]">
                        <div className="truncate font-display text-xs font-extrabold text-brand-950">
                          {rev.serviceTitle}
                        </div>
                        <p className="truncate text-[11px] font-medium text-ink-secondary">
                          {rev.comment}
                        </p>
                      </AdminTableCell>

                      <AdminTableCell>
                        <AdminStatusPill status={rev.status} />
                      </AdminTableCell>

                      <AdminTableCell className="text-right whitespace-nowrap">
                        {rev.status === "pending" ? (
                          <CtaButton
                            variant="primary"
                            size="xs"
                            onClick={() => verifyReview(rev.id)}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Publish</span>
                          </CtaButton>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-pill bg-brand-50 px-2.5 py-1 font-display text-[11px] font-extrabold text-brand-700 border border-brand-200">
                            <CheckCircle2 className="h-3 w-3 text-accent-success" />
                            <span>Published</span>
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
    </div>
  );
}

