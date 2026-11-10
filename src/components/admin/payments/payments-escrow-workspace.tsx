"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import {
  AdminHeroBanner,
  AdminWorkspaceSlab,
} from "@/components/admin/ui/admin-hero-banner";
import type { PaymentRow } from "@/db/schema";
import { usePaymentFilters } from "@/hooks/admin/use-payment-filters";
import { usePaymentForm } from "@/hooks/admin/use-payment-form";
import { usePaymentsEscrow } from "@/hooks/admin/use-payments-escrow";
import { PaymentLedgerForm } from "./payment-ledger-form";
import { PaymentsEscrowTable } from "./payments-escrow-table";
import { PaymentsKpiSummary } from "./payments-kpi-summary";

export function PaymentsEscrowWorkspace({
  initialPayments,
}: {
  initialPayments: PaymentRow[];
}) {
  const {
    items,
    releasingId,
    saving,
    savedBanner,
    handleReleaseEscrow,
    updateEscrowStateLocal,
    deletePayment,
    savePayment,
    batchRelease,
    batchDelete,
    totalVolume,
    heldVolume,
    totalFee,
  } = usePaymentsEscrow(initialPayments);

  const {
    filter,
    setFilter,
    search,
    setSearch,
    selectedIds,
    toggleSelectAll,
    toggleSelectOne,
    clearSelection,
    tabOptions,
    filteredPayments,
  } = usePaymentFilters(items);

  const {
    formOpen,
    setFormOpen,
    formRef,
    formData,
    updateField,
    setPaymentMethod,
    setEscrowStatus,
    scrollToForm,
    resetForm,
    loadPaymentIntoForm,
  } = usePaymentForm();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await savePayment(formData);
    if (ok) {
      resetForm();
    }
  };

  const handleNewRecordClick = () => {
    resetForm();
    scrollToForm();
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <AdminHeroBanner
        eyebrow="Marketplace Financials & Escrow"
        eyebrowIcon="dot"
        headline="Payments & Escrow Ledger."
        highlightWords={["Payments", "Escrow", "Ledger."]}
        subtitle="Add, edit, and manage customer escrow deposits, artisan 90% payouts, and platform 10% commissions using the inline form and table actions below."
        primaryCta={{
          label: "Record Escrow Deposit",
          onClick: handleNewRecordClick,
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
        <PaymentsKpiSummary
          totalVolume={totalVolume}
          heldVolume={heldVolume}
          totalFee={totalFee}
          totalTransactionsCount={items.length}
        />

        {/* Inline Form to Add, Edit, and Manage Financials & Escrow Transactions */}
        <div className="mt-6">
          <PaymentLedgerForm
            formRef={formRef}
            open={formOpen}
            onOpenChange={setFormOpen}
            formData={formData}
            onUpdateField={updateField}
            onSetPaymentMethod={setPaymentMethod}
            onSetEscrowStatus={setEscrowStatus}
            onReset={resetForm}
            onSubmit={handleFormSubmit}
            saving={saving}
            savedMessage={savedBanner}
          />
        </div>

        {/* Payments Ledger Table */}
        <PaymentsEscrowTable
          filteredPayments={filteredPayments}
          totalFilteredCount={filteredPayments.length}
          selectedIds={selectedIds}
          tabOptions={tabOptions}
          filter={filter}
          onFilterChange={setFilter}
          search={search}
          onSearchChange={setSearch}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelectOne={toggleSelectOne}
          onClearSelection={clearSelection}
          onBatchRelease={() => {
            batchRelease(selectedIds);
            clearSelection();
          }}
          onBatchDelete={() => {
            batchDelete(selectedIds);
            clearSelection();
          }}
          onAddNewPayment={handleNewRecordClick}
          onEditPayment={loadPaymentIntoForm}
          onReleaseEscrow={handleReleaseEscrow}
          onUpdateEscrowState={updateEscrowStateLocal}
          onDeletePayment={(id) => {
            deletePayment(id, () => {
              if (formData.editingId === id) resetForm();
            });
          }}
          releasingId={releasingId}
        />
      </AdminWorkspaceSlab>
    </div>
  );
}

