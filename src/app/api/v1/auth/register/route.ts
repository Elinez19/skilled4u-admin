import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import {
  applyRoleSessionPolicy,
  normalizeUserRole,
  requireAdmin,
} from "@/lib/auth-guard";
import { prepareNinStorage } from "@/lib/kyc-crypto";
import { protectRegistration } from "@/lib/arcjet";
import { registerSchema } from "@/lib/validators/auth";
import { db } from "@/db";
import {
  artisans,
  session as sessionTable,
  user as userTable,
  type ArtisanRow,
} from "@/db/schema";
import { sendWelcomeOnboardingEmail } from "@/lib/resend";

/**
 * POST /api/v1/auth/register
 * Unified registration endpoint for:
 * - Customer Mobile App (`role: "client"` or `"customer"`)
 * - Artisan Mobile App (`role: "artisan"`)
 * - Web Admin Portal (`role: "admin"` — strictly restricted to authenticated Super Admins)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Name, valid email, and password (min 6 characters) are required",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const {
      name,
      email: normalizedEmail,
      password,
      role: rawRole,
      phone,
      city,
      address,
      trade,
      categoryId,
      hourlyRateNumeric,
      adminRoleTitle,
      mustChangePassword,
    } = parsed.data;

    const role = normalizeUserRole(rawRole);

    // SECURITY FIX S1 & RBAC: Block public self-registration of Admins; require an active Super Admin session
    if (role === "admin") {
      const adminGuard = await requireAdmin(req, ["super_admin"]);
      if (!adminGuard.ok) {
        return adminGuard.response;
      }
    }

    // Arcjet registration protection (disposable email blocking + sliding window rate limit)
    const blocked = await protectRegistration(req, normalizedEmail);
    if (blocked) return blocked;

    const resolvedCity = city || "Abuja (Wuse II)";
    const resolvedPhone = phone || "+234 803 000 0000";
    const resolvedPermissions = Array.isArray(body.adminPermissions)
      ? JSON.stringify(body.adminPermissions)
      : typeof body.adminPermissions === "string"
        ? body.adminPermissions
        : "User verification, booking dispatch & escrow support";

    // Check if email already exists (enforces 1-Email-1-Role across all platforms)
    const [existing] = await db
      .select({ id: userTable.id, role: userTable.role })
      .from(userTable)
      .where(eq(userTable.email, normalizedEmail))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        {
          error: `An account with this email address already exists (${normalizeUserRole(existing.role)} role). Each email is strictly bound to one account.`,
          code: "EMAIL_ALREADY_EXISTS",
        },
        { status: 409 }
      );
    }

    const initialOnboardingStatus =
      role === "admin" ? "completed" : "in_progress";
    const initialOnboardingStep = role === "admin" ? 5 : 1;
    const enforceAdminPasswordReset =
      role === "admin" ? (mustChangePassword ?? true) : false;

    // Register via Better Auth so password hashing (scrypt) and session creation happen natively
    const signUpResult = await auth.api.signUpEmail({
      body: {
        name: String(name).trim(),
        email: normalizedEmail,
        password: String(password),
        phone: resolvedPhone,
        city: resolvedCity,
        address: address || resolvedCity,
        onboardingStatus: initialOnboardingStatus,
        onboardingStep: initialOnboardingStep,
        accountStatus:
          role === "admin"
            ? "verified"
            : role === "artisan"
              ? "pending"
              : "active",
        adminRoleTitle:
          role === "admin"
            ? adminRoleTitle || "Operations Administrator"
            : undefined,
        adminPermissions:
          role === "admin" ? resolvedPermissions : undefined,
        mustChangePassword: enforceAdminPasswordReset,
      },
    });

    if (!signUpResult?.user?.id) {
      return NextResponse.json(
        { error: "Failed to register user account" },
        { status: 500 }
      );
    }

    const createdUserId = signUpResult.user.id;

    // When a Super Admin provisions another Admin, revoke the auto-created signUp session
    // so the new Admin must complete 2-step MFA + forced password rotation on their own login
    if (role === "admin" && signUpResult.token) {
      const baseTok = signUpResult.token.includes(".")
        ? signUpResult.token.split(".")[0]
        : signUpResult.token;
      await db.delete(sessionTable).where(eq(sessionTable.token, baseTok));
    }

    const resolvedAdminScope =
      role === "admin"
        ? (body.adminScope ||
            (body.adminRoleTitle?.toLowerCase().includes("dispatch")
              ? "dispatch_support"
              : body.adminRoleTitle?.toLowerCase().includes("kyc")
                ? "kyc_moderator"
                : "super_admin"))
        : null;

    // Ensure role & additional fields are persisted on user table
    const [updatedUser] = await db
      .update(userTable)
      .set({
        role,
        phone: resolvedPhone,
        city: resolvedCity,
        address: address || resolvedCity,
        onboardingStatus: initialOnboardingStatus,
        onboardingStep: initialOnboardingStep,
        accountStatus:
          role === "admin"
            ? "verified"
            : role === "artisan"
              ? "pending"
              : "active",
        adminRoleTitle:
          role === "admin"
            ? adminRoleTitle || "Operations Administrator"
            : null,
        adminPermissions: role === "admin" ? resolvedPermissions : null,
        adminScope: resolvedAdminScope,
        mustChangePassword: enforceAdminPasswordReset,
        emailVerified: role === "admin",
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, createdUserId))
      .returning();

    // Stamp role-specific session timeout (Artisan: 7d max / 24h idle; Client: 30d max / 7d idle)
    const sessionPolicy =
      role !== "admin" && signUpResult.token
        ? await applyRoleSessionPolicy(signUpResult.token, role)
        : null;

    let artisanProfile: ArtisanRow | null = null;

    // If registering as an Artisan, create or link the corresponding row in `artisans` table
    if (role === "artisan") {
      const [existingArtisanByEmail] = await db
        .select()
        .from(artisans)
        .where(eq(artisans.email, normalizedEmail))
        .limit(1);

      const resolvedTrade = trade || "General Skilled Specialist";
      const rateNum = Number(hourlyRateNumeric) || 15000;
      const formattedRate = `₦${rateNum.toLocaleString()}`;
      const ninPrepared =
        typeof body.ninNumber === "string" && /^\d{11}$/.test(body.ninNumber.trim())
          ? prepareNinStorage(body.ninNumber.trim())
          : null;

      if (existingArtisanByEmail) {
        const [linked] = await db
          .update(artisans)
          .set({
            userId: createdUserId,
            name: String(name).trim(),
            phone: resolvedPhone,
            city: resolvedCity,
            ...(ninPrepared
              ? {
                  ninNumber: ninPrepared.ninMasked,
                  ninEncrypted: ninPrepared.ninEncrypted,
                  ninHash: ninPrepared.ninHash,
                }
              : {}),
            updatedAt: new Date(),
          })
          .where(eq(artisans.id, existingArtisanByEmail.id))
          .returning();
        artisanProfile = linked;
      } else {
        const slug = String(name)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        const artisanId = `${slug || "art"}-${Date.now().toString().slice(-4)}`;

        const [createdArtisan] = await db
          .insert(artisans)
          .values({
            id: artisanId,
            userId: createdUserId,
            name: String(name).trim(),
            email: normalizedEmail,
            phone: resolvedPhone,
            trade: resolvedTrade,
            categoryId: categoryId || null,
            serviceKey: resolvedTrade.toLowerCase().split(" ")[0] || "general",
            profileImage: "/images/landing/hero-artisan.png",
            hourlyRate: formattedRate,
            hourlyRateNumeric: rateNum,
            about:
              body.about ||
              `Verified ${resolvedTrade} specialist serving ${resolvedCity}.`,
            skills:
              Array.isArray(body.skills) && body.skills.length > 0
                ? body.skills
                : [resolvedTrade, "Diagnostics & Repair"],
            portfolioImages: ["/images/landing/hero-artisan.png"],
            rating: 5.0,
            reviewsCount: 0,
            completedJobs: 0,
            distance: "1.5 km",
            city: resolvedCity,
            address: address || resolvedCity,
            isOnline: true,
            kycStatus: "pending",
            ninNumber: ninPrepared ? ninPrepared.ninMasked : null,
            ninEncrypted: ninPrepared ? ninPrepared.ninEncrypted : null,
            ninHash: ninPrepared ? ninPrepared.ninHash : null,
            bankName: body.bankName || null,
            bankAccountNumber: body.bankAccountNumber || null,
            bankAccountName: String(name).trim(),
          })
          .returning();

        artisanProfile = createdArtisan;
      }
    }

    if (role === "admin") {
      await sendWelcomeOnboardingEmail({
        to: normalizedEmail,
        name: String(name).trim(),
        role: "admin",
        adminRoleTitle: adminRoleTitle || "Operations Administrator",
        temporaryPassword: enforceAdminPasswordReset ? String(password) : undefined,
      });
    } else {
      await auth.api.sendVerificationOTP({
        body: {
          email: normalizedEmail,
          type: "email-verification",
        },
      });
    }

    const nextStep =
      role === "admin"
        ? enforceAdminPasswordReset
          ? "admin_mfa_and_password_rotation"
          : "completed"
        : "verify_email_otp";

    return NextResponse.json(
      {
        data: {
          user: updatedUser,
          token: role === "admin" ? null : signUpResult.token || null,
          sessionPolicy,
          artisanProfile,
          onboarding: {
            role,
            status: updatedUser.onboardingStatus,
            step: updatedUser.onboardingStep,
            mustChangePassword: updatedUser.mustChangePassword,
            nextStep,
          },
          verificationEmailSent: true,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/v1/auth/register error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to register user account",
      },
      { status: 500 }
    );
  }
}
