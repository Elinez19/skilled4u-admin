"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import type { AdminUserProfile } from "@/components/admin/navigation/types";

export interface EffectiveAdminUser {
  name: string;
  email: string;
  image: string | null;
  roleTitle: string;
}

export interface UseAdminNavbarDropdownsProps {
  pathname: string | null;
  adminUser?: AdminUserProfile | null;
  searchRef?: React.RefObject<HTMLDivElement | null>;
  onCloseSearch?: () => void;
}

export interface UseAdminNavbarDropdownsReturn {
  alertsOpen: boolean;
  setAlertsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleAlerts: () => void;
  closeAlerts: () => void;
  alertsRef: React.RefObject<HTMLDivElement | null>;

  profileOpen: boolean;
  setProfileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleProfile: () => void;
  closeProfile: () => void;
  profileRef: React.RefObject<HTMLDivElement | null>;

  effectiveUser: EffectiveAdminUser;
  showAvatarImage: boolean;
  handleImageError: () => void;

  closeAll: () => void;
}

export function useAdminNavbarDropdowns({
  pathname,
  adminUser,
  searchRef,
  onCloseSearch,
}: UseAdminNavbarDropdownsProps): UseAdminNavbarDropdownsReturn {
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [failedImageSrc, setFailedImageSrc] = useState<string | null>(null);

  const alertsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fallback to active session if adminUser not passed or pending
  const { data: sessionData } = authClient.useSession();

  const effectiveUser = useMemo<EffectiveAdminUser>(() => {
    const rawName = adminUser?.name || sessionData?.user?.name || "Admin User";
    const rawEmail =
      adminUser?.email || sessionData?.user?.email || "admin@skilled4u.ng";
    const rawImage = adminUser?.image || sessionData?.user?.image || null;
    const rawRole =
      adminUser?.adminRoleTitle ||
      (adminUser?.role
        ? `${adminUser.role.charAt(0).toUpperCase() + adminUser.role.slice(1)} Portal`
        : "Operations Administrator");
    return {
      name: rawName,
      email: rawEmail,
      image: rawImage,
      roleTitle: rawRole,
    };
  }, [adminUser, sessionData]);

  const showAvatarImage = Boolean(
    effectiveUser.image && failedImageSrc !== effectiveUser.image
  );

  const handleImageError = () => {
    if (effectiveUser.image) {
      setFailedImageSrc(effectiveUser.image);
    }
  };

  const closeAlerts = () => setAlertsOpen(false);
  const closeProfile = () => setProfileOpen(false);

  const toggleAlerts = () => {
    setAlertsOpen((prev) => !prev);
    setProfileOpen(false);
    onCloseSearch?.();
  };

  const toggleProfile = () => {
    setProfileOpen((prev) => !prev);
    setAlertsOpen(false);
    onCloseSearch?.();
  };

  const closeAll = () => {
    setAlertsOpen(false);
    setProfileOpen(false);
    onCloseSearch?.();
  };

  // Close menus on path transition
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setProfileOpen(false);
    setAlertsOpen(false);
    onCloseSearch?.();
  }

  // Handle outside click & escape key
  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (searchRef?.current && !searchRef.current.contains(target)) {
        onCloseSearch?.();
      }
      if (alertsRef.current && !alertsRef.current.contains(target)) {
        setAlertsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAlertsOpen(false);
        setProfileOpen(false);
        onCloseSearch?.();
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchRef, onCloseSearch]);

  return {
    alertsOpen,
    setAlertsOpen,
    toggleAlerts,
    closeAlerts,
    alertsRef,

    profileOpen,
    setProfileOpen,
    toggleProfile,
    closeProfile,
    profileRef,

    effectiveUser,
    showAvatarImage,
    handleImageError,

    closeAll,
  };
}

export const useAdminDropdowns = useAdminNavbarDropdowns;

