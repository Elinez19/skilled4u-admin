"use client";

import { useCallback, useRef, useState } from "react";
import type { PaymentRow } from "@/db/schema";
import { DEFAULT_PAYMENT_FORM } from "@/components/admin/payments/constants";
import type {
  EscrowStateOption,
  PaymentChannel,
  PaymentFormData,
} from "@/components/admin/payments/types";

export interface UsePaymentFormReturn {
  formOpen: boolean;
  setFormOpen: (open: boolean) => void;
  formRef: React.RefObject<HTMLDivElement | null>;
  formData: PaymentFormData;
  updateField: <K extends keyof PaymentFormData>(
    field: K,
    value: PaymentFormData[K]
  ) => void;
  setPaymentMethod: (method: PaymentChannel) => void;
  setEscrowStatus: (status: EscrowStateOption) => void;
  scrollToForm: () => void;
  resetForm: () => void;
  loadPaymentIntoForm: (pay: PaymentRow) => void;
}

export function usePaymentForm(): UsePaymentFormReturn {
  const formRef = useRef<HTMLDivElement>(null);
  const [formOpen, setFormOpen] = useState(true);
  const [formData, setFormData] =
    useState<PaymentFormData>(DEFAULT_PAYMENT_FORM);

  const updateField = useCallback(
    <K extends keyof PaymentFormData>(
      field: K,
      value: PaymentFormData[K]
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const setPaymentMethod = useCallback(
    (method: PaymentChannel) => {
      updateField("paymentMethod", method);
    },
    [updateField]
  );

  const setEscrowStatus = useCallback(
    (status: EscrowStateOption) => {
      updateField("escrowStatus", status);
    },
    [updateField]
  );

  const scrollToForm = useCallback(() => {
    setFormOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(DEFAULT_PAYMENT_FORM);
  }, []);

  const loadPaymentIntoForm = useCallback(
    (pay: PaymentRow) => {
      setFormData({
        editingId: pay.id,
        editingRef: pay.reference,
        clientName: pay.clientName,
        clientEmail: pay.clientEmail,
        artisanName: pay.artisanName,
        amount: String(pay.amount),
        paymentMethod: (pay.paymentMethod as PaymentChannel) || "card",
        escrowStatus: (pay.escrowStatus as EscrowStateOption) || "held",
      });
      scrollToForm();
    },
    [scrollToForm]
  );

  return {
    formOpen,
    setFormOpen,
    formRef,
    formData,
    updateField,
    setPaymentMethod,
    setEscrowStatus,
    scrollToForm,
    resetForm,
    loadPaymentIntoForm,
  };
}

