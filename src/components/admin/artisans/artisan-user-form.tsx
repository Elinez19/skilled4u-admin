"use client";

import * as React from "react";
import { Save, UserPlus } from "lucide-react";
import {
  AdminInlineForm,
  AdminSelectField,
  AdminSelectPills,
  AdminTextField,
} from "@/components/admin/ui/admin-form-controls";
import { CtaButton } from "@/components/landing/ui/cta-button";
import {
  ADMIN_SCOPE_OPTIONS,
  ADMIN_STATUS_OPTIONS,
  ARTISAN_KYC_OPTIONS,
  CUSTOMER_STATUS_OPTIONS,
  USER_GROUP_OPTIONS,
} from "./constants";
import type {
  AdminAccountStatus,
  AdminScopeOption,
  ArtisanKycStatus,
  ArtisanUserFormData,
  CustomerAccountStatus,
  FormUserGroup,
} from "./types";

export interface ArtisanUserFormProps {
  formRef: React.RefObject<HTMLDivElement | null>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ArtisanUserFormData;
  onUpdateField: <K extends keyof ArtisanUserFormData>(
    field: K,
    value: ArtisanUserFormData[K]
  ) => void;
  onSetFormGroup: (group: FormUserGroup) => void;
  onReset: () => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  savedMessage: string | null;
}

export function ArtisanUserForm({
  formRef,
  open,
  onOpenChange,
  formData,
  onUpdateField,
  onSetFormGroup,
  onReset,
  onSubmit,
  saving,
  savedMessage,
}: ArtisanUserFormProps) {
  const isEditing = Boolean(formData.editingId);

  const getFormTitle = () => {
    if (isEditing) {
      return `Edit ${
        formData.formGroup === "artisan"
          ? "Artisan Pro"
          : formData.formGroup === "customer"
            ? "Customer"
            : "Administrator"
      } Account`;
    }
    return formData.formGroup === "artisan"
      ? "Add & Verify New Artisan Pro"
      : formData.formGroup === "customer"
        ? "Register Customer Profile"
        : "Grant Administrator Access";
  };

  const getSubmitLabel = () => {
    if (saving) return "Saving...";
    if (isEditing) {
      return `Update ${
        formData.formGroup === "artisan"
          ? "Artisan"
          : formData.formGroup === "customer"
            ? "Customer"
            : "Admin"
      }`;
    }
    return formData.formGroup === "artisan"
      ? "Add & Verify Artisan"
      : formData.formGroup === "customer"
        ? "Create Customer"
        : "Add Administrator";
  };

  return (
    <AdminInlineForm
      formRef={formRef}
      eyebrow="Inline Identity & Credentials Form"
      title={getFormTitle()}
      description="Manage marketplace accounts directly. Switch entity role below to register a customer, onboard a verified artisan pro, or grant internal administrator privileges."
      isEditing={isEditing}
      editingBadgeText={formData.name || "User"}
      onResetToCreate={onReset}
      open={open}
      onOpenChange={onOpenChange}
      savedMessage={savedMessage}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {/* User Role Group Selector */}
        <AdminSelectPills
          label="Account Role Type"
          options={USER_GROUP_OPTIONS}
          value={formData.formGroup}
          onChange={(g) => onSetFormGroup(g as FormUserGroup)}
          columns={3}
        />

        {/* Shared Basic Identity Fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminTextField
            label="Full Legal Name"
            value={formData.name}
            onChange={(e) => onUpdateField("name", e.target.value)}
            required
          />
          <AdminTextField
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => onUpdateField("email", e.target.value)}
            required
          />
          <AdminTextField
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => onUpdateField("phone", e.target.value)}
            required
          />
          <AdminTextField
            label="Primary City / Hub"
            value={formData.city}
            onChange={(e) => onUpdateField("city", e.target.value)}
            required
          />
        </div>

        {/* Dynamic Fields: Artisan Pro */}
        {formData.formGroup === "artisan" && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AdminTextField
                label="Primary Trade & Specialization"
                value={formData.trade}
                onChange={(e) => onUpdateField("trade", e.target.value)}
                required
              />
              <AdminTextField
                label="Hourly Base Rate (NGN)"
                type="number"
                min={1000}
                value={formData.hourlyRateNumeric}
                onChange={(e) =>
                  onUpdateField("hourlyRateNumeric", e.target.value)
                }
                required
              />
              <AdminTextField
                label="National ID (NIN) Number"
                value={formData.ninNumber}
                onChange={(e) => onUpdateField("ninNumber", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AdminTextField
                label="Payout Bank Name"
                value={formData.bankName}
                onChange={(e) => onUpdateField("bankName", e.target.value)}
                required
              />
              <AdminTextField
                label="Payout Bank Account Number"
                value={formData.bankAccountNumber}
                onChange={(e) =>
                  onUpdateField("bankAccountNumber", e.target.value)
                }
                required
              />
              <AdminSelectPills
                label="Artisan KYC Status"
                options={ARTISAN_KYC_OPTIONS}
                value={formData.kycStatus}
                onChange={(st) =>
                  onUpdateField("kycStatus", st as ArtisanKycStatus)
                }
                columns={3}
              />
            </div>
          </>
        )}

        {/* Dynamic Fields: Customer */}
        {formData.formGroup === "customer" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AdminSelectPills
              label="Customer Account Standing"
              options={CUSTOMER_STATUS_OPTIONS}
              value={formData.customerStatus}
              onChange={(st) =>
                onUpdateField("customerStatus", st as CustomerAccountStatus)
              }
              columns={3}
            />
          </div>
        )}

        {/* Dynamic Fields: Admin Staff */}
        {formData.formGroup === "admin" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AdminSelectField<AdminScopeOption>
                label="System Access Level & RBAC Scope"
                options={ADMIN_SCOPE_OPTIONS}
                value={formData.adminScope}
                onChange={(sc) => onUpdateField("adminScope", sc)}
                hint="Controls cryptographic permissions for KYC, dispute decisions, and admin management."
              />
              <AdminTextField
                label="Job Designation / Role Title"
                placeholder="e.g. Senior Operations Coordinator"
                value={formData.roleTitle}
                onChange={(e) => onUpdateField("roleTitle", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AdminTextField
                label="Assigned System Permissions Note"
                placeholder="e.g. Identity verification, booking dispatch, and support"
                value={formData.permissions}
                onChange={(e) => onUpdateField("permissions", e.target.value)}
                required
              />
              <AdminSelectPills
                label="Administrator Account Standing"
                options={ADMIN_STATUS_OPTIONS}
                value={formData.adminStatus}
                onChange={(st) =>
                  onUpdateField("adminStatus", st as AdminAccountStatus)
                }
                columns={3}
              />
            </div>
          </div>
        )}

        {/* Submission Actions */}
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
                <span>{getSubmitLabel()}</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>{getSubmitLabel()}</span>
              </>
            )}
          </CtaButton>
        </div>
      </form>
    </AdminInlineForm>
  );
}

