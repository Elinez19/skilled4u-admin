"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ArtisanRow, UserRow } from "@/db/schema";
import {
  INITIAL_ADMINS,
  INITIAL_CUSTOMERS,
} from "@/components/admin/artisans/constants";
import type {
  AdminAccountStatus,
  AdminRecord,
  AdminScopeOption,
  ArtisanUserFormData,
  CustomerAccountStatus,
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
  softDeleteAdmin: (id: string, onDeleted?: () => void) => Promise<boolean>;
  deleteAdmin: (id: string, onDeleted?: () => void) => Promise<void>;
  revokeUserSessions: (userId: string) => Promise<boolean>;
  resetUserPassword: (userId: string) => Promise<boolean>;
  resendAdminInvite: (adminId: string) => Promise<boolean>;
  saveUser: (formData: ArtisanUserFormData) => Promise<boolean>;
  batchVerifyArtisans: (selectedIds: string[]) => void;
  batchDeleteArtisans: (selectedIds: string[]) => void;
  batchDeleteCustomers: (selectedIds: string[]) => Promise<void>;
  batchDeleteAdmins: (selectedIds: string[]) => Promise<void>;
  counts: {
    all: number;
    verified: number;
    pending: number;
    rejected: number;
  };
}

export function useArtisansKyc(
  initialArtisans: ArtisanRow[],
  initialUsers: UserRow[] = [],
  initialBookingCounts: Record<string, number> = {}
): UseArtisansKycReturn {
  const router = useRouter();

  const hydratedCustomers = useMemo<CustomerRecord[]>(() => {
    const clientUsers = initialUsers.filter((u) => u.role === "client");
    if (clientUsers.length === 0 && initialUsers.length === 0) {
      return INITIAL_CUSTOMERS;
    }
    return clientUsers.map((u) => {
      const isSuspended = u.accountStatus === "suspended" || Boolean(u.banned);
      const resolvedStatus: CustomerAccountStatus = isSuspended
        ? "suspended"
        : u.accountStatus === "pending"
          ? "pending"
          : "active";

      const count =
        initialBookingCounts[u.id] ||
        initialBookingCounts[u.email?.toLowerCase()] ||
        0;

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || "+234 803 550 1920",
        city: u.city || "Abuja (Wuse II)",
        bookingsCount: count,
        status: resolvedStatus,
        joinedAt: u.createdAt
          ? new Date(u.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })
          : "2026",
        banned: Boolean(u.banned),
      };
    });
  }, [initialUsers, initialBookingCounts]);

  const hydratedAdmins = useMemo<AdminRecord[]>(() => {
    const adminUsers = initialUsers.filter((u) => u.role === "admin");
    if (adminUsers.length === 0 && initialUsers.length === 0) {
      return INITIAL_ADMINS;
    }
    return adminUsers.map((u) => {
      const isSuspended = u.accountStatus === "suspended" || Boolean(u.banned);
      const resolvedStatus: AdminAccountStatus = isSuspended
        ? "suspended"
        : u.accountStatus === "active"
          ? "active"
          : "verified";

      const scope: AdminScopeOption =
        (u.adminScope as AdminScopeOption) ||
        ((u.adminRoleTitle || "").toLowerCase().includes("kyc")
          ? "kyc_moderator"
          : (u.adminRoleTitle || "").toLowerCase().includes("dispatch")
            ? "dispatch_support"
            : "super_admin");

      let lastActive = "Verified Account";
      if (isSuspended) {
        lastActive = "Account Suspended";
      } else if (u.mustChangePassword) {
        lastActive = "Pending First Login";
      }

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || "+234 803 550 1920",
        roleTitle: u.adminRoleTitle || "Operations Administrator",
        permissions:
          u.adminPermissions ||
          "User verification, booking dispatch & escrow support",
        adminScope: scope,
        status: resolvedStatus,
        mustChangePassword: Boolean(u.mustChangePassword),
        lastActive,
        banned: Boolean(u.banned),
      };
    });
  }, [initialUsers]);

  const [artisans, setArtisans] = useState<ArtisanRow[]>(initialArtisans);
  const [customers, setCustomers] = useState<CustomerRecord[]>(hydratedCustomers);
  const [admins, setAdmins] = useState<AdminRecord[]>(hydratedAdmins);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  const notifySaved = useCallback((msg: string) => {
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(null), 4500);
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
          notifySaved(`KYC status set to ${nextKycStatus}`);
          router.refresh();
        } else {
          const err = await res.json().catch(() => ({}));
          notifySaved(err.error || `Failed to set KYC status to ${nextKycStatus}`);
        }
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
          notifySaved(`${art.name} marked ${nextOnline ? "Online" : "Offline"}`);
        } else {
          const err = await res.json().catch(() => ({}));
          notifySaved(err.error || "Failed to update online availability");
        }
      } finally {
        setBusyId(null);
      }
    },
    [notifySaved]
  );

  const deleteArtisan = useCallback(
    async (id: string, onDeleted?: () => void) => {
      setBusyId(id);
      try {
        const res = await fetch(`/api/v1/artisans?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setArtisans((prev) => prev.filter((a) => a.id !== id));
          onDeleted?.();
          notifySaved("Artisan record permanently removed");
          router.refresh();
        } else {
          const err = await res.json().catch(() => ({}));
          notifySaved(err.error || "Failed to delete artisan record");
        }
      } finally {
        setBusyId(null);
      }
    },
    [notifySaved, router]
  );

  const toggleCustomerStatus = useCallback(
    async (id: string) => {
      const current = customers.find((c) => c.id === id);
      if (!current) return;

      const isCurrentlySuspended = current.status === "suspended";
      const nextStatus: CustomerAccountStatus = isCurrentlySuspended
        ? "active"
        : "suspended";

      setBusyId(id);
      try {
        const res = await fetch("/api/v1/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            accountStatus: nextStatus,
            banned: nextStatus === "suspended",
            banReason:
              nextStatus === "suspended"
                ? "Account suspended by Administrator"
                : null,
          }),
        });

        if (res.ok) {
          setCustomers((prev) =>
            prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c))
          );
          notifySaved(
            `Customer account ${nextStatus === "suspended" ? "suspended and logged out" : "reactivated"}`
          );
          router.refresh();
        } else {
          const err = await res.json().catch(() => ({}));
          notifySaved(err.error || "Failed to update customer account status");
        }
      } finally {
        setBusyId(null);
      }
    },
    [customers, notifySaved, router]
  );

  const deleteCustomer = useCallback(
    async (id: string, onDeleted?: () => void) => {
      setBusyId(id);
      try {
        const res = await fetch(`/api/v1/users?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setCustomers((prev) => prev.filter((c) => c.id !== id));
          onDeleted?.();
          notifySaved("Customer record deleted");
          router.refresh();
        } else {
          const err = await res.json().catch(() => ({}));
          notifySaved(err.error || "Failed to delete customer record");
        }
      } finally {
        setBusyId(null);
      }
    },
    [notifySaved, router]
  );

  const toggleAdminStatus = useCallback(
    async (id: string) => {
      const current = admins.find((adm) => adm.id === id);
      if (!current) return;

      const isCurrentlySuspended = current.status === "suspended";
      const nextStatus: AdminAccountStatus = isCurrentlySuspended
        ? "verified"
        : "suspended";

      setBusyId(id);
      try {
        const res = await fetch("/api/v1/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            accountStatus: nextStatus,
            banned: nextStatus === "suspended",
            banReason:
              nextStatus === "suspended"
                ? "Administrator clearance revoked by Super Admin"
                : null,
          }),
        });

        if (res.ok) {
          setAdmins((prev) =>
            prev.map((adm) =>
              adm.id === id
                ? {
                    ...adm,
                    status: nextStatus,
                    lastActive:
                      nextStatus === "suspended"
                        ? "Account Suspended"
                        : "Active Staff",
                  }
                : adm
            )
          );
          notifySaved(
            `Administrator ${nextStatus === "suspended" ? "suspended and sessions revoked" : "clearance restored"}`
          );
          router.refresh();
        } else {
          const err = await res.json().catch(() => ({}));
          notifySaved(err.error || "Failed to update administrator status");
        }
      } finally {
        setBusyId(null);
      }
    },
    [admins, notifySaved, router]
  );

  const softDeleteAdmin = useCallback(
    async (id: string, onDeleted?: () => void): Promise<boolean> => {
      setBusyId(id);
      try {
        const res = await fetch("/api/v1/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            accountStatus: "suspended",
            banned: true,
            banReason: "Administrator access soft-deleted (suspended)",
          }),
        });

        if (res.ok) {
          setAdmins((prev) =>
            prev.map((adm) =>
              adm.id === id
                ? {
                    ...adm,
                    status: "suspended",
                    lastActive: "Account Suspended",
                    banned: true,
                  }
                : adm
            )
          );
          notifySaved("Deleted successfully");
          router.refresh();
          onDeleted?.();
          return true;
        } else {
          const err = await res.json().catch(() => ({}));
          notifySaved(err.error || "Failed to soft delete administrator account");
          return false;
        }
      } finally {
        setBusyId(null);
      }
    },
    [notifySaved, router]
  );

  const deleteAdmin = useCallback(
    async (id: string, onDeleted?: () => void) => {
      setBusyId(id);
      try {
        const res = await fetch(`/api/v1/users?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setAdmins((prev) => prev.filter((adm) => adm.id !== id));
          onDeleted?.();
          notifySaved("Deleted successfully");
          router.refresh();
        } else {
          const err = await res.json().catch(() => ({}));
          notifySaved(err.error || "Failed to delete administrator account");
        }
      } finally {
        setBusyId(null);
      }
    },
    [notifySaved, router]
  );

  const revokeUserSessions = useCallback(
    async (userId: string): Promise<boolean> => {
      setBusyId(userId);
      try {
        const res = await fetch(`/api/v1/users/${userId}/revoke-sessions`, {
          method: "POST",
        });
        if (res.ok) {
          const body = await res.json();
          notifySaved(body.message || "All active sessions revoked");
          return true;
        } else {
          const err = await res.json().catch(() => ({}));
          notifySaved(err.error || "Failed to revoke user sessions");
          return false;
        }
      } finally {
        setBusyId(null);
      }
    },
    [notifySaved]
  );

  const resetUserPassword = useCallback(
    async (userId: string): Promise<boolean> => {
      setBusyId(userId);
      try {
        const res = await fetch(`/api/v1/users/${userId}/reset-password`, {
          method: "POST",
        });
        if (res.ok) {
          const body = await res.json();
          notifySaved(body.message || "Password reset email sent");
          return true;
        } else {
          const err = await res.json().catch(() => ({}));
          notifySaved(err.error || "Failed to send password reset");
          return false;
        }
      } finally {
        setBusyId(null);
      }
    },
    [notifySaved]
  );

  const resendAdminInvite = useCallback(
    async (adminId: string): Promise<boolean> => {
      setBusyId(adminId);
      try {
        const res = await fetch(`/api/v1/users/${adminId}/resend-invite`, {
          method: "POST",
        });
        if (res.ok) {
          const body = await res.json();
          notifySaved(body.message || "New credentials sent");
          router.refresh();
          return true;
        } else {
          const err = await res.json().catch(() => ({}));
          notifySaved(err.error || "Failed to resend credentials");
          return false;
        }
      } finally {
        setBusyId(null);
      }
    },
    [notifySaved, router]
  );

  const batchDeleteCustomers = useCallback(
    async (selectedIds: string[]) => {
      try {
        const res = await fetch(
          `/api/v1/users?ids=${encodeURIComponent(selectedIds.join(","))}`,
          { method: "DELETE" }
        );
        if (res.ok) {
          setCustomers((prev) =>
            prev.filter((c) => !selectedIds.includes(c.id))
          );
          notifySaved(`Removed ${selectedIds.length} customer record(s)`);
          router.refresh();
        } else {
          const err = await res.json().catch(() => ({}));
          notifySaved(err.error || "Failed to batch remove customer records");
        }
      } catch {
        notifySaved("Network error during batch customer removal");
      }
    },
    [notifySaved, router]
  );

  const batchDeleteAdmins = useCallback(
    async (selectedIds: string[]) => {
      try {
        const res = await fetch(
          `/api/v1/users?ids=${encodeURIComponent(selectedIds.join(","))}`,
          { method: "DELETE" }
        );
        if (res.ok) {
          setAdmins((prev) =>
            prev.filter((a) => !selectedIds.includes(a.id))
          );
          notifySaved(`Removed ${selectedIds.length} administrator account(s)`);
          router.refresh();
        } else {
          const err = await res.json().catch(() => ({}));
          notifySaved(err.error || "Failed to batch remove administrator accounts");
        }
      } catch {
        notifySaved("Network error during batch administrator removal");
      }
    },
    [notifySaved, router]
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
              notifySaved(`Updated artisan ${formData.name}`);
              router.refresh();
              return true;
            } else {
              const err = await res.json().catch(() => ({}));
              notifySaved(err.error || `Failed to update artisan ${formData.name}`);
              return false;
            }
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
              notifySaved(`Added artisan pro ${formData.name}`);
              router.refresh();
              return true;
            } else {
              const err = await res.json().catch(() => ({}));
              notifySaved(err.error || `Failed to create artisan pro ${formData.name}`);
              return false;
            }
          }
        } else if (formData.formGroup === "customer") {
          if (formData.editingId) {
            const res = await fetch("/api/v1/users", {
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
            });

            if (res.ok) {
              setCustomers((prev) =>
                prev.map((c) =>
                  c.id === formData.editingId
                    ? {
                        ...c,
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        city: formData.city,
                        status: formData.customerStatus,
                      }
                    : c
                )
              );
              notifySaved(`Updated customer ${formData.name}`);
              router.refresh();
              return true;
            } else {
              const err = await res.json().catch(() => ({}));
              notifySaved(err.error || `Failed to update customer ${formData.name}`);
              return false;
            }
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
            });

            if (res.ok) {
              const created = (await res.json()).data;
              const newCustomer: CustomerRecord = {
                id: created.id,
                name: created.name,
                email: created.email,
                phone: created.phone || formData.phone,
                city: created.city || formData.city,
                bookingsCount: 0,
                status: formData.customerStatus,
                joinedAt: "Just now",
              };
              setCustomers((prev) => [newCustomer, ...prev]);
              notifySaved(`Registered customer account for ${formData.name}`);
              router.refresh();
              return true;
            } else {
              const err = await res.json().catch(() => ({}));
              notifySaved(err.error || `Failed to register customer ${formData.name}`);
              return false;
            }
          }
        } else {
          // Admin Staff
          if (formData.editingId) {
            const res = await fetch("/api/v1/users", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: formData.editingId,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password?.trim() ? formData.password.trim() : undefined,
                role: "admin",
                adminScope: formData.adminScope,
                accountStatus: formData.adminStatus,
                adminRoleTitle: formData.roleTitle,
                adminPermissions: formData.permissions,
              }),
            });

            if (res.ok) {
              setAdmins((prev) =>
                prev.map((adm) =>
                  adm.id === formData.editingId
                    ? {
                        ...adm,
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        roleTitle: formData.roleTitle,
                        permissions: formData.permissions,
                        adminScope: formData.adminScope,
                        status: formData.adminStatus,
                      }
                    : adm
                )
              );
              notifySaved(`Updated administrator ${formData.name}`);
              router.refresh();
              return true;
            } else {
              const err = await res.json().catch(() => ({}));
              notifySaved(err.error || `Failed to update administrator ${formData.name}`);
              return false;
            }
          } else {
            const res = await fetch("/api/v1/users", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password?.trim() ? formData.password.trim() : undefined,
                role: "admin",
                adminScope: formData.adminScope,
                accountStatus: formData.adminStatus,
                adminRoleTitle: formData.roleTitle,
                adminPermissions: formData.permissions,
              }),
            });

            if (res.ok) {
              const created = (await res.json()).data;
              const newAdmin: AdminRecord = {
                id: created.id,
                name: created.name,
                email: created.email,
                phone: created.phone || formData.phone,
                roleTitle: created.adminRoleTitle || formData.roleTitle,
                permissions: created.adminPermissions || formData.permissions,
                adminScope: formData.adminScope,
                status: formData.adminStatus,
                mustChangePassword: true,
                lastActive: "Pending First Login",
              };
              setAdmins((prev) => [newAdmin, ...prev]);
              notifySaved(
                `Provisioned administrator ${formData.name}. Welcome email sent.`
              );
              router.refresh();
              return true;
            } else {
              const err = await res.json().catch(() => ({}));
              notifySaved(err.error || `Failed to add administrator ${formData.name}`);
              return false;
            }
          }
        }
      } catch (err) {
        notifySaved(
          err instanceof Error ? err.message : "Network error while saving user"
        );
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
    softDeleteAdmin,
    deleteAdmin,
    revokeUserSessions,
    resetUserPassword,
    resendAdminInvite,
    saveUser,
    batchVerifyArtisans,
    batchDeleteArtisans,
    batchDeleteCustomers,
    batchDeleteAdmins,
    counts,
  };
}
