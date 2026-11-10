"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import {
  AdminHeroBanner,
  AdminWorkspaceSlab,
} from "@/components/admin/ui/admin-hero-banner";
import type { BookingRow } from "@/db/schema";
import { useBookingFilters } from "@/hooks/admin/use-booking-filters";
import { useBookingForm } from "@/hooks/admin/use-booking-form";
import { useBookingsDispatch } from "@/hooks/admin/use-bookings-dispatch";
import { BookingDispatchForm } from "./booking-dispatch-form";
import { BookingDispatchTable } from "./booking-dispatch-table";

export function BookingsDispatchWorkspace({
  initialBookings,
}: {
  initialBookings: BookingRow[];
}) {
  const {
    items,
    busyId,
    savedBanner,
    saving,
    updateBookingFields,
    deleteBooking,
    saveBooking,
    batchComplete,
    batchDelete,
  } = useBookingsDispatch(initialBookings);

  const {
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    selectedIds,
    toggleSelectAll,
    toggleSelectOne,
    clearSelection,
    tabOptions,
    filteredBookings,
  } = useBookingFilters(items);

  const {
    formOpen,
    setFormOpen,
    formRef,
    editingId,
    editingCode,
    formData,
    updateField,
    setBookingStatus,
    setPaymentStatus,
    scrollToForm,
    resetForm,
    loadBookingIntoForm,
  } = useBookingForm();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await saveBooking(formData, editingId, editingCode);
    if (ok) {
      resetForm();
    }
  };

  const handleNewDispatchClick = () => {
    resetForm();
    scrollToForm();
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <AdminHeroBanner
        eyebrow="Service Scheduling & Live Dispatch"
        eyebrowIcon="pin"
        headline="Bookings & Dispatch Management."
        highlightWords={["Bookings", "Dispatch", "Management."]}
        subtitle="Add, edit, and manage customer service bookings using the inline form below, assign verified artisans, and advance dispatch states from the table action menu."
        primaryCta={{
          label: "New Dispatch Booking",
          onClick: handleNewDispatchClick,
          variant: "primary",
          icon: <Plus className="h-4 w-4" />,
        }}
        secondaryCta={{
          label: "Financials & Escrow",
          href: "/admin/financials",
          variant: "secondary",
          trailingArrow: true,
        }}
      />

      <AdminWorkspaceSlab tone="pearl" withPearlAsset>
        {/* Inline Form to Add, Edit & Manage Bookings */}
        <BookingDispatchForm
          formRef={formRef}
          open={formOpen}
          onOpenChange={setFormOpen}
          editingId={editingId}
          editingCode={editingCode}
          formData={formData}
          onUpdateField={updateField}
          onSetBookingStatus={setBookingStatus}
          onSetPaymentStatus={setPaymentStatus}
          onReset={resetForm}
          onSubmit={handleFormSubmit}
          saving={saving}
          savedMessage={savedBanner}
        />

        {/* Bookings Queue Table with Checkboxes, Filters & Actions */}
        <BookingDispatchTable
          filteredBookings={filteredBookings}
          totalFilteredCount={filteredBookings.length}
          selectedIds={selectedIds}
          tabOptions={tabOptions}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          search={search}
          onSearchChange={setSearch}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelectOne={toggleSelectOne}
          onClearSelection={clearSelection}
          onBatchComplete={() => {
            batchComplete(selectedIds);
            clearSelection();
          }}
          onBatchDelete={() => {
            batchDelete(selectedIds);
            clearSelection();
          }}
          onAddNewBooking={handleNewDispatchClick}
          onEditBooking={loadBookingIntoForm}
          onUpdateBookingStatus={updateBookingFields}
          onDeleteBooking={(id) => {
            deleteBooking(id, () => {
              if (editingId === id) resetForm();
            });
          }}
          busyId={busyId}
        />
      </AdminWorkspaceSlab>
    </div>
  );
}

