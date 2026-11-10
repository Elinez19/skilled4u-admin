"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseSocialShareReturn {
  copiedSocial: string | null;
  handleShare: (label: string) => void;
}

export function useSocialShare(timeoutMs: number = 2200): UseSocialShareReturn {
  const [copiedSocial, setCopiedSocial] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleShare = useCallback(
    (label: string) => {
      if (typeof window !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).catch(() => {});
      }
      setCopiedSocial(label);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setCopiedSocial((prev) => (prev === label ? null : prev));
      }, timeoutMs);
    },
    [timeoutMs]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    copiedSocial,
    handleShare,
  };
}

