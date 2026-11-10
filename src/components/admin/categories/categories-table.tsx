"use client";

import * as React from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Layers,
  Pencil,
  Plus,
  Trash2,
  Wrench,
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
import { AdminSearchInput } from "@/components/admin/ui/admin-form-controls";
import {
  AdminSegmentedTabs,
  type AdminTabOption,
} from "@/components/admin/ui/admin-segmented-tabs";
import { AdminStatusPill } from "@/components/admin/ui/admin-status-pill";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { PillBadge } from "@/components/landing/ui/pill-badge";
import type { CategoryRow } from "@/db/schema";
import { formatCurrency } from "@/lib/utils";
import type { BookableServiceRecord, CatalogTab } from "./types";

export interface CategoriesTableProps {
  tab: CatalogTab;
  onTabChange: (t: CatalogTab) => void;
  search: string;
  onSearchChange: (s: string) => void;
  tabOptions: ReadonlyArray<AdminTabOption<CatalogTab>>;
  filteredCategories: CategoryRow[];
  filteredServices: BookableServiceRecord[];
  selectedCategoryIds: string[];
  selectedServiceIds: string[];
  onToggleSelectAllCategories: () => void;
  onToggleSelectOneCategory: (id: string) => void;
  onToggleSelectAllServices: () => void;
  onToggleSelectOneService: (id: string) => void;
  onClearCategorySelection: () => void;
  onClearServiceSelection: () => void;
  onBatchDeleteCategories: () => void;
  onBatchDeleteServices: () => void;
  onAddNewCategory: () => void;
  onAddNewService: () => void;
  onEditCategory: (cat: CategoryRow) => void;
  onAddServiceForCategory: (cat: CategoryRow) => void;
  onToggleCategoryActive: (cat: CategoryRow) => void;
  onDeleteCategory: (id: string) => void;
  onEditService: (srv: BookableServiceRecord) => void;
  onToggleServiceStatus: (id: string) => void;
  onDeleteService: (id: string) => void;
}

