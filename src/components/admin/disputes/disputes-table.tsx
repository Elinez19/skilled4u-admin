"use client";

import { CheckCircle2, Lock, Pencil, Plus, Scale, ShieldAlert, Trash2 } from "lucide-react";
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
import { formatCurrency } from "@/lib/utils";
import type { DisputeItem, DisputeStatus } from "./types";

export interface DisputesTableProps {
  items: DisputeItem[];
  selectedIds: string[];
  onToggleSelectAll: (checked: boolean) => void;
  onToggleSelectOne: (id: string) => void;
  onClearSelection: () => void;
  onResolveSelected: () => void;
  onDeleteSelected: () => void;
  onOpenCreate: () => void;
  onLoadIntoForm: (item: DisputeItem) => void;
  onUpdateStatus: (id: string, status: DisputeStatus) => void;
  onDelete: (id: string) => void;
}

export function DisputesTable({
  items,
  selectedIds,
  onToggleSelectAll,
  onToggleSelectOne,
  onClearSelection,
  onResolveSelected,
  onDeleteSelected,
  onOpenCreate,
  onLoadIntoForm,
  onUpdateStatus,
  onDelete,
}: DisputesTableProps) {
  const allSelected =
    items.length > 0 && items.every((i) => selectedIds.includes(i.id));
  const someSelected =
    items.some((i) => selectedIds.includes(i.id)) && !allSelected;

  return (
    <div className="mt-4">
      <AdminDataTable
        title="Marketplace Dispute & Arbitration Queue"
        subtitle="Review customer and artisan reports, mediate service quality claims, and use the three-dots menu to edit or settle."
        badge={`${items.length} Showing`}
        selectedCount={selectedIds.length}
        bulkActions={
          <>
            <CtaButton
              variant="secondary"
              size="xs"
              onClick={onResolveSelected}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-accent-success" />
              <span>Resolve Selected</span>
            </CtaButton>
            <CtaButton
              variant="secondary"
              size="xs"
              className="text-accent-error hover:border-accent-error/40 hover:text-accent-error"
              onClick={onDeleteSelected}
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
          <CtaButton variant="primary" size="xs" onClick={onOpenCreate}>
            <Plus className="h-3.5 w-3.5" />
            <span>Open Case</span>
          </CtaButton>
        }
      >
        {items.length === 0 ? (
          <AdminEmptyState
            title="No Dispute Cases Found"
            description="All marketplace dispatches are currently operating without open arbitration claims."
            icon={<ShieldAlert className="h-5 w-5 text-accent-sky" />}
          />
        ) : (
          <AdminTable>
            <AdminTableHeader>
              <AdminTableRow>
                <AdminTableHead className="w-10">
                  <AdminCheckbox
                    aria-label="Select all disputes"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={(e) => onToggleSelectAll(e.target.checked)}
                  />
                </AdminTableHead>
                <AdminTableHead>Case &amp; Booking</AdminTableHead>
                <AdminTableHead>Client &amp; Artisan</AdminTableHead>
                <AdminTableHead>Service</AdminTableHead>
                <AdminTableHead>Frozen Escrow</AdminTableHead>
                <AdminTableHead>Status</AdminTableHead>
                <AdminTableHead className="text-right">Actions</AdminTableHead>
              </AdminTableRow>
            </AdminTableHeader>
            <AdminTableBody>
              {items.map((item) => (
                <AdminTableRow
                  key={item.id}
                  isSelected={selectedIds.includes(item.id)}
                >
                  <AdminTableCell className="w-10">
                    <AdminCheckbox
                      aria-label={`Select dispute case ${item.caseCode}`}
                      checked={selectedIds.includes(item.id)}
                      onChange={() => onToggleSelectOne(item.id)}
                    />
                  </AdminTableCell>

                  <AdminTableCell className="whitespace-nowrap">
                    <div className="font-mono text-xs font-extrabold text-brand-700">
                      {item.caseCode}
                    </div>
                    <div className="font-mono text-[10px] font-semibold text-ink-muted">
                      Booking: {item.bookingCode}
                    </div>
                  </AdminTableCell>

                  <AdminTableCell className="whitespace-nowrap">
                    <div className="font-display text-xs font-extrabold text-brand-950">
                      {item.clientName}
                    </div>
                    <div className="text-[11px] font-semibold text-brand-600">
                      Pro: {item.artisanName}
                    </div>
                  </AdminTableCell>

                  <AdminTableCell className="max-w-[240px]">
                    <div className="truncate font-display text-xs font-extrabold text-brand-950">
                      {item.serviceTitle}
                    </div>
                  </AdminTableCell>

                  <AdminTableCell className="whitespace-nowrap">
                    <span className="font-display text-xs font-extrabold text-brand-950">
                      {formatCurrency(item.escrowAmount)}
                    </span>
                  </AdminTableCell>

                  <AdminTableCell>
                    <AdminStatusPill
                      status={
                        item.status === "resolved" ? "completed" : item.status
                      }
                    />
                  </AdminTableCell>

                  <AdminTableCell className="text-right whitespace-nowrap">
                    <AdminActionMenu
                      label={`Case ${item.caseCode}`}
                      ariaLabel={`Actions for dispute case ${item.caseCode}`}
                      items={[
                        {
                          id: "edit",
                          label: "Edit & Arbitrate in Form",
                          description: "Load case into inline form",
                          icon: <Pencil className="h-3.5 w-3.5" />,
                          variant: "primary",
                          onClick: () => onLoadIntoForm(item),
                        },
                        {
                          id: "resolve",
                          label: "Resolve & Release Escrow",
                          description: "Authorize settlement payout",
                          icon: <CheckCircle2 className="h-3.5 w-3.5" />,
                          disabled: item.status === "resolved",
                          onClick: () => onUpdateStatus(item.id, "resolved"),
                        },
                        {
                          id: "freeze",
                          label: "Freeze Escrow in Hold",
                          description: "Lock funds pending inspection",
                          icon: <Lock className="h-3.5 w-3.5" />,
                          disabled: item.status === "held",
                          onClick: () => onUpdateStatus(item.id, "held"),
                        },
                        {
                          id: "dispute",
                          label: "Flag Active Dispute",
                          description: "Reopen arbitration review",
                          icon: <Scale className="h-3.5 w-3.5" />,
                          disabled: item.status === "disputed",
                          onClick: () => onUpdateStatus(item.id, "disputed"),
                        },
                        {
                          id: "delete",
                          label: "Delete Case Record",
                          description: "Remove from dispute ledger",
                          icon: <Trash2 className="h-3.5 w-3.5" />,
                          variant: "danger",
                          dividerBefore: true,
                          onClick: () => onDelete(item.id),
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
  );
}

