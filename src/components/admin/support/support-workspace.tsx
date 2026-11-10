"use client";

import { Plus } from "lucide-react";
import { AdminHeroBanner, AdminWorkspaceSlab } from "@/components/admin/ui/admin-hero-banner";
import { AdminSearchInput } from "@/components/admin/ui/admin-form-controls";
import { AdminSegmentedTabs } from "@/components/admin/ui/admin-segmented-tabs";
import { useSupportTickets } from "@/hooks/admin/use-support-tickets";
import { SupportKpiSummary } from "./support-kpi-summary";
import { SupportTicketForm } from "./support-ticket-form";
import { SupportTicketsTable } from "./support-tickets-table";
import type { SupportTicket } from "./types";

export interface SupportWorkspaceProps {
  initialTickets?: SupportTicket[];
}

export function SupportWorkspace({ initialTickets }: SupportWorkspaceProps) {
  const {
    filtered,
    filter,
    setFilter,
    search,
    setSearch,
    selectedIds,
    tabOptions,
    openTickets,
    toggleSelectAll,
    toggleSelectOne,
    clearSelection,
    resolveSelected,
    deleteSelected,
    updateTicketStatus,
    togglePriority,
    deleteTicket,
    formRef,
    formOpen,
    setFormOpen,
    editingId,
    editingCode,
    requesterName,
    setRequesterName,
    requesterRole,
    setRequesterRole,
    city,
    setCity,
    priority,
    setPriority,
    status,
    setStatus,
    subject,
    setSubject,
    savedBanner,
    resetForm,
    loadTicketIntoForm,
    scrollToForm,
    handleSaveTicket,
  } = useSupportTickets(initialTickets);

  return (
    <div className="space-y-3 sm:space-y-4">
      <AdminHeroBanner
        eyebrow="Customer & Artisan Helpdesk"
        eyebrowIcon="dot"
        headline="Support & Helpdesk Management."
        highlightWords={["Support", "Helpdesk", "Management."]}
        subtitle="Log, edit, and manage customer and artisan helpdesk tickets using the inline form below, or use the table three-dots action menu to resolve inquiries."
        primaryCta={{
          label: "Log Support Ticket",
          onClick: () => {
            resetForm();
            scrollToForm();
          },
          variant: "primary",
          icon: <Plus className="h-4 w-4" />,
        }}
        secondaryCta={{
          label: "Disputes & Claims",
          href: "/admin/disputes",
          variant: "secondary",
          trailingArrow: true,
        }}
      />

      <AdminWorkspaceSlab tone="pearl" withPearlAsset>
        <SupportKpiSummary openTickets={openTickets} />

        <SupportTicketForm
          formRef={formRef}
          open={formOpen}
          onOpenChange={setFormOpen}
          editingId={editingId}
          editingCode={editingCode}
          requesterName={requesterName}
          setRequesterName={setRequesterName}
          requesterRole={requesterRole}
          setRequesterRole={setRequesterRole}
          city={city}
          setCity={setCity}
          priority={priority}
          setPriority={setPriority}
          status={status}
          setStatus={setStatus}
          subject={subject}
          setSubject={setSubject}
          savedMessage={savedBanner}
          onReset={resetForm}
          onSubmit={handleSaveTicket}
        />

        <div className="mt-6 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <AdminSegmentedTabs
            options={tabOptions}
            value={filter}
            onChange={setFilter}
            ariaLabel="Filter support tickets"
            layoutId="support-tab-pill"
          />

          <AdminSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search ticket code, requester, or subject..."
          />
        </div>

        <SupportTicketsTable
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
          onLoadIntoForm={loadTicketIntoForm}
          onUpdateStatus={updateTicketStatus}
          onTogglePriority={togglePriority}
          onDelete={deleteTicket}
        />
      </AdminWorkspaceSlab>
    </div>
  );
}

