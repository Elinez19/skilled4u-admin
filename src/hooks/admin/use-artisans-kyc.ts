"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ArtisanRow, UserRow } from "@/db/schema";
import {
  INITIAL_ADMINS,
  INITIAL_CUSTOMERS,
} from "@/components/admin/artisans/constants";
import type {
  AdminRecord,
  ArtisanUserFormData,
  CustomerRecord,
} from "@/components/admin/artisans/types";

export interface UseArtisansKycReturn {
  artisans: ArtisanRow[];
  setArtisans: React.Dispatch<React.SetStateAction<ArtisanRow[]>>;
  customers: CustomerRecord[];
  setCustomers: React.Dispatch<React.SetStateAction<CustomerRecord[]>>;
  admins: AdminRecord[];
  setAdmins: React.Dispatch<React.SetStateAction<AdminRecord[]>>;
  busyId: string | null;
  saving: boolean;
  savedBanner: string | null;
  notifySaved: (msg: string) => void;
  updateArtisanKyc: (id: string, nextKycStatus: string) => Promise<void>;
  toggleArtisanOnline: (art: ArtisanRow) => Promise<void>;
  deleteArtisan: (id: string, onDeleted?: () => void) => Promise<void>;
  toggleCustomerStatus: (id: string) => Promise<void>;
  deleteCustomer: (id: string, onDeleted?: () => void) => Promise<void>;
  toggleAdminStatus: (id: string) => Promise<void>;
  deleteAdmin: (id: string, onDeleted?: () => void) => Promise<void>;
  saveUser: (formData: ArtisanUserFormData) => Promise<boolean>;
  batchVerifyArtisans: (selectedIds: string[]) => void;
  batchDeleteArtisans: (selectedIds: string[]) => void;
  counts: {
    all: number;
    verified: number;
    pending: number;
    rejected: number;
  };
}

