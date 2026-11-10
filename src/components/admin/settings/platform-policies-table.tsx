"use client";

import {
  CheckCircle2,
  Clock,
  Pencil,
  Plus,
  RotateCcw,
  Settings,
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
import { PillBadge } from "@/components/landing/ui/pill-badge";
import type { PolicySettingItem } from "./types";

export interface PlatformPoliciesTableProps {
  policies: PolicySettingItem[];
  selectedIds: string[];
  onToggleSelectAll: (checked: boolean) => void;
  onToggleSelectOne: (id: string) => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  onOpenCreate: () => void;
  onLoadIntoForm: (item: PolicySettingItem) => void;
  onToggleStatus: (id: string) => void;
  onResetToDefault: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PlatformPoliciesTable({
  policies,
  selectedIds,
  onToggleSelectAll,
  onToggleSelectOne,
  onClearSelection,
  onDeleteSelected,
  onOpenCreate,
  onLoadIntoForm,
  onToggleStatus,
  onResetToDefault,
  onDelete,
}: PlatformPoliciesTableProps) {
  const allSelected =
    policies.length > 0 && policies.every((p) => selectedIds.includes(p.id));
  const someSelected =
    policies.some((p) => selectedIds.includes(p.id)) && !allSelected;

  return (
    <div className="mt-4">
      <AdminDataTable
        title="Platform Settings & Governance Rules Ledger"
        subtitle="Inspect active marketplace configuration rules and use the three-dots action menu to edit, pause, or reset any setting."
        badge={`${policies.length} Rules`}
        selectedCount={selectedIds.length}
        bulkActions={
          <>
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
            <span>Add Setting</span>
          </CtaButton>
        }
      >
        {policies.length === 0 ? (
          <AdminEmptyState
            title="No Matching Settings Found"
            description="Try clearing your search filter or add a new policy rule in the inline form above."
            icon={<Settings className="h-5 w-5 text-accent-sky" />}
          />
        ) : (
          <AdminTable>
            <AdminTableHeader>
              <AdminTableRow>
                <AdminTableHead className="w-10">
                  <AdminCheckbox
                    aria-label="Select all settings"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={(e) => onToggleSelectAll(e.target.checked)}
                  />
                </AdminTableHead>
                <AdminTableHead>Setting &amp; Key</AdminTableHead>
                <AdminTableHead>Category</AdminTableHead>
                <AdminTableHead>Configured Value</AdminTableHead>
                <AdminTableHead>Status</AdminTableHead>
                <AdminTableHead className="text-right">Actions</AdminTableHead>
              </AdminTableRow>
            </AdminTableHeader>
            <AdminTableBody>
              {policies.map((item) => (
                <AdminTableRow
                  key={item.id}
                  isSelected={selectedIds.includes(item.id)}
                >
                  <AdminTableCell className="w-10">
                    <AdminCheckbox
                      aria-label={`Select setting ${item.title}`}
                      checked={selectedIds.includes(item.id)}
                      onChange={() => onToggleSelectOne(item.id)}
                    />
                  </AdminTableCell>

                  <AdminTableCell className="whitespace-nowrap">
                    <div className="font-display text-xs font-extrabold text-brand-950">
                      {item.title}
                    </div>
                    <div className="font-mono text-[10px] font-semibold text-brand-600">
                      {item.keyCode} · {item.updatedAt}
                    </div>
                  </AdminTableCell>

                  <AdminTableCell className="whitespace-nowrap">
                    <PillBadge
                      tone="porcelain"
                      className="px-2.5 py-0.5 text-[10px] uppercase"
                    >
                      {item.category}
                    </PillBadge>
                  </AdminTableCell>

                  <AdminTableCell className="whitespace-nowrap">
                    <span className="font-display text-xs sm:text-sm font-extrabold text-brand-950">
                      {item.value}
                    </span>
                  </AdminTableCell>

                  <AdminTableCell>
                    <AdminStatusPill status={item.status} />
                  </AdminTableCell>

                  <AdminTableCell className="text-right whitespace-nowrap">
                    <AdminActionMenu
                      label={`Setting ${item.keyCode}`}
                      ariaLabel={`Actions for setting ${item.title}`}
                      items={[
                        {
                          id: "edit",
                          label: "Edit Setting in Form",
                          description: "Load rule into inline form",
                          icon: <Pencil className="h-3.5 w-3.5" />,
                          variant: "primary",
                          onClick: () => onLoadIntoForm(item),
                        },
                        {
                          id: "toggle",
                          label:
                            item.status === "active"
                              ? "Pause Policy Rule"
                              : "Activate Policy Rule",
                          description: "Toggle live rule enforcement",
                          icon:
                            item.status === "active" ? (
                              <Clock className="h-3.5 w-3.5" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ),
                          onClick: () => onToggleStatus(item.id),
                        },
                        {
                          id: "reset",
                          label: "Reset to Default",
                          description: `Restore (${item.defaultValue})`,
                          icon: <RotateCcw className="h-3.5 w-3.5" />,
                          onClick: () => onResetToDefault(item.id),
                        },
                        {
                          id: "delete",
                          label: "Delete Policy Rule",
                          description: "Remove setting from ledger",
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

