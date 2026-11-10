"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Trash2,
  MessageSquare,
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
import type { SupportTicket, TicketStatus } from "./types";

export interface SupportTicketsTableProps {
  items: SupportTicket[];
  selectedIds: string[];
  onToggleSelectAll: (checked: boolean) => void;
  onToggleSelectOne: (id: string) => void;
  onClearSelection: () => void;
  onResolveSelected: () => void;
  onDeleteSelected: () => void;
  onOpenCreate: () => void;
  onLoadIntoForm: (tkt: SupportTicket) => void;
  onUpdateStatus: (id: string, status: TicketStatus) => void;
  onTogglePriority: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SupportTicketsTable({
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
  onTogglePriority,
  onDelete,
}: SupportTicketsTableProps) {
  const allSelected =
    items.length > 0 && items.every((t) => selectedIds.includes(t.id));
  const someSelected =
    items.some((t) => selectedIds.includes(t.id)) && !allSelected;

  return (
    <div className="mt-4">
      <AdminDataTable
        title="Live Support & Helpdesk Queue"
        subtitle="Respond to artisan account updates, customer booking questions, and use the three-dots menu to edit or resolve tickets."
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
            <span>Log Ticket</span>
          </CtaButton>
        }
      >
        {items.length === 0 ? (
          <AdminEmptyState
            title="No Support Tickets Found"
            description="All customer and artisan support tickets have been resolved."
            icon={<MessageSquare className="h-5 w-5 text-accent-sky" />}
          />
        ) : (
          <AdminTable>
            <AdminTableHeader>
              <AdminTableRow>
                <AdminTableHead className="w-10">
                  <AdminCheckbox
                    aria-label="Select all support tickets"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={(e) => onToggleSelectAll(e.target.checked)}
                  />
                </AdminTableHead>
                <AdminTableHead>Ticket Code</AdminTableHead>
                <AdminTableHead>Requester</AdminTableHead>
                <AdminTableHead>Subject</AdminTableHead>
                <AdminTableHead>Priority</AdminTableHead>
                <AdminTableHead>Status</AdminTableHead>
                <AdminTableHead className="text-right">Actions</AdminTableHead>
              </AdminTableRow>
            </AdminTableHeader>
            <AdminTableBody>
              {items.map((tkt) => (
                <AdminTableRow
                  key={tkt.id}
                  isSelected={selectedIds.includes(tkt.id)}
                >
                  <AdminTableCell className="w-10">
                    <AdminCheckbox
                      aria-label={`Select ticket ${tkt.ticketCode}`}
                      checked={selectedIds.includes(tkt.id)}
                      onChange={() => onToggleSelectOne(tkt.id)}
                    />
                  </AdminTableCell>

                  <AdminTableCell className="whitespace-nowrap">
                    <div className="font-mono text-xs font-extrabold text-brand-700">
                      {tkt.ticketCode}
                    </div>
                    <div className="text-[10px] font-semibold text-ink-muted">
                      {tkt.updatedAt}
                    </div>
                  </AdminTableCell>

                  <AdminTableCell className="whitespace-nowrap">
                    <div className="font-display text-xs font-extrabold text-brand-950">
                      {tkt.requesterName}
                    </div>
                    <div className="text-[11px] font-semibold text-brand-600">
                      {tkt.requesterRole} · {tkt.city}
                    </div>
                  </AdminTableCell>

                  <AdminTableCell className="max-w-[280px]">
                    <div className="truncate font-display text-xs font-extrabold text-brand-950">
                      {tkt.subject}
                    </div>
                  </AdminTableCell>

                  <AdminTableCell>
                    <PillBadge
                      tone={tkt.priority === "High" ? "blue" : "sky"}
                      className="px-2.5 py-0.5 text-[10px]"
                    >
                      {tkt.priority}
                    </PillBadge>
                  </AdminTableCell>

                  <AdminTableCell>
                    <AdminStatusPill status={tkt.status} />
                  </AdminTableCell>

                  <AdminTableCell className="text-right whitespace-nowrap">
                    <AdminActionMenu
                      label={`Ticket ${tkt.ticketCode}`}
                      ariaLabel={`Actions for ticket ${tkt.ticketCode}`}
                      items={[
                        {
                          id: "edit",
                          label: "Edit Ticket in Form",
                          description: "Update subject, role, or priority",
                          icon: <Pencil className="h-3.5 w-3.5" />,
                          variant: "primary",
                          onClick: () => onLoadIntoForm(tkt),
                        },
                        {
                          id: "in-progress",
                          label: "Mark In Progress",
                          description: "Assign to concierge agent",
                          icon: <Play className="h-3.5 w-3.5" />,
                          disabled: tkt.status === "in_progress",
                          onClick: () => onUpdateStatus(tkt.id, "in_progress"),
                        },
                        {
                          id: "resolve",
                          label: "Mark Resolved & Close",
                          description: "Complete helpdesk inquiry",
                          icon: <CheckCircle2 className="h-3.5 w-3.5" />,
                          disabled: tkt.status === "completed",
                          onClick: () => onUpdateStatus(tkt.id, "completed"),
                        },
                        {
                          id: "priority",
                          label:
                            tkt.priority === "High"
                              ? "Set Normal Priority"
                              : "Escalate to High Priority",
                          description: "Adjust SLA response tier",
                          icon: <AlertTriangle className="h-3.5 w-3.5" />,
                          onClick: () => onTogglePriority(tkt.id),
                        },
                        {
                          id: "reopen",
                          label: "Reopen Ticket",
                          description: "Return to open queue",
                          icon: <RotateCcw className="h-3.5 w-3.5" />,
                          disabled: tkt.status === "pending",
                          onClick: () => onUpdateStatus(tkt.id, "pending"),
                        },
                        {
                          id: "delete",
                          label: "Delete Ticket",
                          description: "Remove ticket from queue",
                          icon: <Trash2 className="h-3.5 w-3.5" />,
                          variant: "danger",
                          dividerBefore: true,
                          onClick: () => onDelete(tkt.id),
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

