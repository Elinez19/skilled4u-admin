import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amountInKoboOrNaira: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amountInKoboOrNaira);
}

/**
 * Sanitizes technical error messages, stack traces, and database errors
 * into clear, actionable, and human-friendly messages for end users.
 */
export function sanitizeAuthErrorMessage(
  rawMessage: unknown,
  fallback = "Unable to complete your request. Please try again."
): string {
  if (!rawMessage || typeof rawMessage !== "string") {
    return fallback;
  }

  const msg = rawMessage.trim();

  // Catch JavaScript runtime exceptions & technical jargon
  if (
    msg.includes("safeParse") ||
    msg.includes("Cannot read propert") ||
    msg.includes("is not a function") ||
    msg.includes("undefined") ||
    msg.includes("null") ||
    msg.includes("TypeError") ||
    msg.includes("SyntaxError") ||
    msg.includes("ReferenceError") ||
    msg.includes("JSON.parse") ||
    msg.includes("fetch failed") ||
    msg.includes("ECONN") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("drizzle") ||
    msg.includes("postgres") ||
    msg.includes("neondb") ||
    msg.includes("sql") ||
    msg.includes("database") ||
    msg.includes("column") ||
    msg.includes("foreign key") ||
    msg.includes("syntax error") ||
    msg.includes("Internal Server Error") ||
    msg.includes("500") ||
    msg.includes("[object Object]")
  ) {
    return "We were unable to complete your request. Please try again in a few moments.";
  }

  // Friendly error translations for common scenarios
  if (/rate.*limit|too many attempts/i.test(msg)) {
    return "Too many attempts. For your security, please wait a few minutes before trying again.";
  }
  if (/invalid.*(code|otp)|expired.*(code|otp)/i.test(msg)) {
    return "The 6-digit verification code is invalid or has expired. Please check your email and try again.";
  }
  if (/invalid.*token|expired.*token/i.test(msg)) {
    return "This password reset link is invalid or has expired. Please request a new code or link.";
  }
  if (/suspended|banned/i.test(msg)) {
    return "This account has been suspended. Please contact Skilled4U support for assistance.";
  }
  if (/credentials|invalid email or password/i.test(msg)) {
    return "Invalid email or password. Please verify your login credentials.";
  }

  return msg;
}