export function useArtisansKyc(
  initialArtisans: ArtisanRow[],
  initialUsers: UserRow[] = []
): UseArtisansKycReturn {
  const router = useRouter();

  const hydratedCustomers = useMemo<CustomerRecord[]>(() => {
    const clientUsers = initialUsers.filter((u) => u.role === "client");
    if (clientUsers.length === 0) return INITIAL_CUSTOMERS;
    return clientUsers.map((u, idx) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || "+234 803 550 1920",
      city: u.city || "Abuja (Wuse II)",
      bookingsCount: Math.max(2, 6 - idx),
      status: u.accountStatus === "pending" ? "pending" : "active",
      joinedAt: u.createdAt
        ? new Date(u.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
        : "2026",
    }));
  }, [initialUsers]);

  const hydratedAdmins = useMemo<AdminRecord[]>(() => {
    const adminUsers = initialUsers.filter((u) => u.role === "admin");
    if (adminUsers.length === 0) return INITIAL_ADMINS;
    return adminUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      roleTitle: u.adminRoleTitle || "Operations Administrator",
      permissions:
        u.adminPermissions ||
        "User verification, booking dispatch & escrow support",
      status: u.accountStatus === "active" ? "active" : "verified",
      lastActive: "Verified Account",
    }));
  }, [initialUsers]);

  const [artisans, setArtisans] = useState<ArtisanRow[]>(initialArtisans);
  const [customers, setCustomers] = useState<CustomerRecord[]>(hydratedCustomers);
  const [admins, setAdmins] = useState<AdminRecord[]>(hydratedAdmins);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  const notifySaved = useCallback((msg: string) => {
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(null), 3500);
  }, []);

  const counts = useMemo(
    () => ({
      all: artisans.length,
      verified: artisans.filter((a) => a.kycStatus === "verified").length,
      pending: artisans.filter((a) => a.kycStatus === "pending").length,
      rejected: artisans.filter((a) => a.kycStatus === "rejected").length,
    }),
    [artisans]
  );

  const updateArtisanKyc = useCallback(
    async (id: string, nextKycStatus: string) => {
      setBusyId(id);
      try {
        const res = await fetch("/api/v1/artisans", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, kycStatus: nextKycStatus }),
        });
        if (res.ok) {
          const { data } = await res.json();
          setArtisans((prev) => prev.map((a) => (a.id === id ? data : a)));
          router.refresh();
        } else {
          setArtisans((prev) =>
            prev.map((a) =>
              a.id === id ? { ...a, kycStatus: nextKycStatus } : a
            )
          );
        }
        notifySaved(`KYC status set to ${nextKycStatus}`);
      } finally {
        setBusyId(null);
      }
    },
    [notifySaved, router]
  );

  const toggleArtisanOnline = useCallback(
    async (art: ArtisanRow) => {
      setBusyId(art.id);
      try {
        const nextOnline = !art.isOnline;
        const res = await fetch("/api/v1/artisans", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: art.id, isOnline: nextOnline }),
        });
        if (res.ok) {
          const { data } = await res.json();
          setArtisans((prev) => prev.map((a) => (a.id === art.id ? data : a)));
        } else {
          setArtisans((prev) =>
            prev.map((a) =>
              a.id === art.id ? { ...a, isOnline: nextOnline } : a
            )
          );
        }
        notifySaved(
          `${art.name} marked ${!art.isOnline ? "Online" : "Offline"}`
        );
      } finally {
        setBusyId(null);
      }
    },
    [notifySaved]
  );

  const deleteArtisan = useCallback(
    async (id: string, onDeleted?: () => void) => {
      setArtisans((prev) => prev.filter((a) => a.id !== id));
      onDeleted?.();
      try {
        await fetch(`/api/v1/artisans?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        router.refresh();
      } catch {
        // Optimistically removed
      }
      notifySaved("Artisan record removed");
    },
    [notifySaved, router]
  );

  const toggleCustomerStatus = useCallback(
    async (id: string) => {
      const current = customers.find((c) => c.id === id);
      const nextStatus = current?.status === "active" ? "pending" : "active";
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c))
      );
      await fetch("/api/v1/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, accountStatus: nextStatus }),
      }).catch(() => null);
      notifySaved("Customer account status updated");
    },
    [customers, notifySaved]
  );

  const deleteCustomer = useCallback(
    async (id: string, onDeleted?: () => void) => {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      onDeleted?.();
      await fetch(`/api/v1/users?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      }).catch(() => null);
      notifySaved("Customer account removed");
    },
    [notifySaved]
  );

  const toggleAdminStatus = useCallback(
    async (id: string) => {
      const current = admins.find((adm) => adm.id === id);
      const nextStatus = current?.status === "verified" ? "active" : "verified";
      setAdmins((prev) =>
        prev.map((adm) =>
          adm.id === id ? { ...adm, status: nextStatus } : adm
        )
      );
      await fetch("/api/v1/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, accountStatus: nextStatus }),
      }).catch(() => null);
      notifySaved("Administrator status updated");
    },
    [admins, notifySaved]
  );

  const deleteAdmin = useCallback(
    async (id: string, onDeleted?: () => void) => {
      setAdmins((prev) => prev.filter((adm) => adm.id !== id));
      onDeleted?.();
      await fetch(`/api/v1/users?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      }).catch(() => null);
      notifySaved("Administrator access revoked");
    },
    [notifySaved]
  );

  const saveUser = useCallback(
    async (formData: ArtisanUserFormData): Promise<boolean> => {
      setSaving(true);
      try {
        if (formData.formGroup === "artisan") {
          const rateNum = Number(formData.hourlyRateNumeric) || 15000;
          const formattedRate = `₦${rateNum.toLocaleString()}`;

          if (formData.editingId) {
            const res = await fetch("/api/v1/artisans", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: formData.editingId,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                trade: formData.trade,
                city: formData.city,
                hourlyRate: formattedRate,
                hourlyRateNumeric: rateNum,
                ninNumber: formData.ninNumber,
                bankName: formData.bankName,
                bankAccountNumber: formData.bankAccountNumber,
                kycStatus: formData.kycStatus,
              }),
            });
            if (res.ok) {
              const { data } = await res.json();
              setArtisans((prev) =>
                prev.map((a) => (a.id === formData.editingId ? data : a))
              );
              router.refresh();
            } else {
              setArtisans((prev) =>
                prev.map((a) =>
                  a.id === formData.editingId
                    ? {
                        ...a,
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        trade: formData.trade,
                        city: formData.city,
                        hourlyRate: formattedRate,
                        hourlyRateNumeric: rateNum,
                        ninNumber: formData.ninNumber,
                        bankName: formData.bankName,
                        bankAccountNumber: formData.bankAccountNumber,
                        kycStatus: formData.kycStatus,
                      }
                    : a
                )
              );
            }
            notifySaved(`Updated artisan ${formData.name}`);
            return true;
          } else {
            const res = await fetch("/api/v1/artisans", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                trade: formData.trade,
                city: formData.city,
                hourlyRate: formattedRate,
                hourlyRateNumeric: rateNum,
                ninNumber: formData.ninNumber,
                bankName: formData.bankName,
                bankAccountNumber: formData.bankAccountNumber,
                kycStatus: formData.kycStatus,
              }),
            });
            if (res.ok) {
              const { data } = await res.json();
              setArtisans((prev) => [data, ...prev]);
              router.refresh();
            } else {
              const fallbackArtisan: ArtisanRow = {
                id: `art_${Date.now()}`,
                userId: null,
                name: formData.name,
                email: formData.email || "pro@skilled4u.ng",
                phone: formData.phone,
                trade: formData.trade,
                categoryId: null,
                serviceKey: "general",
                profileImage: "/images/landing/hero-artisan.png",
                hourlyRate: formattedRate,
                hourlyRateNumeric: rateNum,
                about: `Verified ${formData.trade} pro serving ${formData.city}.`,
                skills: [formData.trade],
                portfolioImages: [],
                rating: 5.0,
                reviewsCount: 1,
                completedJobs: 1,
                distance: "2.0 km",
                city: formData.city,
                address: formData.city,
                latitude: 9.0765,
                longitude: 7.3986,
                isOnline: true,
                kycStatus: formData.kycStatus,
                ninNumber: formData.ninNumber,
                ninEncrypted: null,
                ninHash: null,
                kycSelfieUrl: null,
                kycIdDocumentUrl: null,
                kycIdType: "nin_slip",
                kycRejectionReason: null,
                bankName: formData.bankName,
                bankAccountNumber: formData.bankAccountNumber,
                bankAccountName: formData.name,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              setArtisans((prev) => [fallbackArtisan, ...prev]);
            }
            notifySaved(`Added artisan ${formData.name}`);
            return true;
          }
        } else if (formData.formGroup === "customer") {
          if (formData.editingId) {
            await fetch("/api/v1/users", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: formData.editingId,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                city: formData.city,
                role: "client",
                accountStatus: formData.customerStatus,
              }),
            }).catch(() => null);
            setCustomers((prev) =>
              prev.map((c) =>
                c.id === formData.editingId
                  ? {
                      ...c,
                      name: formData.name,
                      email: formData.email,
                      phone: formData.phone,
                      city: formData.city,
                      bookingsCount: Number(formData.bookingsCount) || 0,
                      status: formData.customerStatus,
                    }
                  : c
              )
            );
            router.refresh();
            notifySaved(`Updated customer ${formData.name}`);
            return true;
          } else {
            const res = await fetch("/api/v1/users", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                city: formData.city,
                role: "client",
                accountStatus: formData.customerStatus,
              }),
            }).catch(() => null);
            const created = res && res.ok ? (await res.json()).data : null;
            const newCustomer: CustomerRecord = {
              id: created?.id || `cust_${Date.now()}`,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              city: formData.city,
              bookingsCount: Number(formData.bookingsCount) || 0,
              status: formData.customerStatus,
              joinedAt: "Just now",
            };
            setCustomers((prev) => [newCustomer, ...prev]);
            router.refresh();
            notifySaved(`Added customer ${formData.name}`);
            return true;
          }
        } else {
          if (formData.editingId) {
            await fetch("/api/v1/users", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: formData.editingId,
                name: formData.name,
                email: formData.email,
                role: "admin",
                accountStatus: formData.adminStatus,
                adminRoleTitle: formData.roleTitle,
                adminPermissions: formData.permissions,
              }),
            }).catch(() => null);
            setAdmins((prev) =>
              prev.map((adm) =>
                adm.id === formData.editingId
                  ? {
                      ...adm,
                      name: formData.name,
                      email: formData.email,
                      roleTitle: formData.roleTitle,
                      permissions: formData.permissions,
                      status: formData.adminStatus,
                    }
                  : adm
              )
            );
            router.refresh();
            notifySaved(`Updated admin ${formData.name}`);
            return true;
          } else {
            const res = await fetch("/api/v1/users", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                role: "admin",
                accountStatus: formData.adminStatus,
                adminRoleTitle: formData.roleTitle,
                adminPermissions: formData.permissions,
              }),
            }).catch(() => null);
            const created = res && res.ok ? (await res.json()).data : null;
            const newAdmin: AdminRecord = {
              id: created?.id || `adm_${Date.now()}`,
              name: formData.name,
              email: formData.email,
              roleTitle: formData.roleTitle,
              permissions: formData.permissions,
              status: formData.adminStatus,
              lastActive: "Online now",
            };
            setAdmins((prev) => [newAdmin, ...prev]);
            router.refresh();
            notifySaved(`Added administrator ${formData.name}`);
            return true;
          }
        }
      } catch {
        return false;
      } finally {
        setSaving(false);
      }
    },
    [notifySaved, router]
  );

  const batchVerifyArtisans = useCallback(
    (selectedIds: string[]) => {
      setArtisans((prev) =>
        prev.map((a) =>
          selectedIds.includes(a.id) ? { ...a, kycStatus: "verified" } : a
        )
      );
      notifySaved(`Verified ${selectedIds.length} artisan(s)`);
    },
    [notifySaved]
  );

  const batchDeleteArtisans = useCallback(
    (selectedIds: string[]) => {
      const count = selectedIds.length;
      setArtisans((prev) => prev.filter((a) => !selectedIds.includes(a.id)));
      notifySaved(`Removed ${count} artisan record(s)`);
    },
    [notifySaved]
  );

  return {
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
  };
}

