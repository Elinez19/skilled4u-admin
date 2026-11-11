"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { sanitizeAuthErrorMessage } from "@/lib/utils";

export type AuthStep =
  | "credentials"
  | "mfa"
  | "change_password"
  | "forgot_password"
  | "reset_password";

export interface UseAdminAuthOptions {
  initialStep?: AuthStep;
  initialToken?: string;
  initialEmail?: string;
}

export interface UseAdminAuthReturn {
  step: AuthStep;
  setStep: (step: AuthStep) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  otp: string;
  setOtp: (otp: string) => void;
  trustDevice: boolean;
  setTrustDevice: (trust: boolean) => void;
  mfaChallengeToken: string;
  resetToken: string;
  setResetToken: (token: string) => void;
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
  handleForgotPasswordSubmit: (e: React.FormEvent) => Promise<void>;
  handleResetPasswordSubmit: (e: React.FormEvent) => Promise<void>;
  handleResendResetOtp: () => Promise<void>;
  goToForgotPassword: () => void;
  goToResetPassword: () => void;
  resetToCredentials: () => void;
}

export function useAdminAuth(options: UseAdminAuthOptions = {}): UseAdminAuthReturn {
  const router = useRouter();
  const pathname = usePathname();
  const [step, setStep] = useState<AuthStep>(options.initialStep || "credentials");
  const [email, setEmail] = useState(options.initialEmail || "");
  const [mfaEmail, setMfaEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [trustDevice, setTrustDevice] = useState(true);
  const [mfaChallengeToken, setMfaChallengeToken] = useState<string>("");
  const [resetToken, setResetToken] = useState<string>(options.initialToken || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [timeoutNotice, setTimeoutNotice] = useState<string | null>(null);
  const [callbackUrl, setCallbackUrl] = useState("/admin");

  const clearAuthFields = useCallback(() => {
    setEmail("");
    setMfaEmail("");
    setPassword("");
    setOtp("");
    setTrustDevice(true);
    setMfaChallengeToken("");
    setResetToken("");
    setNewPassword("");
    setConfirmNewPassword("");
    setShowPassword(false);
    setLoading(false);
    setResendingOtp(false);
    setError(null);
    setStatusMessage(null);
  }, []);

  useEffect(() => {
    // Respect explicit initial step option
    if (options.initialStep) {
      setStep(options.initialStep);
    } else if (pathname === "/reset-password") {
      setStep("reset_password");
    } else if (pathname === "/forgot-password") {
      setStep("forgot_password");
    } else {
      setStep("credentials");
    }

    if (options.initialToken) {
      setResetToken(options.initialToken);
      setStep("reset_password");
    }
    if (options.initialEmail) {
      setEmail(options.initialEmail);
    }

    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const reason = searchParams.get("reason");
      const cb = searchParams.get("callbackUrl");
      const urlToken = searchParams.get("token");
      const urlEmail = searchParams.get("email");

      if (urlToken) {
        setResetToken(urlToken);
        setStep("reset_password");
      }
      if (urlEmail) {
        setEmail(urlEmail);
      }

      if (reason === "timeout") {
        setTimeoutNotice(
          "Your session expired due to inactivity. Please sign in again to continue."
        );
      } else if (reason === "unauthorized") {
        setTimeoutNotice(
          "Please sign in with an Administrator account to access the console."
        );
      } else {
        setTimeoutNotice(null);
      }

      if (cb && cb.startsWith("/admin") && !cb.startsWith("//")) {
        setCallbackUrl(cb);
      } else {
        setCallbackUrl("/admin");
      }

      // Keep the browser URL clean on standard login page (preserve token on reset page)
      if (window.location.search && !urlToken) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    }

    return () => {
      clearAuthFields();
    };
  }, [clearAuthFields, options.initialEmail, options.initialStep, options.initialToken, pathname]);

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
            sanitizeAuthErrorMessage(
              payload.error,
              "Invalid credentials. Please verify your administrator email and password."
            )
          );
          setLoading(false);
          return;
        }

        if (payload?.data?.mfaRequired && payload?.data?.mfaChallengeToken) {
          setMfaEmail(normalizedEmail);
          setMfaChallengeToken(payload.data.mfaChallengeToken);
          setEmail("");
          if (!payload?.data?.mustChangePassword) {
            setPassword("");
          }
          setShowPassword(false);
          setOtp("");
          setStep("mfa");
          setStatusMessage(
            payload.data.message ||
              `We sent a 6-digit security code to ${normalizedEmail}.`
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

        const targetUrl = callbackUrl || "/admin";
        clearAuthFields();
        router.replace(targetUrl);
        router.refresh();
      } catch {
        setError(
          "Unable to connect to the authentication service. Please check your internet connection."
        );
        setLoading(false);
      }
    },
    [callbackUrl, clearAuthFields, email, password, router]
  );

  const handleMfaSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
        const normalizedEmail = (mfaEmail || email).trim().toLowerCase();
        const res = await fetch("/api/v1/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            action: "admin-mfa",
            email: normalizedEmail,
            otp: otp.trim(),
            mfaChallengeToken,
            trustDevice,
            portal: "admin",
          }),
        });

        const payload = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(
            sanitizeAuthErrorMessage(
              payload.error,
              "Invalid or expired 6-digit security code. Please check your email and try again."
            )
          );
          setLoading(false);
          return;
        }

        setOtp("");

        if (payload?.data?.mustChangePassword) {
          setStep("change_password");
          setStatusMessage(
            "First-time administrator sign-in detected. Please set a new personal password to activate your console access."
          );
          setLoading(false);
          return;
        }

        const targetUrl = callbackUrl || "/admin";
        clearAuthFields();
        router.replace(targetUrl);
        router.refresh();
      } catch {
        setError(
          "Verification failed due to a network error. Please try again."
        );
        setLoading(false);
      }
    },
    [
      callbackUrl,
      clearAuthFields,
      email,
      mfaChallengeToken,
      mfaEmail,
      otp,
      router,
      trustDevice,
    ]
  );

  const handleResendOtp = useCallback(async () => {
    setResendingOtp(true);
    setError(null);
    try {
      const normalizedEmail = (mfaEmail || email).trim().toLowerCase();
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
        setError(
          sanitizeAuthErrorMessage(payload.error, "Could not resend 6-digit code. Please try again.")
        );
      } else {
        setStatusMessage(
          `A fresh 6-digit verification code was sent to ${normalizedEmail}.`
        );
      }
    } catch {
      setError("Failed to resend 6-digit verification code. Please check your connection.");
    } finally {
      setResendingOtp(false);
    }
  }, [email, mfaEmail]);

  const handleChangePasswordSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!password || password.trim().length === 0) {
        setError("Please enter your temporary or current password.");
        return;
      }

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
            sanitizeAuthErrorMessage(
              payload.error,
              "Failed to update administrator password. Please try again."
            )
          );
          setLoading(false);
          return;
        }

        const targetUrl = callbackUrl || "/admin";
        clearAuthFields();
        router.replace(targetUrl);
        router.refresh();
      } catch {
        setError(
          "Password update failed due to a connection issue. Please try again."
        );
        setLoading(false);
      }
    },
    [callbackUrl, clearAuthFields, confirmNewPassword, newPassword, password, router]
  );

  const handleForgotPasswordSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setStatusMessage(null);

      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) {
        setError("Please enter your registered email address.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        setError("Please enter a valid email address.");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/v1/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            portal: "admin",
            deliveryMethod: "both",
          }),
        });

        const payload = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(
            sanitizeAuthErrorMessage(
              payload.error,
              "We could not send a reset code. Please check your email address and try again."
            )
          );
          setLoading(false);
          return;
        }

        setStep("reset_password");
        setStatusMessage(
          payload.message ||
            `A 6-digit password reset code has been sent to ${normalizedEmail}.`
        );
        setLoading(false);
      } catch {
        setError(
          "Unable to request password reset due to a connection issue. Please try again."
        );
        setLoading(false);
      }
    },
    [email]
  );

  const handleResetPasswordSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setStatusMessage(null);

      if (!newPassword) {
        setError("Please enter your new password.");
        return;
      }
      if (newPassword.length < 8) {
        setError("Your new password must be at least 8 characters long.");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError("Passwords do not match. Please ensure both passwords match.");
        return;
      }
      if (!resetToken && (!otp || otp.trim().length !== 6)) {
        setError("Please enter the 6-digit verification code sent to your email.");
        return;
      }

      setLoading(true);
      try {
        const normalizedEmail = email.trim().toLowerCase();
        const res = await fetch("/api/v1/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail || undefined,
            otp: otp ? otp.trim() : undefined,
            token: resetToken ? resetToken.trim() : undefined,
            newPassword,
            portal: "admin",
          }),
        });

        const payload = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(
            sanitizeAuthErrorMessage(
              payload.error,
              "Failed to reset password. Please check your verification code and try again."
            )
          );
          setLoading(false);
          return;
        }

        clearAuthFields();
        setStep("credentials");
        setStatusMessage(
          "Your password has been reset successfully! Please sign in with your new password."
        );
        setLoading(false);
      } catch {
        setError(
          "Password reset failed due to a connection issue. Please try again."
        );
        setLoading(false);
      }
    },
    [clearAuthFields, confirmNewPassword, email, newPassword, otp, resetToken]
  );

  const handleResendResetOtp = useCallback(async () => {
    setResendingOtp(true);
    setError(null);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          portal: "admin",
          deliveryMethod: "both",
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          sanitizeAuthErrorMessage(
            payload.error,
            "Could not resend reset code. Please try again."
          )
        );
      } else {
        setStatusMessage(
          `A fresh 6-digit recovery code was sent to ${normalizedEmail}.`
        );
      }
    } catch {
      setError("Failed to resend reset code. Please check your connection.");
    } finally {
      setResendingOtp(false);
    }
  }, [email]);

  const goToForgotPassword = useCallback(() => {
    setError(null);
    setStatusMessage(null);
    setStep("forgot_password");
  }, []);

  const goToResetPassword = useCallback(() => {
    setError(null);
    setStatusMessage(null);
    setStep("reset_password");
  }, []);

  const resetToCredentials = useCallback(() => {
    setStep("credentials");
    clearAuthFields();
  }, [clearAuthFields]);

  return {
    step,
    setStep,
    email,
    setEmail,
    password,
    setPassword,
    otp,
    setOtp,
    trustDevice,
    setTrustDevice,
    mfaChallengeToken,
    resetToken,
    setResetToken,
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
    handleForgotPasswordSubmit,
    handleResetPasswordSubmit,
    handleResendResetOtp,
    goToForgotPassword,
    goToResetPassword,
    resetToCredentials,
  };
}
