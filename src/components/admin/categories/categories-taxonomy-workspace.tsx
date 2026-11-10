"use client";

import * as React from "react";
import { Plus, Wrench } from "lucide-react";
import {
  AdminHeroBanner,
  AdminWorkspaceSlab,
} from "@/components/admin/ui/admin-hero-banner";
import type { CategoryRow } from "@/db/schema";
import { useCategoriesTaxonomy } from "@/hooks/admin/use-categories-taxonomy";
import { useCategoryFilters } from "@/hooks/admin/use-category-filters";
import { useCategoryForm } from "@/hooks/admin/use-category-form";
import { CategoriesTable } from "./categories-table";
import { CategoryCardsGrid } from "./category-cards-grid";
import { CategoryTaxonomyForm } from "./category-taxonomy-form";

export function CategoriesTaxonomyWorkspace({
  initialCategories,
}: {
  initialCategories: CategoryRow[];
}) {
  const {
    items,
    services,
    saving,
    savedBanner,
    saveCategoryOrService,
    toggleCategoryActive,
    deleteCategory,
    toggleServiceStatus,
    deleteService,
    batchToggleCategoryActive,
    batchDeleteCategories,
    batchDeleteServices,
  } = useCategoriesTaxonomy(initialCategories);

  const {
    tab,
    setTab,
    search,
    setSearch,
    selectedCategoryIds,
    setSelectedCategoryIds,
    selectedServiceIds,
    setSelectedServiceIds,
    tabOptions,
    filteredCategories,
    filteredServices,
    toggleSelectAllCategories,
    toggleSelectOneCategory,
    toggleSelectAllServices,
    toggleSelectOneService,
    clearAllSelections,
  } = useCategoryFilters({
    categories: items,
    services,
  });

  const {
    formOpen,
    setFormOpen,
    formRef,
    formData,
    updateField,
    setFormMode,
    scrollToForm,
    resetForm,
    loadCategoryIntoForm,
    loadServiceIntoForm,
    startAddServiceForCategory,
  } = useCategoryForm(items[0]?.id || "");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await saveCategoryOrService(formData);
    if (ok) {
      resetForm(formData.formMode);
    }
  };

  const handleNewCategoryClick = () => {
    resetForm("category");
    scrollToForm();
  };

  const handleNewServiceClick = () => {
    resetForm("service");
    scrollToForm();
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <AdminHeroBanner
        eyebrow="Marketplace Taxonomy & Catalog"
        eyebrowIcon="pin"
        headline="Service Categories & Catalog Architecture."
        highlightWords={["Categories", "Catalog", "Architecture."]}
        subtitle="Add, edit, and organize marketplace service categories, bookable sub-services, and baseline labor pricing using the inline form and directory below."
        primaryCta={{
          label: "New Service Category",
          onClick: handleNewCategoryClick,
          variant: "primary",
          icon: <Plus className="h-4 w-4" />,
        }}
        secondaryCta={{
          label: "Add Bookable Service",
          onClick: handleNewServiceClick,
          variant: "secondary",
          icon: <Wrench className="h-4 w-4" />,
        }}
      />

      <AdminWorkspaceSlab tone="pearl" withPearlAsset>
        {/* Inline Form to Add, Edit, and Manage Categories & Bookable Services */}
        <CategoryTaxonomyForm
          formRef={formRef}
          open={formOpen}
          onOpenChange={setFormOpen}
          formData={formData}
          categories={items}
          onUpdateField={updateField}
          onSetFormMode={setFormMode}
          onReset={() => resetForm(formData.formMode)}
          onSubmit={handleFormSubmit}
          saving={saving}
          savedMessage={savedBanner}
        />

        {/* Directory Tables (Categories & Services) */}
        <CategoriesTable
          tab={tab}
          onTabChange={setTab}
          search={search}
          onSearchChange={setSearch}
          tabOptions={tabOptions}
          filteredCategories={filteredCategories}
          filteredServices={filteredServices}
          selectedCategoryIds={selectedCategoryIds}
          selectedServiceIds={selectedServiceIds}
          onToggleSelectAllCategories={toggleSelectAllCategories}
          onToggleSelectOneCategory={toggleSelectOneCategory}
          onToggleSelectAllServices={toggleSelectAllServices}
          onToggleSelectOneService={toggleSelectOneService}
          onClearCategorySelection={() => setSelectedCategoryIds([])}
          onClearServiceSelection={() => setSelectedServiceIds([])}
          onBatchDeleteCategories={() => {
            batchDeleteCategories(selectedCategoryIds);
            setSelectedCategoryIds([]);
          }}
          onBatchDeleteServices={() => {
            batchDeleteServices(selectedServiceIds);
            setSelectedServiceIds([]);
          }}
          onAddNewCategory={handleNewCategoryClick}
          onAddNewService={handleNewServiceClick}
          onEditCategory={loadCategoryIntoForm}
          onAddServiceForCategory={startAddServiceForCategory}
          onToggleCategoryActive={toggleCategoryActive}
          onDeleteCategory={(id) => {
            deleteCategory(id, () => {
              if (formData.editingId === id) resetForm("category");
            });
          }}
          onEditService={loadServiceIntoForm}
          onToggleServiceStatus={toggleServiceStatus}
          onDeleteService={(id) => {
            deleteService(id, () => {
              if (formData.editingId === id) resetForm("service");
            });
          }}
        />

        {/* 3-Column Glossy Category Cards Grid */}
        <CategoryCardsGrid
          categories={filteredCategories}
          onEditCategory={loadCategoryIntoForm}
          onAddServiceForCategory={startAddServiceForCategory}
          onToggleCategoryActive={toggleCategoryActive}
        />
      </AdminWorkspaceSlab>
    </div>
  );
}

