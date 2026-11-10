"use client";

import * as React from "react";
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Lock,
  Pencil,
  Play,
  Plus,
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
import { AdminSearchInput } from "@/components/admin/ui/admin-form-controls";
import {
  AdminSegmentedTabs,
  type AdminTabOption,
} from "@/components/admin/ui/admin-segmented-tabs";
import { AdminStatusPill } from "@/components/admin/ui/admin-status-pill";
import { CtaButton } from "@/components/landing/ui/cta-button";
import type { BookingRow } from "@/db/schema";
import { formatCurrency } from "@/lib/utils";
import type { BookingStatusFilter } from "./types";

export interface BookingDispatchTableProps {
  filteredBookings: BookingRow[];
  totalFilteredCount: number;
  selectedIds: string[];
  tabOptions: ReadonlyArray<AdminTabOption<BookingStatusFilter>>;
  statusFilter: BookingStatusFilter;
  onStatusFilterChange: (status: BookingStatusFilter) => void;
  search: string;
  onSearchChange: (search: string) => void;
  onToggleSelectAll: () => void;
  onToggleSelectOne: (id: string) => void;
  onClearSelection: () => void;
  onBatchComplete: () => void;
  onBatchDelete: () => void;
  onAddNewBooking: () => void;
  onEditBooking: (bk: BookingRow) => void;
  onUpdateBookingStatus: (
    id: string,
    patch: { status?: string; paymentStatus?: string }
  ) => void;
  onDeleteBooking: (id: string) => void;
  busyId: string | null;
}

