"use client";

import * as React from "react";
import {
  KeyRound,
  LogOut,
  Mail,
  Pencil,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
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
  onSoftDeleteAdmin?: (admin: AdminRecord) => void;
  onHardDeleteAdmin?: (admin: AdminRecord) => void;
  onReactivateAdmin?: (admin: AdminRecord) => void;
  onRevokeSessions?: (id: string) => void;
  onResetPassword?: (id: string) => void;
  onResendInvite?: (id: string) => void;
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
  onSoftDeleteAdmin,
  onHardDeleteAdmin,
  onReactivateAdmin,
  onRevokeSessions,
  onResetPassword,
  onResendInvite,
  onDeleteAdmin,
}: AdminsTableProps) {
  const allSelected =
    filteredAdmins.length > 0 &&
    filteredAdmins.every((a) => selectedIds.includes(a.id));

  const someSelected =
    filteredAdmins.some((a) => selectedIds.includes(a.id)) && !allSelected;

  const renderScopeBadge = (scope: string) => {
    switch (scope) {
      case "super_admin":
        return (
          <span className="inline-flex items-center gap-1 rounded-pill bg-brand-950 px-2.5 py-0.5 font-display text-[10px] font-extrabold text-accent-gold border border-accent-gold/40 whitespace-nowrap shadow-gloss-card">
            <Sparkles className="h-2.5 w-2.5" />
            <span>Super Admin</span>
          </span>
        );
      case "kyc_moderator":
        return (
          <span className="inline-flex items-center gap-1 rounded-pill bg-surface-mist px-2.5 py-0.5 font-display text-[10px] font-extrabold text-accent-sky border border-accent-sky/30 whitespace-nowrap">
            <ShieldCheck className="h-2.5 w-2.5" />
            <span>KYC Moderator</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-pill bg-brand-50 px-2.5 py-0.5 font-display text-[10px] font-extrabold text-brand-700 border border-brand-200 whitespace-nowrap">
            <ShieldCheck className="h-2.5 w-2.5" />
            <span>Dispatch Support</span>
          </span>
        );
    }
  };

  return (
    <AdminDataTable
      title="Administrator Team & Role Clearances"
      subtitle="Manage internal administrators responsible for identity KYC verification, live booking dispatch, dispute resolution, and security."
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
            className="text-xs font-bold text-ink-secondary hover:text-brand-900 transition-colors px-1 cursor-pointer"
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
              <AdminTableHead>Designation &amp; Scope</AdminTableHead>
              <AdminTableHead>Security Standing</AdminTableHead>
              <AdminTableHead>Account Status</AdminTableHead>
              <AdminTableHead className="text-right">Actions</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {filteredAdmins.map((adm) => {
              const isSuspended = adm.status === "suspended" || adm.banned;
              return (
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
                      {adm.phone ? ` • ${adm.phone}` : ""}
                    </div>
                  </AdminTableCell>

                  <AdminTableCell className="whitespace-nowrap">
                    <div className="flex flex-col gap-1 items-start">
                      <PillBadge
                        tone="porcelain"
                        icon="shield"
                        className="px-2.5 py-0.5 text-[10px]"
                      >
                        {adm.roleTitle}
                      </PillBadge>
                      {renderScopeBadge(adm.adminScope)}
                    </div>
                  </AdminTableCell>

                  <AdminTableCell className="whitespace-nowrap">
                    {adm.mustChangePassword ? (
                      <span className="inline-flex items-center gap-1 rounded-pill bg-surface-porcelain px-2.5 py-0.5 font-display text-[10px] font-extrabold text-brand-950 border-2 border-accent-gold shadow-gloss-card">
                        <KeyRound className="h-3 w-3 text-accent-gold" />
                        <span>Must Change Password</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-brand-700">
                        {adm.lastActive}
                      </span>
                    )}
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
                          label: "Edit Admin Details",
                          description: "Update name, email, phone, password & role",
                          icon: <Pencil className="h-3.5 w-3.5" />,
                          variant: "primary",
                          onClick: () => onEditAdmin(adm),
                        },
                        {
                          id: "toggle-status",
                          label: isSuspended
                            ? "Reactivate Administrator"
                            : "Soft Delete (Suspend Access)",
                          description: isSuspended
                            ? "Restore admin access and privileges"
                            : "Revoke active sessions and block portal login",
                          icon: isSuspended ? (
                            <ShieldCheck className="h-3.5 w-3.5 text-accent-success" />
                          ) : (
                            <ShieldAlert className="h-3.5 w-3.5 text-accent-warm" />
                          ),
                          onClick: () => {
                            if (isSuspended) {
                              if (onReactivateAdmin) onReactivateAdmin(adm);
                              else onToggleStatus(adm.id);
                            } else {
                              if (onSoftDeleteAdmin) onSoftDeleteAdmin(adm);
                              else onToggleStatus(adm.id);
                            }
                          },
                        },
                        ...(onRevokeSessions
                          ? [
                              {
                                id: "revoke-sessions",
                                label: "Force Sign-Out Everywhere",
                                description: "Invalidate active login sessions",
                                icon: <LogOut className="h-3.5 w-3.5" />,
                                onClick: () => onRevokeSessions(adm.id),
                              },
                            ]
                          : []),
                        ...(onResetPassword
                          ? [
                              {
                                id: "reset-password",
                                label: "Send Password Reset Link",
                                description: "Email password recovery instructions",
                                icon: <Mail className="h-3.5 w-3.5" />,
                                onClick: () => onResetPassword(adm.id),
                              },
                            ]
                          : []),
                        ...(onResendInvite
                          ? [
                              {
                                id: "resend-invite",
                                label: "Resend Temporary Credentials",
                                description: "Generate new temp password & email",
                                icon: <KeyRound className="h-3.5 w-3.5" />,
                                onClick: () => onResendInvite(adm.id),
                              },
                            ]
                          : []),
                        {
                          id: "delete",
                          label: "Hard Delete (Permanently Remove)",
                          description: "Completely erase administrator account",
                          icon: <Trash2 className="h-3.5 w-3.5" />,
                          variant: "danger",
                          dividerBefore: true,
                          onClick: () => {
                            if (onHardDeleteAdmin) onHardDeleteAdmin(adm);
                            else onDeleteAdmin(adm.id);
                          },
                        },
                      ]}
                    />
                  </AdminTableCell>
                </AdminTableRow>
              );
            })}
          </AdminTableBody>
        </AdminTable>
      )}
    </AdminDataTable>
  );
}
