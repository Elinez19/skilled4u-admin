"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export interface UseLandingNavReturn {
  currentPath: string;
  mobileOpen: boolean;
  headerRef: React.RefObject<HTMLElement | null>;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;
}

export function useLandingNav(): UseLandingNavReturn {
  const pathname = usePathname();
  const currentPath = pathname ?? "";
  const [openOnPath, setOpenOnPath] = useState<string | null>(null);
  const mobileOpen = openOnPath === currentPath;
  const headerRef = useRef<HTMLElement>(null);

  const closeMobileMenu = useCallback(() => {
    setOpenOnPath(null);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setOpenOnPath((prev) => (prev === currentPath ? null : currentPath));
  }, [currentPath]);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    };

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        closeMobileMenu();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, {
      passive: true,
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [mobileOpen, closeMobileMenu]);

  return {
    currentPath,
    mobileOpen,
    headerRef,
    closeMobileMenu,
    toggleMobileMenu,
  };
}