export function BookingDispatchTable({
  filteredBookings,
  totalFilteredCount,
  selectedIds,
  tabOptions,
  statusFilter,
  onStatusFilterChange,
  search,
  onSearchChange,
  onToggleSelectAll,
  onToggleSelectOne,
  onClearSelection,
  onBatchComplete,
  onBatchDelete,
  onAddNewBooking,
  onEditBooking,
  onUpdateBookingStatus,
  onDeleteBooking,
  busyId,
}: BookingDispatchTableProps) {
  const allSelected =
    filteredBookings.length > 0 &&
    filteredBookings.every((b) => selectedIds.includes(b.id));

  const someSelected =
    filteredBookings.some((b) => selectedIds.includes(b.id)) && !allSelected;

  return (
    <>
      {/* Segmented Filter Tabs & Search Input */}
      <div className="mt-6 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <AdminSegmentedTabs
          options={tabOptions}
          value={statusFilter}
          onChange={onStatusFilterChange}
          ariaLabel="Filter bookings by status"
          layoutId="bookings-status-tab-pill"
        />

        <AdminSearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search booking code, client, or artisan..."
        />
      </div>

      {/* Bookings Queue Table with Checkboxes & Essential Columns */}
      <div className="mt-4">
        <AdminDataTable
          title="Service Bookings & Dispatch Queue"
          subtitle="Monitor active artisan dispatches, client schedules, and use the three-dots menu to edit or advance job states."
          badge={`${totalFilteredCount} Showing`}
          selectedCount={selectedIds.length}
          bulkActions={
            <>
              <CtaButton
                variant="secondary"
                size="xs"
                onClick={onBatchComplete}
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-accent-success" />
                <span>Mark Completed</span>
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
            <CtaButton
              variant="primary"
              size="xs"
              onClick={onAddNewBooking}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Booking</span>
            </CtaButton>
          }
        >
          {filteredBookings.length === 0 ? (
            <AdminEmptyState
              title="No Bookings Found"
              description="Create a new dispatch booking in the inline form above or clear your active status filter."
              icon={<CalendarCheck className="h-5 w-5 text-accent-sky" />}
              action={
                <CtaButton
                  variant="primary"
                  size="xs"
                  onClick={onAddNewBooking}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Dispatch Booking</span>
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
                      onChange={onToggleSelectAll}
                    />
                  </AdminTableHead>
                  <AdminTableHead>Booking Code</AdminTableHead>
                  <AdminTableHead>Client &amp; Pro</AdminTableHead>
                  <AdminTableHead>Service</AdminTableHead>
                  <AdminTableHead>Schedule</AdminTableHead>
                  <AdminTableHead>Agreed Price</AdminTableHead>
                  <AdminTableHead>Status</AdminTableHead>
                  <AdminTableHead className="text-right">
                    Actions
                  </AdminTableHead>
                </AdminTableRow>
              </AdminTableHeader>
              <AdminTableBody>
                {filteredBookings.map((bk) => (
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

                    <AdminTableCell className="whitespace-nowrap">
                      <div className="font-display text-xs font-extrabold text-brand-950">
                        {bk.clientName}
                      </div>
                      <div className="text-[11px] font-semibold text-brand-600">
                        Pro: {bk.artisanName}
                      </div>
                    </AdminTableCell>

                    <AdminTableCell>
                      <div className="font-display text-xs font-extrabold text-brand-950 max-w-[200px] truncate">
                        {bk.serviceTitle}
                      </div>
                    </AdminTableCell>

                    <AdminTableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-brand-950">
                        <Calendar className="h-3 w-3 text-brand-600" />
                        <span>{bk.scheduledDate}</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-ink-secondary">
                        <Clock className="h-3 w-3 text-brand-500" />
                        <span>{bk.scheduledTime}</span>
                      </div>
                    </AdminTableCell>

                    <AdminTableCell className="whitespace-nowrap">
                      <div className="font-display text-xs sm:text-sm font-extrabold text-brand-950">
                        {formatCurrency(bk.agreedAmount)}
                      </div>
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
                            id: "edit",
                            label: "Edit Booking in Form",
                            description: "Modify schedule, pro, or price",
                            icon: <Pencil className="h-3.5 w-3.5" />,
                            variant: "primary",
                            onClick: () => onEditBooking(bk),
                          },
                          {
                            id: "accept",
                            label: "Accept Dispatch",
                            description: "Confirm artisan assignment",
                            icon: <CalendarCheck className="h-3.5 w-3.5" />,
                            disabled:
                              busyId === bk.id || bk.status === "accepted",
                            onClick: () =>
                              onUpdateBookingStatus(bk.id, {
                                status: "accepted",
                              }),
                          },
                          {
                            id: "in-progress",
                            label: "Mark In Progress",
                            description: "Artisan arrived on-site",
                            icon: <Play className="h-3.5 w-3.5" />,
                            disabled:
                              busyId === bk.id || bk.status === "in_progress",
                            onClick: () =>
                              onUpdateBookingStatus(bk.id, {
                                status: "in_progress",
                              }),
                          },
                          {
                            id: "complete",
                            label: "Complete Job",
                            description: "Finalize service & sign-off",
                            icon: <CheckCircle2 className="h-3.5 w-3.5" />,
                            disabled:
                              busyId === bk.id || bk.status === "completed",
                            onClick: () =>
                              onUpdateBookingStatus(bk.id, {
                                status: "completed",
                              }),
                          },
                          {
                            id: "escrow-funded",
                            label: "Mark Escrow Funded",
                            description: "Confirm client escrow deposit",
                            icon: <Lock className="h-3.5 w-3.5" />,
                            disabled:
                              busyId === bk.id ||
                              bk.paymentStatus === "escrowed",
                            onClick: () =>
                              onUpdateBookingStatus(bk.id, {
                                paymentStatus: "escrowed",
                              }),
                          },
                          {
                            id: "cancel",
                            label: "Cancel Booking",
                            description: "Abort dispatch schedule",
                            icon: <XCircle className="h-3.5 w-3.5" />,
                            variant: "danger",
                            dividerBefore: true,
                            disabled:
                              busyId === bk.id || bk.status === "cancelled",
                            onClick: () =>
                              onUpdateBookingStatus(bk.id, {
                                status: "cancelled",
                              }),
                          },
                          {
                            id: "delete",
                            label: "Delete Booking",
                            description: "Remove booking record",
                            icon: <Trash2 className="h-3.5 w-3.5" />,
                            variant: "danger",
                            onClick: () => onDeleteBooking(bk.id),
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
    </>
  );
}

