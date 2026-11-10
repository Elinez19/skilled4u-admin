"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  ADMIN_IDLE_TIMEOUT_MS,
  ADMIN_WARNING_THRESHOLD_MS,
} from "@/components/admin/navigation/constants";
import type { AdminUserProfile } from "@/components/admin/navigation/types";

export interface UseAdminSessionOptions {
  onBeforeSignOut?: () => void;
}

export interface UseAdminSessionReturn {
  adminUser: AdminUserProfile | null;
  adminName: string;
  adminRoleTitle: string;
  idleSecondsRemaining: number | null;
  handleSignOut: (reason?: "timeout" | "unauthorized") => Promise<void>;
  verifyAdminSession: () => Promise<void>;
}

export function useAdminSession(
  options: UseAdminSessionOptions = {}
): UseAdminSessionReturn {
  const router = useRouter();
  const { onBeforeSignOut } = options;

  const [adminUser, setAdminUser] = useState<AdminUserProfile | null>(null);
  const [adminName, setAdminName] = useState<string>("Admin Portal Active");
  const [adminRoleTitle, setAdminRoleTitle] = useState<string>(
    "Customers · Artisans · Admins"
  );
  const [idleSecondsRemaining, setIdleSecondsRemaining] = useState<
    number | null
  >(null);

  const lastActivityRef = useRef<number>(0);
  const sessionMaxExpiresRef = useRef<number | null>(null);

  const handleSignOut = useCallback(
    async (reason?: "timeout" | "unauthorized") => {
      try {
        await Promise.allSettled([
          fetch("/api/v1/auth/logout", {
            method: "POST",
            credentials: "include",
          }),
          authClient.signOut(),
        ]);
      } finally {
        onBeforeSignOut?.();
        const target = reason ? `/login?reason=${reason}` : "/login";
        router.push(target);
        router.refresh();
      }
    },
    [onBeforeSignOut, router]
  );

  const verifyAdminSession = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const isTimeout = errData?.code === "SESSION_TIMEOUT";
        await handleSignOut(isTimeout ? "timeout" : "unauthorized");
        return;
      }

      const payload = await res.json();
      const user = payload?.data?.user;
      const policy = payload?.data?.sessionPolicy;

      if (!user || user.role !== "admin") {
        await handleSignOut("unauthorized");
        return;
      }

      setAdminUser(user);
      setAdminName(user.name || "Admin Portal Active");
      setAdminRoleTitle(
        user.adminRoleTitle || "Operations & Trust Administrator"
      );
      lastActivityRef.current = Date.now();
      setIdleSecondsRemaining(null);

      if (policy?.expiresAt) {
        sessionMaxExpiresRef.current = new Date(policy.expiresAt).getTime();
      }
    } catch {
      // Network hiccup: keep current UI state until next check
    }
  }, [handleSignOut]);

  useEffect(() => {
    lastActivityRef.current = Date.now();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    verifyAdminSession();

    let lastTouchMs = Date.now();
    function recordActivity() {
      const now = Date.now();
      if (now - lastTouchMs < 1500) return;
      lastTouchMs = now;
      lastActivityRef.current = now;
      setIdleSecondsRemaining((prev) => (prev !== null ? null : prev));
    }

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ] as const;
    for (const evt of events) {
      window.addEventListener(evt, recordActivity, { passive: true });
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        verifyAdminSession();
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const intervalId = window.setInterval(() => {
      const now = Date.now();
      const idleElapsed = now - lastActivityRef.current;

      if (
        sessionMaxExpiresRef.current &&
        now >= sessionMaxExpiresRef.current
      ) {
        window.clearInterval(intervalId);
        handleSignOut("timeout");
        return;
      }

      if (idleElapsed >= ADMIN_IDLE_TIMEOUT_MS) {
        window.clearInterval(intervalId);
        handleSignOut("timeout");
        return;
      }

      if (idleElapsed >= ADMIN_WARNING_THRESHOLD_MS) {
        const remainingSec = Math.max(
          0,
          Math.ceil((ADMIN_IDLE_TIMEOUT_MS - idleElapsed) / 1000)
        );
        setIdleSecondsRemaining(remainingSec);
      } else {
        setIdleSecondsRemaining(null);
      }
    }, 1000);

    return () => {
      for (const evt of events) {
        window.removeEventListener(evt, recordActivity);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, [handleSignOut, verifyAdminSession]);

  return {
    adminUser,
    adminName,
    adminRoleTitle,
    idleSecondsRemaining,
    handleSignOut,
    verifyAdminSession,
  };
}

