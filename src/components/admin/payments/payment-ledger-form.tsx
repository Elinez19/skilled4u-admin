"use client";

import * as React from "react";
import { Plus, Save } from "lucide-react";
import {
  AdminInlineForm,
  AdminSelectPills,
  AdminTextField,
} from "@/components/admin/ui/admin-form-controls";
import { CtaButton } from "@/components/landing/ui/cta-button";
import { formatCurrency } from "@/lib/utils";
import { CHANNEL_OPTIONS, ESCROW_STATE_OPTIONS } from "./constants";
import type {
  EscrowStateOption,
  PaymentChannel,
  PaymentFormData,
} from "./types";

export interface PaymentLedgerFormProps {
  formRef: React.RefObject<HTMLDivElement | null>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: PaymentFormData;
  onUpdateField: <K extends keyof PaymentFormData>(
    field: K,
    value: PaymentFormData[K]
  ) => void;
  onSetPaymentMethod: (method: PaymentChannel) => void;
  onSetEscrowStatus: (status: EscrowStateOption) => void;
  onReset: () => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  savedMessage: string | null;
}

export function PaymentLedgerForm({
  formRef,
  open,
  onOpenChange,
  formData,
  onUpdateField,
  onSetPaymentMethod,
  onSetEscrowStatus,
  onReset,
  onSubmit,
  saving,
  savedMessage,
}: PaymentLedgerFormProps) {
  const isEditing = Boolean(formData.editingId);
  const gross = Number(formData.amount) || 0;
  const artisanPayout = Math.round(gross * 0.9);
  const platformFee = Math.round(gross * 0.1);

  return (
    <AdminInlineForm
      formRef={formRef}
      eyebrow="Inline Financials & Escrow Form"
      title={
        isEditing
          ? `Edit & Manage Transaction ${formData.editingRef || formData.editingId}`
          : "Record & Manage Escrow Transaction"
      }
      description="Log a customer booking deposit, adjust artisan beneficiary payouts, or update escrow settlement states inline."
      isEditing={isEditing}
      editingBadgeText={`Ref: ${formData.editingRef || ""}`}
      onResetToCreate={onReset}
      open={open}
      onOpenChange={onOpenChange}
      savedMessage={savedMessage}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminTextField
            label="Client Full Name"
            value={formData.clientName}
            onChange={(e) => onUpdateField("clientName", e.target.value)}
            required
          />
          <AdminTextField
            label="Client Email"
            type="email"
            value={formData.clientEmail}
            onChange={(e) => onUpdateField("clientEmail", e.target.value)}
            required
          />
          <AdminTextField
            label="Artisan Beneficiary"
            value={formData.artisanName}
            onChange={(e) => onUpdateField("artisanName", e.target.value)}
            required
          />
          <AdminTextField
            label="Gross Amount (NGN)"
            type="number"
            min={1000}
            value={formData.amount}
            onChange={(e) => onUpdateField("amount", e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AdminSelectPills
            label="Payment Channel"
            options={CHANNEL_OPTIONS}
            value={formData.paymentMethod}
            onChange={(m) => onSetPaymentMethod(m as PaymentChannel)}
            columns={4}
          />
          <AdminSelectPills
            label="Escrow Settlement State"
            options={ESCROW_STATE_OPTIONS}
            value={formData.escrowStatus}
            onChange={(s) => onSetEscrowStatus(s as EscrowStateOption)}
            columns={4}
          />
        </div>

        {/* Tokenized 90/10 Split Preview Card */}
        <div className="surface-slab-ink rounded-2xl border-2 border-brand-700 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink-on-blue-muted">
              Artisan Escrow Share (90%):
            </span>
            <span className="font-display text-sm font-extrabold text-accent-sky">
              {formatCurrency(artisanPayout)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink-on-blue-muted">
              Platform Commission (10%):
            </span>
            <span className="font-display text-sm font-extrabold text-accent-gold">
              {formatCurrency(platformFee)}
            </span>
          </div>
        </div>

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
                  {saving ? "Saving..." : "Update Escrow Transaction"}
                </span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>
                  {saving ? "Recording..." : "Record Escrow Deposit"}
                </span>
              </>
            )}
          </CtaButton>
        </div>
      </form>
    </AdminInlineForm>
  );
}

