import { z } from "zod";

export const portalEnum = z.enum([
  "admin",
  "mobile",
  "customer",
  "client",
  "artisan",
]);

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(3, "Email address is required")
    .email("Please enter a valid email address")
    .transform((v) => v.toLowerCase()),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password is too long"),
  portal: portalEnum.optional(),
  expectedRole: z
    .enum(["admin", "customer", "client", "artisan"])
    .optional(),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(120, "Full name is too long"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .transform((v) => v.toLowerCase()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
  role: z
    .enum(["customer", "client", "artisan", "admin"])
    .optional()
    .default("client"),
  phone: z.string().trim().max(32).optional().nullable(),
  city: z.string().trim().max(80).optional(),
  address: z.string().trim().max(240).optional().nullable(),
  trade: z.string().trim().max(80).optional(),
  categoryId: z.string().trim().max(80).optional().nullable(),
  hourlyRateNumeric: z.coerce.number().min(500).max(5_000_000).optional(),
  adminRoleTitle: z.string().trim().max(80).optional().nullable(),
  adminPermissions: z.array(z.string()).optional(),
  mustChangePassword: z.boolean().optional(),
});

export const verifyOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .transform((v) => v.toLowerCase()),
  action: z
    .enum([
      "send",
      "verify-email",
      "sign-in",
      "admin-mfa",
      "reset-password",
    ])
    .optional()
    .default("verify-email"),
  type: z
    .enum(["sign-in", "email-verification", "forget-password"])
    .optional(),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "OTP must be a 6-digit numeric code")
    .optional(),
  mfaChallengeToken: z.string().trim().optional(),
  trustDevice: z.boolean().optional().default(true),
  portal: portalEnum.optional(),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(128)
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Current password is required")
    .max(128),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(128),
  revokeOtherSessions: z.boolean().optional().default(true),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(3, "Email address is required")
    .email("Please enter a valid email address")
    .transform((v) => v.toLowerCase()),
  portal: portalEnum.optional(),
  deliveryMethod: z.enum(["otp", "link", "both"]).optional().default("both"),
});

export const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email("Please enter a valid email address")
      .transform((v) => v.toLowerCase())
      .optional(),
    otp: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "OTP must be a 6-digit numeric code")
      .optional(),
    token: z.string().trim().optional(),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(128, "Password is too long"),
    portal: portalEnum.optional(),
  })
  .refine(
    (data) => Boolean((data.email && data.otp) || data.token),
    {
      message: "Either a 6-digit OTP code with email or a reset token is required",
      path: ["otp"],
    }
  );

export const customerOnboardingSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  phone: z
    .string()
    .trim()
    .min(7, "A valid Nigerian phone number is required")
    .max(24),
  city: z.string().trim().min(2, "City is required").max(80),
  address: z.string().trim().max(240).optional().nullable(),
});

export const artisanKycNumberRegex = /^\d{11}$/;
export const nubanAccountRegex = /^\d{10}$/;

export const artisanOnboardingSchema = z.object({
  step: z
    .enum(["trade_profile", "kyc_submission", "complete_all"])
    .optional()
    .default("complete_all"),
  name: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().max(24).optional(),
  city: z.string().trim().max(80).optional(),
  address: z.string().trim().max(240).optional(),
  trade: z.string().trim().max(80).optional(),
  categoryId: z.string().trim().max(80).optional().nullable(),
  hourlyRateNumeric: z.coerce.number().min(500).max(5_000_000).optional(),
  about: z.string().trim().max(2000).optional(),
  skills: z.array(z.string().trim()).optional(),
  portfolioImages: z.array(z.string().trim()).optional(),
  ninNumber: z
    .string()
    .trim()
    .regex(artisanKycNumberRegex, "NIN must be an 11-digit number")
    .optional(),
  bankName: z.string().trim().min(2).max(100).optional(),
  bankAccountNumber: z
    .string()
    .trim()
    .regex(nubanAccountRegex, "Bank account number (NUBAN) must be 10 digits")
    .optional(),
  bankAccountName: z.string().trim().min(2).max(120).optional(),
  kycSelfieUrl: z
    .string()
    .trim()
    .url("A valid URL for the KYC live selfie photo is required")
    .optional(),
  kycIdDocumentUrl: z
    .string()
    .trim()
    .url("A valid URL for the government ID document photo is required")
    .optional(),
  kycIdType: z
    .enum([
      "nin_slip",
      "national_id",
      "drivers_license",
      "voters_card",
      "passport",
    ])
    .optional()
    .default("nin_slip"),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

export const updateMeSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().max(24).optional().nullable(),
  city: z.string().trim().max(80).optional().nullable(),
  address: z.string().trim().max(240).optional().nullable(),
  image: z.string().trim().max(500).optional().nullable(),
});
