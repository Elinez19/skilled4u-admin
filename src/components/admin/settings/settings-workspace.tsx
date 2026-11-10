"use client";

import { Plus } from "lucide-react";
import { AdminHeroBanner, AdminWorkspaceSlab } from "@/components/admin/ui/admin-hero-banner";
import { AdminSearchInput } from "@/components/admin/ui/admin-form-controls";
import { AdminSegmentedTabs } from "@/components/admin/ui/admin-segmented-tabs";
import { useAdminSettings } from "@/hooks/admin/use-admin-settings";
import { SettingsKpiSummary } from "./settings-kpi-summary";
import { PlatformPolicyForm } from "./platform-policy-form";
import { PlatformPoliciesTable } from "./platform-policies-table";
import type { PolicySettingItem } from "./types";

export interface SettingsWorkspaceProps {
  initialPolicies?: PolicySettingItem[];
}

export function SettingsWorkspace({ initialPolicies }: SettingsWorkspaceProps) {
  const {
    filtered,
    filter,
    setFilter,
    search,
    setSearch,
    selectedIds,
    tabOptions,
    platformFeePercent,
    setPlatformFeePercent,
    artisanSharePercent,
    setArtisanSharePercent,
    dispatchRadiusKm,
    setDispatchRadiusKm,
    disputeWindowHours,
    setDisputeWindowHours,
    supportEmail,
    setSupportEmail,
    supportPhone,
    setSupportPhone,
    toggleSelectAll,
    toggleSelectOne,
    clearSelection,
    deleteSelected,
    togglePolicyStatus,
    resetPolicyToDefault,
    deletePolicy,
    formRef,
    formOpen,
    setFormOpen,
    editingId,
    policyTitle,
    setPolicyTitle,
    policyKeyCode,
    setPolicyKeyCode,
    policyValue,
    setPolicyValue,
    policyDescription,
    setPolicyDescription,
    policyCategory,
    setPolicyCategory,
    policyStatus,
    setPolicyStatus,
    savedBanner,
    resetForm,
    loadPolicyIntoForm,
    scrollToForm,
    handleSaveSettings,
  } = useAdminSettings(initialPolicies);

  return (
    <div className="space-y-3 sm:space-y-4">
      <AdminHeroBanner
        eyebrow="Platform Governance & Operations"
        eyebrowIcon="shield"
        headline="Marketplace Settings & Policies."
        highlightWords={["Settings", "Policies."]}
        subtitle="Add, edit, and manage platform settings, commission splits, dispatch limits, and KYC verification rules using the inline form and table actions below."
        primaryCta={{
          label: "Add Policy Setting",
          onClick: () => {
            resetForm();
            scrollToForm();
          },
          variant: "primary",
          icon: <Plus className="h-4 w-4" />,
        }}
        secondaryCta={{
          label: "Manage Users",
          href: "/admin/user-management",
          variant: "secondary",
          trailingArrow: true,
        }}
      />

      <AdminWorkspaceSlab tone="pearl" withPearlAsset>
        <SettingsKpiSummary
          artisanSharePercent={artisanSharePercent}
          platformFeePercent={platformFeePercent}
          dispatchRadiusKm={dispatchRadiusKm}
          disputeWindowHours={disputeWindowHours}
        />

        <PlatformPolicyForm
          formRef={formRef}
          open={formOpen}
          onOpenChange={setFormOpen}
          editingId={editingId}
          platformFeePercent={platformFeePercent}
          setPlatformFeePercent={setPlatformFeePercent}
          artisanSharePercent={artisanSharePercent}
          setArtisanSharePercent={setArtisanSharePercent}
          dispatchRadiusKm={dispatchRadiusKm}
          setDispatchRadiusKm={setDispatchRadiusKm}
          disputeWindowHours={disputeWindowHours}
          setDisputeWindowHours={setDisputeWindowHours}
          supportEmail={supportEmail}
          setSupportEmail={setSupportEmail}
          supportPhone={supportPhone}
          setSupportPhone={setSupportPhone}
          policyTitle={policyTitle}
          setPolicyTitle={setPolicyTitle}
          policyKeyCode={policyKeyCode}
          setPolicyKeyCode={setPolicyKeyCode}
          policyValue={policyValue}
          setPolicyValue={setPolicyValue}
          policyDescription={policyDescription}
          setPolicyDescription={setPolicyDescription}
          policyCategory={policyCategory}
          setPolicyCategory={setPolicyCategory}
          policyStatus={policyStatus}
          setPolicyStatus={setPolicyStatus}
          savedMessage={savedBanner}
          onReset={resetForm}
          onSubmit={handleSaveSettings}
        />

        <div className="mt-6 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <AdminSegmentedTabs
            options={tabOptions}
            value={filter}
            onChange={setFilter}
            ariaLabel="Filter settings by category"
            layoutId="settings-tab-pill"
          />

          <AdminSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search setting key, title, or value..."
          />
        </div>

        <PlatformPoliciesTable
          policies={filtered}
          selectedIds={selectedIds}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelectOne={toggleSelectOne}
          onClearSelection={clearSelection}
          onDeleteSelected={deleteSelected}
          onOpenCreate={() => {
            resetForm();
            scrollToForm();
          }}
          onLoadIntoForm={loadPolicyIntoForm}
          onToggleStatus={togglePolicyStatus}
          onResetToDefault={resetPolicyToDefault}
          onDelete={deletePolicy}
        />
      </AdminWorkspaceSlab>
    </div>
  );
}

