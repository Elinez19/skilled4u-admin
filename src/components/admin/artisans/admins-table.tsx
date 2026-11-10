"use client";

import * as React from "react";
import { Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
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
import type { AdminRecord } from "./types";

export interface AdminsTableProps {
  filteredAdmins: AdminRecord[];
  selectedIds: string[];
  onToggleSelectAll: (checked: boolean) => void;
  onToggleSelectOne: (id: string) => void;
  onClearSelection: () => void;
  onBatchDelete: () => void;
  onAddNewAdmin: () => void;
  onEditAdmin: (admin: AdminRecord) => void;
  onToggleStatus: (id: string) => void;
  onDeleteAdmin: (id: string) => void;
}

export function AdminsTable({
  filteredAdmins,
  selectedIds,
  onToggleSelectAll,
  onToggleSelectOne,
  onClearSelection,
  onBatchDelete,
  onAddNewAdmin,
  onEditAdmin,
  onToggleStatus,
  onDeleteAdmin,
}: AdminsTableProps) {
  const allSelected =
    filteredAdmins.length > 0 &&
    filteredAdmins.every((a) => selectedIds.includes(a.id));

  const someSelected =
    filteredAdmins.some((a) => selectedIds.includes(a.id)) && !allSelected;

  return (
    <AdminDataTable
      title="Administrator Roles & Access Control"
      subtitle="Manage internal admin team members responsible for user verification, dispatch, disputes, and support."
      badge={`${filteredAdmins.length} Admins`}
      selectedCount={selectedIds.length}
      bulkActions={
        <>
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
        <CtaButton variant="primary" size="xs" onClick={onAddNewAdmin}>
          <Plus className="h-3.5 w-3.5" />
          <span>Add Admin</span>
        </CtaButton>
      }
    >
      {filteredAdmins.length === 0 ? (
        <AdminEmptyState
          title="No Matching Administrators"
          description="Try clearing your search query or add an administrator in the inline form above."
          icon={<ShieldCheck className="h-5 w-5 text-accent-sky" />}
        />
      ) : (
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead className="w-10">
                <AdminCheckbox
                  aria-label="Select all administrators"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={(e) => onToggleSelectAll(e.target.checked)}
                />
              </AdminTableHead>
              <AdminTableHead>Administrator</AdminTableHead>
              <AdminTableHead>Assigned Role</AdminTableHead>
              <AdminTableHead>Last Activity</AdminTableHead>
              <AdminTableHead>Status</AdminTableHead>
              <AdminTableHead className="text-right">Actions</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {filteredAdmins.map((adm) => (
              <AdminTableRow
                key={adm.id}
                isSelected={selectedIds.includes(adm.id)}
              >
                <AdminTableCell className="w-10">
                  <AdminCheckbox
                    aria-label={`Select administrator ${adm.name}`}
                    checked={selectedIds.includes(adm.id)}
                    onChange={() => onToggleSelectOne(adm.id)}
                  />
                </AdminTableCell>
                <AdminTableCell className="whitespace-nowrap">
                  <div className="font-display text-xs sm:text-sm font-extrabold text-brand-950">
                    {adm.name}
                  </div>
                  <div className="text-[11px] font-semibold text-ink-secondary">
                    {adm.email}
                  </div>
                </AdminTableCell>
                <AdminTableCell className="whitespace-nowrap">
                  <PillBadge
                    tone="porcelain"
                    icon="shield"
                    className="px-2.5 py-0.5 text-[10px]"
                  >
                    {adm.roleTitle}
                  </PillBadge>
                </AdminTableCell>
                <AdminTableCell className="text-xs font-bold text-brand-700 whitespace-nowrap">
                  {adm.lastActive}
                </AdminTableCell>
                <AdminTableCell>
                  <AdminStatusPill status={adm.status} />
                </AdminTableCell>
                <AdminTableCell className="text-right whitespace-nowrap">
                  <AdminActionMenu
                    label={`Manage ${adm.name}`}
                    ariaLabel={`Actions for administrator ${adm.name}`}
                    items={[
                      {
                        id: "edit",
                        label: "Edit Admin in Form",
                        description: "Modify role & permissions scope",
                        icon: <Pencil className="h-3.5 w-3.5" />,
                        variant: "primary",
                        onClick: () => onEditAdmin(adm),
                      },
                      {
                        id: "toggle-status",
                        label:
                          adm.status === "verified"
                            ? "Set Active Staff Status"
                            : "Mark Verified Admin",
                        description: "Update admin badge level",
                        icon: <ShieldCheck className="h-3.5 w-3.5" />,
                        onClick: () => onToggleStatus(adm.id),
                      },
                      {
                        id: "delete",
                        label: "Revoke Admin Access",
                        description: "Remove administrator account",
                        icon: <Trash2 className="h-3.5 w-3.5" />,
                        variant: "danger",
                        dividerBefore: true,
                        onClick: () => onDeleteAdmin(adm.id),
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

