"use client";

import * as React from "react";
import {
  CheckCircle2,
  Clock,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  Star,
  ThumbsUp,
  Trash2,
  XCircle,
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

type ReviewFilter = "all" | "verified" | "pending";
type ReviewModerationStatus = "verified" | "pending" | "rejected";
type RatingString = "5" | "4" | "3" | "2" | "1";

interface ReviewRecord {
  id: string;
  clientName: string;
  artisanName: string;
  serviceTitle: string;
  rating: number;
  comment: string;
  status: ReviewModerationStatus;
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

const RATING_OPTIONS = [
  { id: "5", label: "5.0 ★ Excellent" },
  { id: "4", label: "4.0 ★ Very Good" },
  { id: "3", label: "3.0 ★ Good" },
  { id: "2", label: "2.0 ★ Fair" },
  { id: "1", label: "1.0 ★ Poor" },
] as const;

const MODERATION_STATUS_OPTIONS = [
  { id: "verified", label: "Verified & Published" },
  { id: "pending", label: "Pending Moderation" },
  { id: "rejected", label: "Flagged / Hidden" },
] as const;

export default function AdminReviewsPage() {
  const formRef = React.useRef<HTMLDivElement>(null);

  const [items, setItems] = React.useState<ReviewRecord[]>(INITIAL_REVIEWS);
  const [filter, setFilter] = React.useState<ReviewFilter>("all");
  const [search, setSearch] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Inline Form State
  const [formOpen, setFormOpen] = React.useState(true);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [clientName, setClientName] = React.useState("");
  const [artisanName, setArtisanName] = React.useState("Emeka Okafor");
  const [serviceTitle, setServiceTitle] = React.useState(
    "Split A.C Gas Refill & Servicing"
  );
  const [rating, setRating] = React.useState<RatingString>("5");
  const [status, setStatus] =
    React.useState<ReviewModerationStatus>("verified");
  const [comment, setComment] = React.useState("");
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
    setClientName("");
    setArtisanName("Emeka Okafor");
    setServiceTitle("Split A.C Gas Refill & Servicing");
    setRating("5");
    setStatus("verified");
    setComment("");
  }

  function loadReviewIntoForm(rev: ReviewRecord) {
    setEditingId(rev.id);
    setClientName(rev.clientName);
    setArtisanName(rev.artisanName);
    setServiceTitle(rev.serviceTitle);
    setRating(String(rev.rating) as RatingString);
    setStatus(rev.status);
    setComment(rev.comment);
    scrollToForm();
  }

  function handleSaveReview(e: React.FormEvent) {
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
  }

  function updateReviewStatus(id: string, nextStatus: ReviewModerationStatus) {
    setItems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r))
    );
    notifySaved(`Review status updated to ${nextStatus}`);
  }

  function deleteReview(id: string) {
    setItems((prev) => prev.filter((r) => r.id !== id));
    if (editingId === id) resetForm();
    notifySaved("Review removed from ledger");
  }

  const verifiedCount = items.filter((r) => r.status === "verified").length;
  const pendingCount = items.filter((r) => r.status === "pending").length;
  const avgRating = (
    items.reduce((sum, r) => sum + r.rating, 0) / (items.length || 1)
  ).toFixed(1);

  const tabOptions: ReadonlyArray<AdminTabOption<ReviewFilter>> = [
    { id: "all", label: "All Reviews", count: items.length },
    { id: "verified", label: "Verified", count: verifiedCount },
    {
      id: "pending",
      label: "Pending Moderation",
      count: pendingCount,
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
        eyebrow="Customer Feedback & Quality Assurance"
        eyebrowIcon="dot"
        headline="Reviews & Rating Moderation."
        highlightWords={["Reviews", "Rating", "Moderation."]}
        subtitle="Add, edit, and moderate customer reviews using the inline form below, verify service ratings, and use the three-dots table menu to publish or flag feedback."
        primaryCta={{
          label: "Add Customer Review",
          onClick: () => {
            resetForm();
            scrollToForm();
          },
          variant: "primary",
          icon: <Plus className="h-4 w-4" />,
        }}
        secondaryCta={{
          label: "User Management Desk",
          href: "/admin/user-management",
          variant: "secondary",
          trailingArrow: true,
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
              badgeText="Visible on artisan public profiles"
              badgeTone="sky"
              badgeIcon="shield"
              ringTone="ink"
              icon={<ShieldCheck className="h-4 w-4 text-accent-success" />}
            />
          </StaggerItem>

          <StaggerItem>
            <AdminKpiCard
              label="Customer Satisfaction Score"
              value="98.4%"
              badgeText="Completed job approval rate"
              badgeTone="blue"
              badgeIcon="shield"
              ringTone="ink"
              tone="ink"
              icon={<ThumbsUp className="h-4 w-4 text-accent-sky" />}
            />
          </StaggerItem>
        </Stagger>

        {/* Inline Form to Add, Edit, and Moderate Reviews */}
        <div className="mt-6">
          <AdminInlineForm
            formRef={formRef}
            eyebrow="Inline Review & Rating Form"
            title={
              editingId
                ? `Edit & Moderate Review by ${clientName}`
                : "Add, Edit & Moderate Customer Review"
            }
            description="Log a verified customer review after job completion, or select any review from the table menu below to edit its rating, comment, or publication status."
            isEditing={Boolean(editingId)}
            editingBadgeText={`Editing Review`}
            onResetToCreate={resetForm}
            open={formOpen}
            onOpenChange={setFormOpen}
            savedMessage={savedBanner}
          >
            <form onSubmit={handleSaveReview} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <AdminTextField
                  label="Client Full Name"
                  placeholder="e.g. Chidinma Nwosu"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
                <AdminTextField
                  label="Reviewed Artisan Pro"
                  value={artisanName}
                  onChange={(e) => setArtisanName(e.target.value)}
                  required
                />
                <AdminTextField
                  label="Completed Service Title"
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <AdminSelectPills
                  label="Star Rating"
                  options={RATING_OPTIONS}
                  value={rating}
                  onChange={setRating}
                  columns={5}
                />
                <AdminSelectPills
                  label="Moderation Status"
                  options={MODERATION_STATUS_OPTIONS}
                  value={status}
                  onChange={setStatus}
                  columns={3}
                />
              </div>

              <AdminTextareaField
                label="Customer Review Comment"
                placeholder="Describe artisan punctuality, workmanship quality, and service outcome..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
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
                      <span>Save Review Changes</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Add &amp; Save Review</span>
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
            ariaLabel="Filter reviews"
            layoutId="reviews-tab-pill"
          />

          <AdminSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search client, artisan, or comment..."
          />
        </div>

        {/* Reviews Table with Three-Dots Action Button & Dropdown CTAs */}
        <div className="mt-4">
          <AdminDataTable
            title="Customer Reviews & Ratings Ledger"
            subtitle="Verify customer feedback from completed service bookings and use the three-dots menu to edit, publish, or moderate."
            badge={`${filtered.length} Showing`}
            selectedCount={selectedIds.length}
            bulkActions={
              <>
                <CtaButton
                  variant="secondary"
                  size="xs"
                  onClick={() => {
                    setItems((prev) =>
                      prev.map((r) =>
                        selectedIds.includes(r.id)
                          ? { ...r, status: "verified" }
                          : r
                      )
                    );
                    notifySaved(`Verified ${selectedIds.length} review(s)`);
                    setSelectedIds([]);
                  }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent-success" />
                  <span>Verify Selected</span>
                </CtaButton>
                <CtaButton
                  variant="secondary"
                  size="xs"
                  className="text-accent-error hover:border-accent-error/40 hover:text-accent-error"
                  onClick={() => {
                    const count = selectedIds.length;
                    setItems((prev) =>
                      prev.filter((r) => !selectedIds.includes(r.id))
                    );
                    notifySaved(`Removed ${count} review record(s)`);
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
                <span>Add Review</span>
              </CtaButton>
            }
          >
            {filtered.length === 0 ? (
              <AdminEmptyState
                title="No Matching Reviews"
                description="Try clearing your search query or add a review in the inline form above."
                icon={<Star className="h-5 w-5 text-accent-gold" />}
              />
            ) : (
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableRow>
                    <AdminTableHead className="w-10">
                      <AdminCheckbox
                        aria-label="Select all reviews"
                        checked={
                          filtered.length > 0 &&
                          filtered.every((r) => selectedIds.includes(r.id))
                        }
                        indeterminate={
                          filtered.some((r) => selectedIds.includes(r.id)) &&
                          !filtered.every((r) => selectedIds.includes(r.id))
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds((prev) => [
                              ...prev,
                              ...filtered
                                .filter((r) => !prev.includes(r.id))
                                .map((r) => r.id),
                            ]);
                          } else {
                            const fIds = new Set(filtered.map((r) => r.id));
                            setSelectedIds((prev) =>
                              prev.filter((id) => !fIds.has(id))
                            );
                          }
                        }}
                      />
                    </AdminTableHead>
                    <AdminTableHead>Client &amp; Pro</AdminTableHead>
                    <AdminTableHead>Service</AdminTableHead>
                    <AdminTableHead>Rating</AdminTableHead>
                    <AdminTableHead>Status</AdminTableHead>
                    <AdminTableHead className="text-right">
                      Actions
                    </AdminTableHead>
                  </AdminTableRow>
                </AdminTableHeader>
                <AdminTableBody>
                  {filtered.map((rev) => (
                    <AdminTableRow
                      key={rev.id}
                      isSelected={selectedIds.includes(rev.id)}
                    >
                      <AdminTableCell className="w-10">
                        <AdminCheckbox
                          aria-label={`Select review by ${rev.clientName}`}
                          checked={selectedIds.includes(rev.id)}
                          onChange={() => {
                            setSelectedIds((prev) =>
                              prev.includes(rev.id)
                                ? prev.filter((id) => id !== rev.id)
                                : [...prev, rev.id]
                            );
                          }}
                        />
                      </AdminTableCell>

                      <AdminTableCell className="whitespace-nowrap">
                        <div className="font-display text-xs font-extrabold text-brand-950">
                          {rev.clientName}
                        </div>
                        <div className="text-[11px] font-semibold text-brand-600">
                          Pro: {rev.artisanName}
                        </div>
                      </AdminTableCell>

                      <AdminTableCell className="max-w-[240px]">
                        <div className="truncate font-display text-xs font-extrabold text-brand-950">
                          {rev.serviceTitle}
                        </div>
                      </AdminTableCell>

                      <AdminTableCell className="whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 rounded-pill border border-brand-100 bg-surface-porcelain px-2.5 py-0.5 font-display text-xs font-extrabold text-brand-950 shadow-gloss-card">
                          <Star className="h-3 w-3 fill-accent-gold text-accent-gold" />
                          <span>{rev.rating}.0</span>
                        </div>
                      </AdminTableCell>

                      <AdminTableCell>
                        <AdminStatusPill status={rev.status} />
                      </AdminTableCell>

                      <AdminTableCell className="text-right whitespace-nowrap">
                        <AdminActionMenu
                          label={`Review by ${rev.clientName}`}
                          ariaLabel={`Actions for review by ${rev.clientName}`}
                          items={[
                            {
                              id: "edit",
                              label: "Edit Review in Form",
                              description: "Modify rating, comment, or status",
                              icon: <Pencil className="h-3.5 w-3.5" />,
                              variant: "primary",
                              onClick: () => loadReviewIntoForm(rev),
                            },
                            {
                              id: "publish",
                              label: "Publish & Verify",
                              description: "Show on artisan public profile",
                              icon: <CheckCircle2 className="h-3.5 w-3.5" />,
                              disabled: rev.status === "verified",
                              onClick: () =>
                                updateReviewStatus(rev.id, "verified"),
                            },
                            {
                              id: "pending",
                              label: "Move to Moderation",
                              description: "Hold for quality review",
                              icon: <Clock className="h-3.5 w-3.5" />,
                              disabled: rev.status === "pending",
                              onClick: () =>
                                updateReviewStatus(rev.id, "pending"),
                            },
                            {
                              id: "reject",
                              label: "Flag & Hide Review",
                              description: "Unpublish from profile",
                              icon: <XCircle className="h-3.5 w-3.5" />,
                              variant: "danger",
                              dividerBefore: true,
                              disabled: rev.status === "rejected",
                              onClick: () =>
                                updateReviewStatus(rev.id, "rejected"),
                            },
                            {
                              id: "delete",
                              label: "Delete Review",
                              description: "Remove review permanently",
                              icon: <Trash2 className="h-3.5 w-3.5" />,
                              variant: "danger",
                              onClick: () => deleteReview(rev.id),
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
