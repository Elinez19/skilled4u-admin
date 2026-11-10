"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

export type AuthStep = "credentials" | "mfa" | "change_password";

export interface UseAdminAuthReturn {
  step: AuthStep;
  setStep: (step: AuthStep) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  otp: string;
  setOtp: (otp: string) => void;
  mfaChallengeToken: string;
  newPassword: string;
  setNewPassword: (p: string) => void;
  confirmNewPassword: string;
  setConfirmNewPassword: (p: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean | ((prev: boolean) => boolean)) => void;
  loading: boolean;
  resendingOtp: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  statusMessage: string | null;
  setStatusMessage: (msg: string | null) => void;
  timeoutNotice: string | null;
  callbackUrl: string;
  handleCredentialsSubmit: (e: React.FormEvent) => Promise<void>;
  handleMfaSubmit: (e: React.FormEvent) => Promise<void>;
  handleResendOtp: () => Promise<void>;
  handleChangePasswordSubmit: (e: React.FormEvent) => Promise<void>;
  resetToCredentials: () => void;
}

export function useAdminAuth(): UseAdminAuthReturn {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>("credentials");
  const [email, setEmail] = useState("elijahndenwa88@gmail.com");
  const [password, setPassword] = useState("Admin@2026");
  const [otp, setOtp] = useState("");
  const [mfaChallengeToken, setMfaChallengeToken] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [timeoutNotice, setTimeoutNotice] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const reason = new URLSearchParams(window.location.search).get("reason");
      if (reason === "timeout") {
        return "Your session expired due to inactivity. Please sign in again to continue.";
      } else if (reason === "unauthorized") {
        return "Please sign in with an Administrator account to access the console.";
      }
    }
    return null;
  });
  const [callbackUrl] = useState(() => {
    if (typeof window !== "undefined") {
      const cb = new URLSearchParams(window.location.search).get("callbackUrl");
      if (cb && cb.startsWith("/admin") && !cb.startsWith("//")) {
        return cb;
      }
    }
    return "/admin";
  });

  const handleCredentialsSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      setStatusMessage(null);
      setTimeoutNotice(null);

      try {
        const normalizedEmail = email.trim().toLowerCase();

        const res = await fetch("/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: normalizedEmail,
            password,
            portal: "admin",
          }),
        });

        const payload = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(
            payload.error ||
              "Invalid credentials. Please verify your administrator email and password."
          );
          setLoading(false);
          return;
        }

        if (payload?.data?.mfaRequired && payload?.data?.mfaChallengeToken) {
          setMfaChallengeToken(payload.data.mfaChallengeToken);
          setOtp("");
          setStep("mfa");
          setStatusMessage(
            payload.data.message ||
              `We sent a 6-digit security code to ${normalizedEmail}.`
          );
          setLoading(false);
          return;
        }

        router.push(callbackUrl || "/admin");
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Authentication request failed"
        );
        setLoading(false);
      }
    },
    [callbackUrl, email, password, router]
  );

  const handleMfaSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
        const normalizedEmail = email.trim().toLowerCase();
        const res = await fetch("/api/v1/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            action: "admin-mfa",
            email: normalizedEmail,
            otp: otp.trim(),
            mfaChallengeToken,
            portal: "admin",
          }),
        });

        const payload = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(
            payload.error ||
              "Invalid or expired 6-digit security code. Please check your email and try again."
          );
          setLoading(false);
          return;
        }

        if (payload?.data?.mustChangePassword) {
          setStep("change_password");
          setStatusMessage(
            "First-time administrator sign-in detected. Please set a new personal password to activate your console access."
          );
          setLoading(false);
          return;
        }

        router.push(callbackUrl || "/admin");
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "OTP verification failed"
        );
        setLoading(false);
      }
    },
    [callbackUrl, email, mfaChallengeToken, otp, router]
  );

  const handleResendOtp = useCallback(async () => {
    setResendingOtp(true);
    setError(null);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch("/api/v1/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          email: normalizedEmail,
          type: "sign-in",
          portal: "admin",
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error || "Could not resend OTP code.");
      } else {
        setStatusMessage(
          `A fresh 6-digit verification code was sent to ${normalizedEmail}.`
        );
      }
    } catch {
      setError("Failed to resend 6-digit verification code.");
    } finally {
      setResendingOtp(false);
    }
  }, [email]);

  const handleChangePasswordSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (newPassword.length < 8) {
        setError(
          "Your new administrator password must be at least 8 characters."
        );
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError("New password and confirmation do not match.");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/v1/auth/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            currentPassword: password,
            newPassword,
            revokeOtherSessions: true,
          }),
        });

        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(
            payload.error || "Failed to update administrator password."
          );
          setLoading(false);
          return;
        }

        router.push(callbackUrl || "/admin");
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Password update request failed"
        );
        setLoading(false);
      }
    },
    [callbackUrl, confirmNewPassword, newPassword, password, router]
  );

  const resetToCredentials = useCallback(() => {
    setStep("credentials");
    setError(null);
    setOtp("");
  }, []);

  return {
    step,
    setStep,
    email,
    setEmail,
    password,
    setPassword,
    otp,
    setOtp,
    mfaChallengeToken,
    newPassword,
    setNewPassword,
    confirmNewPassword,
    setConfirmNewPassword,
    showPassword,
    setShowPassword,
    loading,
    resendingOtp,
    error,
    setError,
    statusMessage,
    setStatusMessage,
    timeoutNotice,
    callbackUrl,
    handleCredentialsSubmit,
    handleMfaSubmit,
    handleResendOtp,
    handleChangePasswordSubmit,
    resetToCredentials,
  };
}

