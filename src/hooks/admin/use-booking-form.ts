"use client";

import { useCallback, useRef, useState } from "react";
import type { BookingRow } from "@/db/schema";
import { DEFAULT_BOOKING_FORM } from "@/components/admin/bookings/constants";
import type {
  BookingFormData,
  BookingStatus,
  PaymentStatus,
} from "@/components/admin/bookings/types";

export interface UseBookingFormReturn {
  formOpen: boolean;
  setFormOpen: (open: boolean) => void;
  formRef: React.RefObject<HTMLDivElement | null>;
  editingId: string | null;
  editingCode: string | null;
  formData: BookingFormData;
  updateField: <K extends keyof BookingFormData>(
    field: K,
    value: BookingFormData[K]
  ) => void;
  setBookingStatus: (status: BookingStatus) => void;
  setPaymentStatus: (status: PaymentStatus) => void;
  scrollToForm: () => void;
  resetForm: () => void;
  loadBookingIntoForm: (bk: BookingRow) => void;
}

export function useBookingForm(): UseBookingFormReturn {
  const formRef = useRef<HTMLDivElement>(null);
  const [formOpen, setFormOpen] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [formData, setFormData] = useState<BookingFormData>(DEFAULT_BOOKING_FORM);

  const updateField = useCallback(
    <K extends keyof BookingFormData>(field: K, value: BookingFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const setBookingStatus = useCallback((status: BookingStatus) => {
    updateField("bookingStatus", status);
  }, [updateField]);

  const setPaymentStatus = useCallback((status: PaymentStatus) => {
    updateField("paymentStatus", status);
  }, [updateField]);

  const scrollToForm = useCallback(() => {
    setFormOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }, []);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setEditingCode(null);
    setFormData(DEFAULT_BOOKING_FORM);
  }, []);

  const loadBookingIntoForm = useCallback(
    (bk: BookingRow) => {
      setEditingId(bk.id);
      setEditingCode(bk.bookingCode);
      setFormData({
        clientName: bk.clientName,
        clientEmail: bk.clientEmail || "client@skilled4u.ng",
        clientPhone: bk.clientPhone,
        address: bk.address,
        serviceTitle: bk.serviceTitle,
        artisanName: bk.artisanName,
        scheduledDate: bk.scheduledDate,
        scheduledTime: bk.scheduledTime,
        agreedAmount: String(bk.agreedAmount),
        bookingStatus:
          (bk.status as BookingStatus) || "pending",
        paymentStatus:
          (bk.paymentStatus as PaymentStatus) || "unpaid",
      });
      scrollToForm();
    },
    [scrollToForm]
  );

  return {
    formOpen,
    setFormOpen,
    formRef,
    editingId,
    editingCode,
    formData,
    updateField,
    setBookingStatus,
    setPaymentStatus,
    scrollToForm,
    resetForm,
    loadBookingIntoForm,
  };
}

