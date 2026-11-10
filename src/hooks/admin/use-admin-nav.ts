"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import {
  isAdminLinkActive,
  resolveActiveNavItem,
} from "@/components/admin/navigation/constants";
import type { AdminNavItem } from "@/components/admin/navigation/types";

export interface UseAdminNavReturn {
  pathname: string | null;
  activeItem: AdminNavItem;
  mobileOpen: boolean;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleMobileSidebar: () => void;
  isActive: (href: string) => boolean;
}

export function useAdminNav(): UseAdminNavReturn {
  const pathname = usePathname();
  const currentPath = pathname ?? "";
  const [openOnPath, setOpenOnPath] = useState<string | null>(null);

  const activeItem = resolveActiveNavItem(pathname);
  const mobileOpen = openOnPath === currentPath;

  const closeMobileSidebar = useCallback(() => {
    setOpenOnPath(null);
  }, []);

  const openMobileSidebar = useCallback(() => {
    setOpenOnPath(currentPath);
  }, [currentPath]);

  const toggleMobileSidebar = useCallback(() => {
    setOpenOnPath((prev) => (prev === currentPath ? null : currentPath));
  }, [currentPath]);

  const isActive = useCallback(
    (href: string) => isAdminLinkActive(pathname, href),
    [pathname]
  );

  return {
    pathname,
    activeItem,
    mobileOpen,
    openMobileSidebar,
    closeMobileSidebar,
    toggleMobileSidebar,
    isActive,
  };
}

