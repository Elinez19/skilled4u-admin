"use client";

import {
  ArrowUpRight,
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  Pencil,
  Play,
  Scale,
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
import { AdminStatusPill } from "@/components/admin/ui/admin-status-pill";
import { CtaButton } from "@/components/landing/ui/cta-button";
import type { BookingRow } from "@/db/schema";
import { formatCurrency } from "@/lib/utils";

export interface OverviewRecentBookingsTableProps {
  bookings: BookingRow[];
  selectedIds: string[];
  onToggleSelectAll: (checked: boolean, visibleItems: BookingRow[]) => void;
  onToggleSelectOne: (id: string) => void;
  onClearSelection: () => void;
  onMarkSelectedCompleted: () => void;
  onRemoveSelected: () => void;
  onUpdateBookingStatus: (id: string, status: string) => Promise<void>;
}

export function OverviewRecentBookingsTable({
  bookings,
  selectedIds,
  onToggleSelectAll,
  onToggleSelectOne,
  onClearSelection,
  onMarkSelectedCompleted,
  onRemoveSelected,
  onUpdateBookingStatus,
}: OverviewRecentBookingsTableProps) {
  const visibleBookings = bookings.slice(0, 6);
  const allSelected =
    visibleBookings.length > 0 &&
    visibleBookings.every((b) => selectedIds.includes(b.id));
  const someSelected =
    visibleBookings.some((b) => selectedIds.includes(b.id)) && !allSelected;

  return (
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
            onClick={onMarkSelectedCompleted}
          >
            <span>Mark Completed</span>
          </CtaButton>
          <CtaButton
            variant="secondary"
            size="xs"
            className="text-accent-error hover:border-accent-error/40 hover:text-accent-error"
            onClick={onRemoveSelected}
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
        <CtaButton variant="secondary" size="xs" href="/admin/bookings">
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
            <CtaButton variant="primary" size="xs" href="/admin/bookings">
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
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={(e) =>
                    onToggleSelectAll(e.target.checked, visibleBookings)
                  }
                />
              </AdminTableHead>
              <AdminTableHead>Booking Code</AdminTableHead>
              <AdminTableHead>Client &amp; Service</AdminTableHead>
              <AdminTableHead>Artisan Pro</AdminTableHead>
              <AdminTableHead>Amount</AdminTableHead>
              <AdminTableHead>Status</AdminTableHead>
              <AdminTableHead className="text-right">Actions</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {visibleBookings.map((bk) => (
              <AdminTableRow
                key={bk.id}
                isSelected={selectedIds.includes(bk.id)}
              >
                <AdminTableCell className="w-10">
                  <AdminCheckbox
                    aria-label={`Select booking ${bk.bookingCode}`}
                    checked={selectedIds.includes(bk.id)}
                    onChange={() => onToggleSelectOne(bk.id)}
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
                        onClick: () => onUpdateBookingStatus(bk.id, "accepted"),
                      },
                      {
                        id: "in-progress",
                        label: "Mark In Progress",
                        description: "Artisan arrived on-site",
                        icon: <Play className="h-3.5 w-3.5" />,
                        disabled: bk.status === "in_progress",
                        onClick: () =>
                          onUpdateBookingStatus(bk.id, "in_progress"),
                      },
                      {
                        id: "complete",
                        label: "Complete Job",
                        description: "Finalize service & sign-off",
                        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
                        disabled: bk.status === "completed",
                        onClick: () =>
                          onUpdateBookingStatus(bk.id, "completed"),
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
  );
}