export function CategoriesTable({
  tab,
  onTabChange,
  search,
  onSearchChange,
  tabOptions,
  filteredCategories,
  filteredServices,
  selectedCategoryIds,
  selectedServiceIds,
  onToggleSelectAllCategories,
  onToggleSelectOneCategory,
  onToggleSelectAllServices,
  onToggleSelectOneService,
  onClearCategorySelection,
  onClearServiceSelection,
  onBatchDeleteCategories,
  onBatchDeleteServices,
  onAddNewCategory,
  onAddNewService,
  onEditCategory,
  onAddServiceForCategory,
  onToggleCategoryActive,
  onDeleteCategory,
  onEditService,
  onToggleServiceStatus,
  onDeleteService,
}: CategoriesTableProps) {
  const allCategoriesSelected =
    filteredCategories.length > 0 &&
    filteredCategories.every((c) => selectedCategoryIds.includes(c.id));

  const someCategoriesSelected =
    filteredCategories.some((c) => selectedCategoryIds.includes(c.id)) &&
    !allCategoriesSelected;

  const allServicesSelected =
    filteredServices.length > 0 &&
    filteredServices.every((s) => selectedServiceIds.includes(s.id));

  const someServicesSelected =
    filteredServices.some((s) => selectedServiceIds.includes(s.id)) &&
    !allServicesSelected;

  return (
    <>
      {/* Segmented Filter Tabs & Search Bar */}
      <div className="mt-6 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <AdminSegmentedTabs
          options={tabOptions}
          value={tab}
          onChange={onTabChange}
          ariaLabel="Filter categories and bookable services"
          layoutId="categories-services-tab-pill"
        />

        <AdminSearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search category, service, or slug..."
        />
      </div>

      {/* Service Categories Table */}
      {(tab === "all" || tab === "categories") && (
        <div className="mt-4">
          <AdminDataTable
            title="Service Categories Directory"
            subtitle="Manage marketplace service categories, starting prices, and bookable sub-service offerings."
            badge={`${filteredCategories.length} Categories`}
            selectedCount={selectedCategoryIds.length}
            bulkActions={
              <>
                <CtaButton
                  variant="secondary"
                  size="xs"
                  className="text-accent-error hover:border-accent-error/40 hover:text-accent-error"
                  onClick={onBatchDeleteCategories}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Selected</span>
                </CtaButton>
                <button
                  type="button"
                  onClick={onClearCategorySelection}
                  className="text-xs font-bold text-ink-secondary hover:text-brand-900 transition-colors px-1"
                >
                  Clear
                </button>
              </>
            }
            headerAction={
              <CtaButton
                variant="primary"
                size="xs"
                onClick={onAddNewCategory}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Category</span>
              </CtaButton>
            }
          >
            {filteredCategories.length === 0 ? (
              <AdminEmptyState
                title="No Service Categories Found"
                description="Add a new marketplace category using the inline form above or clear your search filter."
                icon={<Layers className="h-5 w-5 text-accent-sky" />}
              />
            ) : (
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableRow>
                    <AdminTableHead className="w-10">
                      <AdminCheckbox
                        aria-label="Select all categories"
                        checked={allCategoriesSelected}
                        indeterminate={someCategoriesSelected}
                        onChange={onToggleSelectAllCategories}
                      />
                    </AdminTableHead>
                    <AdminTableHead>Category &amp; Slug</AdminTableHead>
                    <AdminTableHead>Bookable Sub-Services</AdminTableHead>
                    <AdminTableHead>Base Price</AdminTableHead>
                    <AdminTableHead>Status</AdminTableHead>
                    <AdminTableHead className="text-right">
                      Actions
                    </AdminTableHead>
                  </AdminTableRow>
                </AdminTableHeader>
                <AdminTableBody>
                  {filteredCategories.map((cat) => (
                    <AdminTableRow
                      key={cat.id}
                      isSelected={selectedCategoryIds.includes(cat.id)}
                    >
                      <AdminTableCell className="w-10">
                        <AdminCheckbox
                          aria-label={`Select category ${cat.title}`}
                          checked={selectedCategoryIds.includes(cat.id)}
                          onChange={() => onToggleSelectOneCategory(cat.id)}
                        />
                      </AdminTableCell>

                      <AdminTableCell className="whitespace-nowrap">
                        <div className="font-display text-xs sm:text-sm font-extrabold text-brand-950">
                          {cat.title}
                        </div>
                        <div className="font-mono text-[10px] font-semibold text-ink-muted">
                          /{cat.slug}
                        </div>
                      </AdminTableCell>

                      <AdminTableCell>
                        <div className="flex flex-wrap gap-1 max-w-[280px]">
                          {(cat.subServices || []).slice(0, 3).map((sub) => (
                            <span
                              key={sub}
                              className="inline-flex items-center gap-1 rounded-pill border border-brand-100 bg-brand-50 px-2 py-0.5 font-display text-[10px] font-bold text-brand-700"
                            >
                              {sub}
                            </span>
                          ))}
                          {(cat.subServices || []).length > 3 && (
                            <PillBadge
                              tone="sky"
                              className="px-2 py-0.5 text-[10px]"
                            >
                              +{(cat.subServices || []).length - 3} more
                            </PillBadge>
                          )}
                        </div>
                      </AdminTableCell>

                      <AdminTableCell className="font-display text-xs sm:text-sm font-extrabold text-brand-950 whitespace-nowrap">
                        {formatCurrency(cat.basePrice)}
                      </AdminTableCell>

                      <AdminTableCell>
                        <AdminStatusPill
                          status={cat.isActive ? "active" : "hidden"}
                        />
                      </AdminTableCell>

                      <AdminTableCell className="text-right whitespace-nowrap">
                        <AdminActionMenu
                          label={`Manage ${cat.title}`}
                          ariaLabel={`Actions for category ${cat.title}`}
                          items={[
                            {
                              id: "edit-cat",
                              label: "Edit Category in Form",
                              description: "Modify title, base rate & subs",
                              icon: <Pencil className="h-3.5 w-3.5" />,
                              variant: "primary",
                              onClick: () => onEditCategory(cat),
                            },
                            {
                              id: "add-srv",
                              label: "Add Bookable Service",
                              description: `Add a service under ${cat.title}`,
                              icon: <Plus className="h-3.5 w-3.5" />,
                              onClick: () => onAddServiceForCategory(cat),
                            },
                            {
                              id: "toggle-active",
                              label: cat.isActive
                                ? "Hide Category"
                                : "Publish Category",
                              description: "Toggle visibility in customer app",
                              icon: cat.isActive ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              ),
                              onClick: () => onToggleCategoryActive(cat),
                            },
                            {
                              id: "delete-cat",
                              label: "Delete Category",
                              description: "Remove category from catalog",
                              icon: <Trash2 className="h-3.5 w-3.5" />,
                              variant: "danger",
                              dividerBefore: true,
                              onClick: () => onDeleteCategory(cat.id),
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
      )}

      {/* Bookable Services Table */}
      {(tab === "all" || tab === "services") && (
        <div className="mt-5">
          <AdminDataTable
            title="Bookable Services & Standard Pricing Ledger"
            subtitle="Manage individual customer-bookable services, estimated job durations, and dispatch SLA tiers."
            badge={`${filteredServices.length} Services`}
            selectedCount={selectedServiceIds.length}
            bulkActions={
              <>
                <CtaButton
                  variant="secondary"
                  size="xs"
                  className="text-accent-error hover:border-accent-error/40 hover:text-accent-error"
                  onClick={onBatchDeleteServices}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Selected</span>
                </CtaButton>
                <button
                  type="button"
                  onClick={onClearServiceSelection}
                  className="text-xs font-bold text-ink-secondary hover:text-brand-900 transition-colors px-1"
                >
                  Clear
                </button>
              </>
            }
            headerAction={
              <CtaButton
                variant="primary"
                size="xs"
                onClick={onAddNewService}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Service</span>
              </CtaButton>
            }
          >
            {filteredServices.length === 0 ? (
              <AdminEmptyState
                title="No Matching Services"
                description="Create a bookable service using the inline form above or clear your search filter."
                icon={<Wrench className="h-5 w-5 text-accent-sky" />}
              />
            ) : (
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableRow>
                    <AdminTableHead className="w-10">
                      <AdminCheckbox
                        aria-label="Select all services"
                        checked={allServicesSelected}
                        indeterminate={someServicesSelected}
                        onChange={onToggleSelectAllServices}
                      />
                    </AdminTableHead>
                    <AdminTableHead>Service Title</AdminTableHead>
                    <AdminTableHead>Parent Category</AdminTableHead>
                    <AdminTableHead>Standard Rate</AdminTableHead>
                    <AdminTableHead>Status</AdminTableHead>
                    <AdminTableHead className="text-right">
                      Actions
                    </AdminTableHead>
                  </AdminTableRow>
                </AdminTableHeader>
                <AdminTableBody>
                  {filteredServices.map((srv) => (
                    <AdminTableRow
                      key={srv.id}
                      isSelected={selectedServiceIds.includes(srv.id)}
                    >
                      <AdminTableCell className="w-10">
                        <AdminCheckbox
                          aria-label={`Select service ${srv.title}`}
                          checked={selectedServiceIds.includes(srv.id)}
                          onChange={() => onToggleSelectOneService(srv.id)}
                        />
                      </AdminTableCell>

                      <AdminTableCell>
                        <div className="font-display text-xs sm:text-sm font-extrabold text-brand-950">
                          {srv.title}
                        </div>
                      </AdminTableCell>

                      <AdminTableCell className="whitespace-nowrap">
                        <PillBadge
                          tone="porcelain"
                          className="px-2.5 py-0.5 text-[10px]"
                        >
                          {srv.categoryTitle}
                        </PillBadge>
                      </AdminTableCell>

                      <AdminTableCell className="font-display text-xs sm:text-sm font-extrabold text-brand-950 whitespace-nowrap">
                        {formatCurrency(srv.price)}
                      </AdminTableCell>

                      <AdminTableCell>
                        <AdminStatusPill status={srv.status} />
                      </AdminTableCell>

                      <AdminTableCell className="text-right whitespace-nowrap">
                        <AdminActionMenu
                          label={`Service: ${srv.title}`}
                          ariaLabel={`Actions for service ${srv.title}`}
                          items={[
                            {
                              id: "edit-srv",
                              label: "Edit Service in Form",
                              description: "Update pricing, SLA & category",
                              icon: <Pencil className="h-3.5 w-3.5" />,
                              variant: "primary",
                              onClick: () => onEditService(srv),
                            },
                            {
                              id: "toggle-srv",
                              label:
                                srv.status === "active"
                                  ? "Hide Service"
                                  : "Activate Service",
                              description: "Toggle availability for booking",
                              icon:
                                srv.status === "active" ? (
                                  <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                ),
                              onClick: () => onToggleServiceStatus(srv.id),
                            },
                            {
                              id: "delete-srv",
                              label: "Delete Service",
                              description: "Remove bookable service",
                              icon: <Trash2 className="h-3.5 w-3.5" />,
                              variant: "danger",
                              dividerBefore: true,
                              onClick: () => onDeleteService(srv.id),
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
      )}
    </>
  );
}

