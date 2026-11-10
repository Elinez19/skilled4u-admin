"use client";

import * as React from "react";
import { Plus, Save } from "lucide-react";
import {
  AdminInlineForm,
  AdminSelectField,
  AdminSelectPills,
  AdminTextField,
} from "@/components/admin/ui/admin-form-controls";
import { CtaButton } from "@/components/landing/ui/cta-button";
import type { CategoryRow } from "@/db/schema";
import {
  FORM_ENTITY_OPTIONS,
  SLA_OPTIONS,
  VISIBILITY_OPTIONS,
} from "./constants";
import type {
  CategoryFormData,
  DispatchSla,
  FormEntityMode,
  VisibilityStatus,
} from "./types";

export interface CategoryTaxonomyFormProps {
  formRef: React.RefObject<HTMLDivElement | null>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CategoryFormData;
  categories: CategoryRow[];
  onUpdateField: <K extends keyof CategoryFormData>(
    field: K,
    value: CategoryFormData[K]
  ) => void;
  onSetFormMode: (mode: FormEntityMode) => void;
  onReset: () => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  savedMessage: string | null;
}

export function CategoryTaxonomyForm({
  formRef,
  open,
  onOpenChange,
  formData,
  categories,
  onUpdateField,
  onSetFormMode,
  onReset,
  onSubmit,
  saving,
  savedMessage,
}: CategoryTaxonomyFormProps) {
  const isEditing = Boolean(formData.editingId);

  const categorySelectOptions = React.useMemo(() => {
    return categories.map((c) => ({
      id: c.id,
      label: c.title,
    }));
  }, [categories]);

  return (
    <AdminInlineForm
      formRef={formRef}
      eyebrow="Inline Catalog & Service Form"
      title={
        isEditing
          ? `Edit & Manage ${
              formData.formMode === "category"
                ? `Category: ${formData.title}`
                : `Service: ${formData.serviceTitle}`
            }`
          : "Add, Edit & Manage Categories and Services"
      }
      description="Switch between Service Category and Bookable Service below to create or update catalog offerings, base rates, and sub-services inline."
      isEditing={isEditing}
      editingBadgeText={`Editing ${formData.formMode.toUpperCase()}`}
      onResetToCreate={onReset}
      open={open}
      onOpenChange={onOpenChange}
      savedMessage={savedMessage}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <AdminSelectPills
          label="Catalog Record Type"
          options={FORM_ENTITY_OPTIONS}
          value={formData.formMode}
          onChange={(next) => onSetFormMode(next as FormEntityMode)}
          columns={2}
        />

        {formData.formMode === "category" ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AdminTextField
                label="Category Title"
                placeholder="e.g. Solar & Renewable Energy"
                value={formData.title}
                onChange={(e) => onUpdateField("title", e.target.value)}
                required
              />
              <AdminTextField
                label="Recommended Base Price (NGN)"
                type="number"
                min={1000}
                value={formData.basePrice}
                onChange={(e) => onUpdateField("basePrice", e.target.value)}
                required
              />
              <AdminSelectPills
                label="Catalog Visibility"
                options={VISIBILITY_OPTIONS}
                value={formData.categoryVisibility}
                onChange={(v) =>
                  onUpdateField("categoryVisibility", v as VisibilityStatus)
                }
                columns={2}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AdminTextField
                label="Category Description"
                placeholder="Rooftop solar arrays, lithium battery banks, and hybrid inverters."
                value={formData.description}
                onChange={(e) => onUpdateField("description", e.target.value)}
                required
              />
              <AdminTextField
                label="Bookable Sub-Services (comma separated)"
                value={formData.subServices}
                onChange={(e) => onUpdateField("subServices", e.target.value)}
                hint="Each comma-separated item becomes a bookable sub-service in the marketplace."
                required
              />
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <AdminTextField
                label="Bookable Service Title"
                placeholder="e.g. Split AC Gas Refill & Coil Wash"
                value={formData.serviceTitle}
                onChange={(e) => onUpdateField("serviceTitle", e.target.value)}
                required
              />
              <AdminSelectField
                label="Parent Category"
                options={
                  categorySelectOptions.length > 0
                    ? categorySelectOptions
                    : [{ id: "general", label: "General Services" }]
                }
                value={formData.serviceCategoryId}
                onChange={(cId) => onUpdateField("serviceCategoryId", cId)}
              />
              <AdminTextField
                label="Standard Service Rate (NGN)"
                type="number"
                min={1000}
                value={formData.servicePrice}
                onChange={(e) => onUpdateField("servicePrice", e.target.value)}
                required
              />
              <AdminTextField
                label="Estimated Job Duration"
                placeholder="e.g. 45 - 60 mins"
                value={formData.serviceDuration}
                onChange={(e) =>
                  onUpdateField("serviceDuration", e.target.value)
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AdminSelectPills
                label="Dispatch SLA Tier"
                options={SLA_OPTIONS}
                value={formData.serviceSla}
                onChange={(sla) =>
                  onUpdateField("serviceSla", sla as DispatchSla)
                }
                columns={3}
              />
              <AdminSelectPills
                label="Service Availability"
                options={VISIBILITY_OPTIONS}
                value={formData.serviceStatus}
                onChange={(st) =>
                  onUpdateField("serviceStatus", st as VisibilityStatus)
                }
                columns={2}
              />
            </div>
          </>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-surface-frost">
          {isEditing && (
            <CtaButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={onReset}
            >
              Cancel Edit
            </CtaButton>
          )}
          <CtaButton
            type="submit"
            variant="primary"
            size="sm"
            disabled={saving}
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4" />
                <span>
                  {saving
                    ? "Saving..."
                    : `Update ${
                        formData.formMode === "category"
                          ? "Category"
                          : "Service"
                      }`}
                </span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>
                  {saving
                    ? "Creating..."
                    : `Create ${
                        formData.formMode === "category"
                          ? "Service Category"
                          : "Bookable Service"
                      }`}
                </span>
              </>
            )}
          </CtaButton>
        </div>
      </form>
    </AdminInlineForm>
  );
}

