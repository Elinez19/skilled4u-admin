"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import {
  AdminHeroBanner,
  AdminWorkspaceSlab,
} from "@/components/admin/ui/admin-hero-banner";
import { AdminSearchInput } from "@/components/admin/ui/admin-form-controls";
import { AdminSegmentedTabs } from "@/components/admin/ui/admin-segmented-tabs";
import { AdminDialogModal } from "@/components/admin/ui/admin-dialog-modal";
import { useAdminToast } from "@/components/admin/ui/admin-toast";
import { cn } from "@/lib/utils";
import type { ArtisanRow, UserRow } from "@/db/schema";
import type { AdminRecord, UserViewFilter } from "./types";
import { useArtisansKyc } from "@/hooks/admin/use-artisans-kyc";
import { useUserForm } from "@/hooks/admin/use-user-form";
import { useUserManagementFilters } from "@/hooks/admin/use-user-management-filters";
import { AdminsTable } from "./admins-table";
import { ArtisanUserForm } from "./artisan-user-form";
import { ArtisansKpiSummary } from "./artisans-kpi-summary";
import { ArtisansTable } from "./artisans-table";
import { CustomersTable } from "./customers-table";

export function ArtisansKycWorkspace({
  initialArtisans,
  initialUsers = [],
  initialBookingCounts = {},
  defaultTab = "artisans_all",
}: {
  initialArtisans: ArtisanRow[];
  initialUsers?: UserRow[];
  initialBookingCounts?: Record<string, number>;
  defaultTab?: UserViewFilter;
}) {
  const {
    artisans,
    setArtisans,
    customers,
    setCustomers,
    admins,
    setAdmins,
    busyId,
    saving,
    savedBanner,
    notifySaved,
    updateArtisanKyc,
    toggleArtisanOnline,
    deleteArtisan,
    toggleCustomerStatus,
    deleteCustomer,
    toggleAdminStatus,
    softDeleteAdmin,
    deleteAdmin,
    revokeUserSessions,
    resetUserPassword,
    resendAdminInvite,
    saveUser,
    batchVerifyArtisans,
    batchDeleteArtisans,
    batchDeleteCustomers,
    batchDeleteAdmins,
    counts,
  } = useArtisansKyc(initialArtisans, initialUsers, initialBookingCounts);

  const toast = useAdminToast();
  const [confirmingAdminUpdate, setConfirmingAdminUpdate] = React.useState(false);
  const [confirmingSoftDelete, setConfirmingSoftDelete] =
    React.useState<AdminRecord | null>(null);
  const [confirmingHardDelete, setConfirmingHardDelete] =
    React.useState<AdminRecord | null>(null);
  const [confirmingReactivate, setConfirmingReactivate] =
    React.useState<AdminRecord | null>(null);

  const {
    filter,
    setFilter,
    search,
    setSearch,
    selectedIds,
    setSelectedIds,
    tabOptions,
    filteredArtisans,
    filteredCustomers,
    filteredAdmins,
    toggleSelectAllArtisans,
    toggleSelectOne,
    clearSelection,
  } = useUserManagementFilters({
    artisans,
    customers,
    admins,
    counts,
    defaultTab,
  });

  const {
    formOpen,
    setFormOpen,
    formRef,
    formData,
    updateField,
    setFormGroup,
    scrollToForm,
    resetForm,
    loadArtisanIntoForm,
    loadCustomerIntoForm,
    loadAdminIntoForm,
  } = useUserForm();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.formGroup === "admin" && formData.editingId) {
      if (
        formData.password &&
        formData.password.trim().length > 0 &&
        formData.password.trim().length < 8
      ) {
        toast.error(
          "Validation Error",
          "New password must be at least 8 characters long."
        );
        return;
      }
      setConfirmingAdminUpdate(true);
      return;
    }
    const ok = await saveUser(formData);
    if (ok) {
      resetForm(formData.formGroup);
    }
  };

  const handleConfirmAdminUpdate = async () => {
    const ok = await saveUser(formData);
    if (ok) {
      toast.success(
        "Administrator Updated",
        `Details for ${formData.name} were successfully saved.`
      );
      setConfirmingAdminUpdate(false);
      resetForm("admin");
    } else {
      toast.error(
        "Update Failed",
        `Failed to update administrator ${formData.name}.`
      );
    }
  };

  const handleConfirmSoftDelete = async () => {
    if (!confirmingSoftDelete) return;
    const admin = confirmingSoftDelete;
    const ok = await softDeleteAdmin(admin.id);
    if (ok) {
      toast.success("Deleted successfully", `Administrator ${admin.name} access revoked.`);
      setConfirmingSoftDelete(null);
    } else {
      toast.error("Failed to soft delete administrator");
    }
  };

  const handleConfirmHardDelete = async () => {
    if (!confirmingHardDelete) return;
    const admin = confirmingHardDelete;
    await deleteAdmin(admin.id, () => {
      if (formData.editingId === admin.id) {
        resetForm("admin");
      }
    });
    toast.success("Deleted successfully", `Administrator ${admin.name} permanently removed.`);
    setConfirmingHardDelete(null);
  };

  const handleConfirmReactivate = async () => {
    if (!confirmingReactivate) return;
    const admin = confirmingReactivate;
    await toggleAdminStatus(admin.id);
    toast.success("Administrator reactivated", `Administrator ${admin.name} access restored.`);
    setConfirmingReactivate(null);
  };

  const handleAddNewUserClick = () => {
    resetForm(
      filter === "customers"
        ? "customer"
        : filter === "admins"
          ? "admin"
          : "artisan"
    );
    scrollToForm();
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <AdminHeroBanner
        eyebrow="Customers · Artisans · Administrators"
        eyebrowIcon="shield"
        headline="User Management & Verification Desk."
        highlightWords={["User", "Management", "Verification"]}
        subtitle="Add, edit, and manage customer accounts, verify artisan identity and bank payout credentials, and configure administrator roles using the inline form below."
        primaryCta={{
          label: "Add New User",
          onClick: handleAddNewUserClick,
          variant: "primary",
          icon: <Plus className="h-4 w-4" />,
        }}
        secondaryCta={{
          label: "Live Dispatch Bookings",
          href: "/admin/bookings",
          variant: "secondary",
          trailingArrow: true,
        }}
      />

      <AdminWorkspaceSlab tone="pearl" withPearlAsset>
        {/* KPI Metric Summary Cards */}
        <ArtisansKpiSummary
          counts={counts}
          customersCount={customers.length}
          adminsCount={admins.length}
        />

        {/* Inline Form to Add, Edit, and Manage Users */}
        <div className="mt-6">
          <ArtisanUserForm
            formRef={formRef}
            open={formOpen}
            onOpenChange={setFormOpen}
            formData={formData}
            onUpdateField={updateField}
            onSetFormGroup={setFormGroup}
            onReset={() => resetForm(formData.formGroup)}
            onSubmit={handleFormSubmit}
            saving={saving}
            savedMessage={savedBanner}
          />
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-6 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <AdminSegmentedTabs
            options={tabOptions}
            value={filter}
            onChange={(val) => {
              setFilter(val);
              clearSelection();
            }}
            ariaLabel="Filter users by role and verification status"
            layoutId="artisans-kyc-tab-pill"
          />

          <AdminSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search customers, artisans, or admins..."
          />
        </div>

        {/* Directory Table Views */}
        <div className="mt-4">
          {filter === "customers" ? (
            <CustomersTable
              filteredCustomers={filteredCustomers}
              selectedIds={selectedIds}
              onToggleSelectAll={(checked) => {
                if (checked) {
                  setSelectedIds(filteredCustomers.map((c) => c.id));
                } else {
                  clearSelection();
                }
              }}
              onToggleSelectOne={toggleSelectOne}
              onClearSelection={clearSelection}
              onBatchDelete={async () => {
                const ids = [...selectedIds];
                await batchDeleteCustomers(ids);
                clearSelection();
              }}
              onAddNewCustomer={() => {
                resetForm("customer");
                scrollToForm();
              }}
              onEditCustomer={loadCustomerIntoForm}
              onToggleStatus={toggleCustomerStatus}
              onRevokeSessions={revokeUserSessions}
              onResetPassword={resetUserPassword}
              onDeleteCustomer={deleteCustomer}
            />
          ) : filter === "admins" ? (
            <AdminsTable
              filteredAdmins={filteredAdmins}
              selectedIds={selectedIds}
              onToggleSelectAll={(checked) => {
                if (checked) {
                  setSelectedIds(filteredAdmins.map((a) => a.id));
                } else {
                  clearSelection();
                }
              }}
              onToggleSelectOne={toggleSelectOne}
              onClearSelection={clearSelection}
              onBatchDelete={async () => {
                const ids = [...selectedIds];
                await batchDeleteAdmins(ids);
                clearSelection();
              }}
              onAddNewAdmin={() => {
                resetForm("admin");
                scrollToForm();
              }}
              onEditAdmin={(adm) => {
                loadAdminIntoForm(adm);
                toast.info("Editing Administrator", `Loaded ${adm.name} into focused edit form.`);
              }}
              onToggleStatus={toggleAdminStatus}
              onSoftDeleteAdmin={(adm) => setConfirmingSoftDelete(adm)}
              onHardDeleteAdmin={(adm) => setConfirmingHardDelete(adm)}
              onReactivateAdmin={(adm) => setConfirmingReactivate(adm)}
              onRevokeSessions={revokeUserSessions}
              onResetPassword={resetUserPassword}
              onResendInvite={resendAdminInvite}
              onDeleteAdmin={(id) => {
                const found = admins.find((a) => a.id === id);
                if (found) setConfirmingHardDelete(found);
                else deleteAdmin(id);
              }}
            />
          ) : (
            <ArtisansTable
              filteredArtisans={filteredArtisans}
              selectedIds={selectedIds}
              busyId={busyId}
              onToggleSelectAll={toggleSelectAllArtisans}
              onToggleSelectOne={toggleSelectOne}
              onClearSelection={clearSelection}
              onBatchVerify={() => {
                const ids = [...selectedIds];
                batchVerifyArtisans(ids);
                fetch("/api/v1/artisans", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ids,
                    kycStatus: "verified",
                  }),
                }).catch(() => null);
                clearSelection();
              }}
              onBatchDelete={() => {
                const ids = [...selectedIds];
                batchDeleteArtisans(ids);
                fetch(
                  `/api/v1/artisans?ids=${encodeURIComponent(ids.join(","))}`,
                  { method: "DELETE" }
                ).catch(() => null);
                clearSelection();
              }}
              onResetFilters={() => {
                setFilter("artisans_all");
                setSearch("");
              }}
              onAddNewArtisan={() => {
                resetForm("artisan");
                scrollToForm();
              }}
              onEditArtisan={loadArtisanIntoForm}
              onUpdateKyc={updateArtisanKyc}
              onToggleOnline={toggleArtisanOnline}
              onDeleteArtisan={(id) => {
                deleteArtisan(id, () => {
                  if (formData.editingId === id) resetForm("artisan");
                });
              }}
            />
          )}
        </div>
      </AdminWorkspaceSlab>

      {/* 1. Modal: Edit Administrator Details Confirmation */}
      <AdminDialogModal
        open={confirmingAdminUpdate}
        onOpenChange={setConfirmingAdminUpdate}
        eyebrow="Confirm Administrator Update"
        title={`Save Changes to ${formData.name || "Administrator"}?`}
        description="Please review the modified administrator details before applying them."
        confirmLabel="Save changes"
        cancelLabel="Review & Edit"
        variant="primary"
        confirmLoading={saving}
        onConfirm={handleConfirmAdminUpdate}
      >
        <div className="space-y-2.5 rounded-2xl border-2 border-brand-100 bg-white/90 p-4">
          <div className="flex justify-between items-center py-1.5 border-b border-surface-frost">
            <span className="font-semibold text-ink-secondary text-xs">Full Legal Name</span>
            <span className="font-extrabold text-brand-950 text-xs sm:text-sm">{formData.name}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-surface-frost">
            <span className="font-semibold text-ink-secondary text-xs">Email Address</span>
            <span className="font-extrabold text-brand-950 text-xs sm:text-sm">{formData.email}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-surface-frost">
            <span className="font-semibold text-ink-secondary text-xs">Phone Number</span>
            <span className="font-extrabold text-brand-950 text-xs sm:text-sm">{formData.phone}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-surface-frost">
            <span className="font-semibold text-ink-secondary text-xs">Password Rotation</span>
            <span
              className={cn(
                "font-extrabold text-xs px-2.5 py-0.5 rounded-pill",
                formData.password && formData.password.trim().length >= 8
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "bg-surface-mist text-ink-secondary"
              )}
            >
              {formData.password && formData.password.trim().length >= 8
                ? "Password will be rotated"
                : "Password unchanged"}
            </span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <span className="font-semibold text-ink-secondary text-xs">Clearance Scope</span>
            <span className="font-extrabold text-brand-950 text-xs capitalize">
              {formData.adminScope.replace("_", " ")}
            </span>
          </div>
        </div>
      </AdminDialogModal>

      {/* 2. Modal: Soft Delete Confirmation */}
      <AdminDialogModal
        open={Boolean(confirmingSoftDelete)}
        onOpenChange={(op) => {
          if (!op) setConfirmingSoftDelete(null);
        }}
        eyebrow="Soft Delete Administrator"
        title="Confirm Soft Delete (Suspend Account)?"
        description={`Are you sure you want to soft delete and suspend ${confirmingSoftDelete?.name} (${confirmingSoftDelete?.email})?`}
        confirmLabel="Soft Delete Admin"
        cancelLabel="Cancel"
        variant="warning"
        confirmLoading={busyId === confirmingSoftDelete?.id}
        onConfirm={handleConfirmSoftDelete}
      >
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/80 p-4 space-y-2 text-xs text-amber-950">
          <p className="font-bold">
            What happens when an administrator is soft deleted:
          </p>
          <ul className="list-disc list-inside space-y-1 text-ink-primary font-medium">
            <li>All active login sessions are revoked immediately across all devices.</li>
            <li>The administrator will be blocked from logging into the portal.</li>
            <li>All historical audit logs and actions remain intact for compliance.</li>
            <li>You can restore and reactivate this administrator account at any time.</li>
          </ul>
        </div>
      </AdminDialogModal>

      {/* 3. Modal: Hard Delete Confirmation */}
      <AdminDialogModal
        open={Boolean(confirmingHardDelete)}
        onOpenChange={(op) => {
          if (!op) setConfirmingHardDelete(null);
        }}
        eyebrow="Permanent Hard Deletion"
        title="Permanently Delete Administrator?"
        description={`This action will completely erase the administrator record for ${confirmingHardDelete?.name} (${confirmingHardDelete?.email}).`}
        confirmLabel="Hard Delete Admin"
        cancelLabel="Cancel"
        variant="danger"
        confirmLoading={busyId === confirmingHardDelete?.id}
        onConfirm={handleConfirmHardDelete}
      >
        <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/80 p-4 space-y-2 text-xs text-rose-950">
          <p className="font-bold">
            Warning: This action is permanent and cannot be undone!
          </p>
          <ul className="list-disc list-inside space-y-1 text-ink-primary font-medium">
            <li>The administrator profile and authentication credentials will be removed.</li>
            <li>The account cannot be recovered once hard deleted.</li>
            <li>If you want to temporarily revoke access while preserving records, use Soft Delete instead.</li>
          </ul>
        </div>
      </AdminDialogModal>

      {/* 4. Modal: Reactivate Confirmation */}
      <AdminDialogModal
        open={Boolean(confirmingReactivate)}
        onOpenChange={(op) => {
          if (!op) setConfirmingReactivate(null);
        }}
        eyebrow="Restore Administrator Access"
        title={`Reactivate ${confirmingReactivate?.name}?`}
        description={`This will restore administrator privileges and portal login access for ${confirmingReactivate?.email}.`}
        confirmLabel="Reactivate Administrator"
        cancelLabel="Cancel"
        variant="success"
        confirmLoading={busyId === confirmingReactivate?.id}
        onConfirm={handleConfirmReactivate}
      >
        <p className="text-xs text-ink-secondary">
          The administrator will be able to sign in with their active credentials and resume operations corresponding to their clearance scope.
        </p>
      </AdminDialogModal>
    </div>
  );
}

