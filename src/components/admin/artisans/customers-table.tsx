"use client";

import * as React from "react";
import { CheckCircle2, Clock, Pencil, Plus, Trash2, Users } from "lucide-react";
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
import type { CustomerRecord } from "./types";

export interface CustomersTableProps {
  filteredCustomers: CustomerRecord[];
  selectedIds: string[];
  onToggleSelectAll: (checked: boolean) => void;
  onToggleSelectOne: (id: string) => void;
  onClearSelection: () => void;
  onBatchDelete: () => void;
  onAddNewCustomer: () => void;
  onEditCustomer: (customer: CustomerRecord) => void;
  onToggleStatus: (id: string) => void;
  onDeleteCustomer: (id: string) => void;
}

export function CustomersTable({
  filteredCustomers,
  selectedIds,
  onToggleSelectAll,
  onToggleSelectOne,
  onClearSelection,
  onBatchDelete,
  onAddNewCustomer,
  onEditCustomer,
  onToggleStatus,
  onDeleteCustomer,
}: CustomersTableProps) {
  const allSelected =
    filteredCustomers.length > 0 &&
    filteredCustomers.every((c) => selectedIds.includes(c.id));

  const someSelected =
    filteredCustomers.some((c) => selectedIds.includes(c.id)) && !allSelected;

  return (
    <AdminDataTable
      title="Customer Accounts Directory"
      subtitle="Manage registered customers, monitor booking activity, and use the three-dots menu to edit or update standing."
      badge={`${filteredCustomers.length} Customers`}
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
        <CtaButton variant="primary" size="xs" onClick={onAddNewCustomer}>
          <Plus className="h-3.5 w-3.5" />
          <span>Add Customer</span>
        </CtaButton>
      }
    >
      {filteredCustomers.length === 0 ? (
        <AdminEmptyState
          title="No Matching Customers"
          description="Try clearing your search query or add a new customer using the inline form above."
          icon={<Users className="h-5 w-5 text-accent-sky" />}
        />
      ) : (
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead className="w-10">
                <AdminCheckbox
                  aria-label="Select all customers"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={(e) => onToggleSelectAll(e.target.checked)}
                />
              </AdminTableHead>
              <AdminTableHead>Customer</AdminTableHead>
              <AdminTableHead>Location</AdminTableHead>
              <AdminTableHead>Bookings</AdminTableHead>
              <AdminTableHead>Status</AdminTableHead>
              <AdminTableHead className="text-right">Actions</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {filteredCustomers.map((cust) => (
              <AdminTableRow
                key={cust.id}
                isSelected={selectedIds.includes(cust.id)}
              >
                <AdminTableCell className="w-10">
                  <AdminCheckbox
                    aria-label={`Select customer ${cust.name}`}
                    checked={selectedIds.includes(cust.id)}
                    onChange={() => onToggleSelectOne(cust.id)}
                  />
                </AdminTableCell>
                <AdminTableCell className="whitespace-nowrap">
                  <div className="font-display text-xs sm:text-sm font-extrabold text-brand-950">
                    {cust.name}
                  </div>
                  <div className="text-[11px] font-semibold text-brand-700">
                    {cust.email} · {cust.phone}
                  </div>
                </AdminTableCell>
                <AdminTableCell className="font-display text-xs font-bold text-brand-950 whitespace-nowrap">
                  {cust.city}
                </AdminTableCell>
                <AdminTableCell className="whitespace-nowrap">
                  <PillBadge
                    tone="sky"
                    className="px-2.5 py-0.5 text-[10px]"
                  >
                    {cust.bookingsCount} Bookings
                  </PillBadge>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminStatusPill status={cust.status} />
                </AdminTableCell>
                <AdminTableCell className="text-right whitespace-nowrap">
                  <AdminActionMenu
                    label={`Manage ${cust.name}`}
                    ariaLabel={`Actions for customer ${cust.name}`}
                    items={[
                      {
                        id: "edit",
                        label: "Edit Customer in Form",
                        description: "Load into inline form above",
                        icon: <Pencil className="h-3.5 w-3.5" />,
                        variant: "primary",
                        onClick: () => onEditCustomer(cust),
                      },
                      {
                        id: "toggle-status",
                        label:
                          cust.status === "active"
                            ? "Place Account on Hold"
                            : "Activate Account",
                        description: "Toggle customer dispatch access",
                        icon:
                          cust.status === "active" ? (
                            <Clock className="h-3.5 w-3.5" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ),
                        onClick: () => onToggleStatus(cust.id),
                      },
                      {
                        id: "delete",
                        label: "Remove Customer",
                        description: "Delete customer record",
                        icon: <Trash2 className="h-3.5 w-3.5" />,
                        variant: "danger",
                        dividerBefore: true,
                        onClick: () => onDeleteCustomer(cust.id),
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

