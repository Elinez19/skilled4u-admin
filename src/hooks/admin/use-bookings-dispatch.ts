"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { BookingRow } from "@/db/schema";
import type { BookingFormData } from "@/components/admin/bookings/types";

export interface UseBookingsDispatchReturn {
  items: BookingRow[];
  setItems: React.Dispatch<React.SetStateAction<BookingRow[]>>;
  busyId: string | null;
  savedBanner: string | null;
  saving: boolean;
  notifySaved: (msg: string) => void;
  updateBookingFields: (
    id: string,
    patch: { status?: string; paymentStatus?: string }
  ) => Promise<void>;
  deleteBooking: (id: string, onDeleted?: () => void) => Promise<void>;
  saveBooking: (
    formData: BookingFormData,
    editingId: string | null,
    editingCode: string | null
  ) => Promise<boolean>;
  batchComplete: (selectedIds: string[]) => void;
  batchDelete: (selectedIds: string[]) => void;
}

export function useBookingsDispatch(
  initialBookings: BookingRow[]
): UseBookingsDispatchReturn {
  const router = useRouter();
  const [items, setItems] = useState<BookingRow[]>(initialBookings);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  const notifySaved = useCallback((msg: string) => {
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(null), 3500);
  }, []);

  const updateBookingFields = useCallback(
    async (
      id: string,
      patch: { status?: string; paymentStatus?: string }
    ) => {
      setBusyId(id);
      try {
        const res = await fetch("/api/v1/bookings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...patch }),
        });
        if (res.ok) {
          const { data } = await res.json();
          setItems((prev) => prev.map((b) => (b.id === id ? data : b)));
          router.refresh();
        } else {
          setItems((prev) =>
            prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
          );
        }
        notifySaved("Booking dispatch updated");
      } finally {
        setBusyId(null);
      }
    },
    [notifySaved, router]
  );

  const deleteBooking = useCallback(
    async (id: string, onDeleted?: () => void) => {
      setItems((prev) => prev.filter((b) => b.id !== id));
      onDeleted?.();
      try {
        await fetch(`/api/v1/bookings?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        router.refresh();
      } catch {
        // Optimistically removed
      }
      notifySaved("Booking removed from queue");
    },
    [notifySaved, router]
  );

  const saveBooking = useCallback(
    async (
      formData: BookingFormData,
      editingId: string | null,
      editingCode: string | null
    ): Promise<boolean> => {
      setSaving(true);
      try {
        if (editingId) {
          const payload = {
            id: editingId,
            clientName: formData.clientName,
            clientEmail: formData.clientEmail,
            clientPhone: formData.clientPhone,
            address: formData.address,
            serviceTitle: formData.serviceTitle,
            artisanName: formData.artisanName,
            scheduledDate: formData.scheduledDate,
            scheduledTime: formData.scheduledTime,
            agreedAmount: Number(formData.agreedAmount),
            status: formData.bookingStatus,
            paymentStatus: formData.paymentStatus,
          };
          const res = await fetch("/api/v1/bookings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const { data } = await res.json();
            setItems((prev) =>
              prev.map((b) => (b.id === editingId ? data : b))
            );
            router.refresh();
          } else {
            setItems((prev) =>
              prev.map((b) =>
                b.id === editingId ? { ...b, ...payload } : b
              )
            );
          }
          notifySaved(`Updated booking ${editingCode || editingId}`);
          return true;
        } else {
          const res = await fetch("/api/v1/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clientName: formData.clientName,
              clientEmail: formData.clientEmail,
              clientPhone: formData.clientPhone,
              address: formData.address,
              serviceTitle: formData.serviceTitle,
              artisanId: "emeka-okafor",
              artisanName: formData.artisanName,
              scheduledDate: formData.scheduledDate,
              scheduledTime: formData.scheduledTime,
              agreedAmount: Number(formData.agreedAmount),
              status: formData.bookingStatus,
              paymentStatus: formData.paymentStatus,
            }),
          });
          if (res.ok) {
            const { data } = await res.json();
            setItems((prev) => [data, ...prev]);
            router.refresh();
          } else {
            const fallbackBooking: BookingRow = {
              id: `bk_${Date.now()}`,
              bookingCode: `S4U-2026-${Math.floor(
                1000 + Math.random() * 9000
              )}`,
              clientId: null,
              clientName: formData.clientName,
              clientEmail: formData.clientEmail,
              clientPhone: formData.clientPhone,
              artisanId: "emeka-okafor",
              artisanName: formData.artisanName,
              categoryId: null,
              serviceTitle: formData.serviceTitle,
              description: formData.serviceTitle,
              status: formData.bookingStatus,
              scheduledDate: formData.scheduledDate,
              scheduledTime: formData.scheduledTime,
              address: formData.address,
              agreedAmount: Number(formData.agreedAmount),
              paymentStatus: formData.paymentStatus,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            setItems((prev) => [fallbackBooking, ...prev]);
          }
          notifySaved(`Dispatched new booking for ${formData.clientName}`);
          return true;
        }
      } catch {
        return false;
      } finally {
        setSaving(false);
      }
    },
    [notifySaved, router]
  );

  const batchComplete = useCallback(
    (selectedIds: string[]) => {
      setItems((prev) =>
        prev.map((b) =>
          selectedIds.includes(b.id) ? { ...b, status: "completed" } : b
        )
      );
      notifySaved(`Marked ${selectedIds.length} booking(s) as completed`);
    },
    [notifySaved]
  );

  const batchDelete = useCallback(
    (selectedIds: string[]) => {
      const count = selectedIds.length;
      setItems((prev) => prev.filter((b) => !selectedIds.includes(b.id)));
      notifySaved(`Removed ${count} booking record(s)`);
    },
    [notifySaved]
  );

  return {
    items,
    setItems,
    busyId,
    savedBanner,
    saving,
    notifySaved,
    updateBookingFields,
    deleteBooking,
    saveBooking,
    batchComplete,
    batchDelete,
  };
}

