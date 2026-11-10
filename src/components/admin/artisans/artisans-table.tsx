"use client";

import * as React from "react";
import {
  CheckCircle2,
  Clock,
  Pencil,
  Plus,
  Power,
  ShieldCheck,
  Star,
  Trash2,
  Users,
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
import { AdminStatusPill } from "@/components/admin/ui/admin-status-pill";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import type { ArtisanRow } from "@/db/schema";

export interface ArtisansTableProps {
  filteredArtisans: ArtisanRow[];
  selectedIds: string[];
  busyId: string | null;
  onToggleSelectAll: (checked: boolean) => void;
  onToggleSelectOne: (id: string) => void;
  onClearSelection: () => void;
  onBatchVerify: () => void;
  onBatchDelete: () => void;
  onResetFilters: () => void;
  onAddNewArtisan: () => void;
  onEditArtisan: (artisan: ArtisanRow) => void;
  onUpdateKyc: (id: string, status: string) => void;
  onToggleOnline: (artisan: ArtisanRow) => void;
  onDeleteArtisan: (id: string) => void;
}

export function ArtisansTable({
  filteredArtisans,
  selectedIds,
  busyId,
  onToggleSelectAll,
  onToggleSelectOne,
  onClearSelection,
  onBatchVerify,
  onBatchDelete,
  onResetFilters,
  onAddNewArtisan,
  onEditArtisan,
  onUpdateKyc,
  onToggleOnline,
  onDeleteArtisan,
}: ArtisansTableProps) {
  const allSelected =
    filteredArtisans.length > 0 &&
    filteredArtisans.every((a) => selectedIds.includes(a.id));

  const someSelected =
    filteredArtisans.some((a) => selectedIds.includes(a.id)) && !allSelected;

  return (
    <AdminDataTable
      title="Artisan Verification & Profile Directory"
      subtitle="Review artisan trade credentials, verify identity records, and use the three-dots menu to edit or approve bank payout accounts."
      badge={`${filteredArtisans.length} Showing`}
      selectedCount={selectedIds.length}
      bulkActions={
        <>
          <CtaButton variant="secondary" size="xs" onClick={onBatchVerify}>
            <ShieldCheck className="h-3.5 w-3.5 text-accent-success" />
            <span>Verify Selected</span>
          </CtaButton>
          <CtaButton
            variant="secondary"
            size="xs"
            className="text-accent-error hover:border-accent-error/40 hover:text-accent-error"
            onClick={onBatchDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Remove Selected</span>
          </CtaButton>
          <button
            type="button"
            onClick={onClearSelection}
            className="text-xs font-bold text-ink-secondary hover:text-brand-900 transition-colors px-1"
          >
            Clear
          </button>
        </>
      }
      headerAction={
        <CtaButton variant="primary" size="xs" onClick={onAddNewArtisan}>
          <Plus className="h-3.5 w-3.5" />
          <span>Add Artisan Pro</span>
        </CtaButton>
      }
    >
      {filteredArtisans.length === 0 ? (
        <AdminEmptyState
          title="No Matching Artisans"
          description="Try clearing your search query or switching the user filter tab."
          icon={<Users className="h-5 w-5 text-accent-sky" />}
          action={
            <CtaButton variant="secondary" size="xs" onClick={onResetFilters}>
              Reset Filters
            </CtaButton>
          }
        />
      ) : (
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead className="w-10">
                <AdminCheckbox
                  aria-label="Select all artisans"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={(e) => onToggleSelectAll(e.target.checked)}
                />
              </AdminTableHead>
              <AdminTableHead>Artisan Pro</AdminTableHead>
              <AdminTableHead>Trade &amp; Rate</AdminTableHead>
              <AdminTableHead>Rating &amp; Jobs</AdminTableHead>
              <AdminTableHead>KYC Status</AdminTableHead>
              <AdminTableHead className="text-right">Actions</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {filteredArtisans.map((art) => (
              <AdminTableRow
                key={art.id}
                isSelected={selectedIds.includes(art.id)}
              >
                <AdminTableCell className="w-10">
                  <AdminCheckbox
                    aria-label={`Select artisan ${art.name}`}
                    checked={selectedIds.includes(art.id)}
                    onChange={() => onToggleSelectOne(art.id)}
                  />
                </AdminTableCell>

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

                <AdminTableCell className="text-right whitespace-nowrap">
                  <AdminActionMenu
                    label={`Manage ${art.name}`}
                    ariaLabel={`Actions for artisan ${art.name}`}
                    items={[
                      {
                        id: "edit",
                        label: "Edit Artisan in Form",
                        description: "Modify profile, rate & NUBAN",
                        icon: <Pencil className="h-3.5 w-3.5" />,
                        variant: "primary",
                        onClick: () => onEditArtisan(art),
                      },
                      {
                        id: "approve-kyc",
                        label: "Approve & Verify KYC",
                        description: "Authorize job dispatch & payouts",
                        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
                        disabled:
                          busyId === art.id || art.kycStatus === "verified",
                        onClick: () => onUpdateKyc(art.id, "verified"),
                      },
                      {
                        id: "pending-kyc",
                        label: "Mark KYC Pending",
                        description: "Move to verification review queue",
                        icon: <Clock className="h-3.5 w-3.5" />,
                        disabled:
                          busyId === art.id || art.kycStatus === "pending",
                        onClick: () => onUpdateKyc(art.id, "pending"),
                      },
                      {
                        id: "toggle-online",
                        label: art.isOnline
                          ? "Set Dispatch Offline"
                          : "Set Dispatch Online",
                        description: "Toggle live availability status",
                        icon: <Power className="h-3.5 w-3.5" />,
                        disabled: busyId === art.id,
                        onClick: () => onToggleOnline(art),
                      },
                      {
                        id: "reject-kyc",
                        label: "Reject KYC Credentials",
                        description: "Flag NIN or bank mismatch",
                        icon: <XCircle className="h-3.5 w-3.5" />,
                        variant: "danger",
                        dividerBefore: true,
                        disabled:
                          busyId === art.id || art.kycStatus === "rejected",
                        onClick: () => onUpdateKyc(art.id, "rejected"),
                      },
                      {
                        id: "delete",
                        label: "Delete Artisan Record",
                        description: "Remove artisan from directory",
                        icon: <Trash2 className="h-3.5 w-3.5" />,
                        variant: "danger",
                        onClick: () => onDeleteArtisan(art.id),
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
  );
}

