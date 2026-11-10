"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import {
  AdminHeroBanner,
  AdminWorkspaceSlab,
} from "@/components/admin/ui/admin-hero-banner";
import { AdminSearchInput } from "@/components/admin/ui/admin-form-controls";
import { AdminSegmentedTabs } from "@/components/admin/ui/admin-segmented-tabs";
import type { ArtisanRow, UserRow } from "@/db/schema";
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
}: {
  initialArtisans: ArtisanRow[];
  initialUsers?: UserRow[];
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
    deleteAdmin,
    saveUser,
    batchVerifyArtisans,
    batchDeleteArtisans,
    counts,
  } = useArtisansKyc(initialArtisans, initialUsers);

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
    const ok = await saveUser(formData);
    if (ok) {
      resetForm(formData.formGroup);
    }
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
              onBatchDelete={() => {
                const ids = [...selectedIds];
                setCustomers((prev) =>
                  prev.filter((c) => !ids.includes(c.id))
                );
                fetch(
                  `/api/v1/users?ids=${encodeURIComponent(ids.join(","))}`,
                  { method: "DELETE" }
                ).catch(() => null);
                notifySaved(`Removed ${ids.length} customer record(s)`);
                clearSelection();
              }}
              onAddNewCustomer={() => {
                resetForm("customer");
                scrollToForm();
              }}
              onEditCustomer={loadCustomerIntoForm}
              onToggleStatus={toggleCustomerStatus}
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
              onBatchDelete={() => {
                const ids = [...selectedIds];
                setAdmins((prev) =>
                  prev.filter((a) => !ids.includes(a.id))
                );
                notifySaved(`Removed ${ids.length} admin account(s)`);
                clearSelection();
              }}
              onAddNewAdmin={() => {
                resetForm("admin");
                scrollToForm();
              }}
              onEditAdmin={loadAdminIntoForm}
              onToggleStatus={toggleAdminStatus}
              onDeleteAdmin={deleteAdmin}
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
    </div>
  );
}

