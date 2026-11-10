"use client";

import { Plus } from "lucide-react";
import { AdminHeroBanner, AdminWorkspaceSlab } from "@/components/admin/ui/admin-hero-banner";
import { AdminSearchInput } from "@/components/admin/ui/admin-form-controls";
import { AdminSegmentedTabs } from "@/components/admin/ui/admin-segmented-tabs";
import { useDisputes } from "@/hooks/admin/use-disputes";
import { DisputesKpiSummary } from "./disputes-kpi-summary";
import { DisputeCaseForm } from "./dispute-case-form";
import { DisputesTable } from "./disputes-table";
import type { DisputeItem } from "./types";

export interface DisputesWorkspaceProps {
  initialDisputes?: DisputeItem[];
}

export function DisputesWorkspace({ initialDisputes }: DisputesWorkspaceProps) {
  const {
    filtered,
    filter,
    setFilter,
    search,
    setSearch,
    selectedIds,
    tabOptions,
    openCount,
    frozenEscrow,
    resolvedCount,
    toggleSelectAll,
    toggleSelectOne,
    clearSelection,
    resolveSelected,
    deleteSelected,
    updateDisputeStatus,
    deleteDispute,
    formRef,
    formOpen,
    setFormOpen,
    editingId,
    editingCaseCode,
    bookingCode,
    setBookingCode,
    clientName,
    setClientName,
    artisanName,
    setArtisanName,
    serviceTitle,
    setServiceTitle,
    escrowAmount,
    setEscrowAmount,
    status,
    setStatus,
    reason,
    setReason,
    savedBanner,
    resetForm,
    loadDisputeIntoForm,
    scrollToForm,
    handleSaveDispute,
  } = useDisputes(initialDisputes);

  return (
    <div className="space-y-3 sm:space-y-4">
      <AdminHeroBanner
        eyebrow="Customer & Artisan Case Resolution"
        eyebrowIcon="shield"
        headline="Disputes & Escrow Resolution."
        highlightWords={["Disputes", "Escrow", "Resolution."]}
        subtitle="Open, edit, and arbitrate service claims between customers and artisans using the inline form below, or use the table three-dots action menu."
        primaryCta={{
          label: "Open Dispute Case",
          onClick: () => {
            resetForm();
            scrollToForm();
          },
          variant: "primary",
          icon: <Plus className="h-4 w-4" />,
        }}
        secondaryCta={{
          label: "Open Financials Ledger",
          href: "/admin/financials",
          variant: "secondary",
          trailingArrow: true,
        }}
      />

      <AdminWorkspaceSlab tone="pearl" withPearlAsset>
        <DisputesKpiSummary
          openCount={openCount}
          frozenEscrow={frozenEscrow}
          resolvedCount={resolvedCount}
        />

        <DisputeCaseForm
          formRef={formRef}
          open={formOpen}
          onOpenChange={setFormOpen}
          editingId={editingId}
          editingCaseCode={editingCaseCode}
          bookingCode={bookingCode}
          setBookingCode={setBookingCode}
          clientName={clientName}
          setClientName={setClientName}
          artisanName={artisanName}
          setArtisanName={setArtisanName}
          serviceTitle={serviceTitle}
          setServiceTitle={setServiceTitle}
          escrowAmount={escrowAmount}
          setEscrowAmount={setEscrowAmount}
          status={status}
          setStatus={setStatus}
          reason={reason}
          setReason={setReason}
          savedMessage={savedBanner}
          onReset={resetForm}
          onSubmit={handleSaveDispute}
        />

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

        <DisputesTable
          items={filtered}
          selectedIds={selectedIds}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelectOne={toggleSelectOne}
          onClearSelection={clearSelection}
          onResolveSelected={resolveSelected}
          onDeleteSelected={deleteSelected}
          onOpenCreate={() => {
            resetForm();
            scrollToForm();
          }}
          onLoadIntoForm={loadDisputeIntoForm}
          onUpdateStatus={updateDisputeStatus}
          onDelete={deleteDispute}
        />
      </AdminWorkspaceSlab>
    </div>
  );
}

