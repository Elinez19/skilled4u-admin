import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { normalizeUserRole } from "@/lib/auth-guard";
import { db } from "@/db";
import { artisans, user as userTable, type ArtisanRow } from "@/db/schema";
import { sendWelcomeOnboardingEmail } from "@/lib/resend";

/**
 * POST /api/v1/auth/register
 * Unified registration endpoint for:
 * - Customer Mobile App (`role: "client"` or `"customer"`)
 * - Artisan Mobile App (`role: "artisan"`)
 * - Web Admin Portal (`role: "admin"`)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      role: rawRole,
      phone,
      city,
      address,
      // Artisan optional initial fields
      trade,
      categoryId,
      hourlyRateNumeric,
      about,
      skills,
      ninNumber,
      bankName,
      bankAccountNumber,
      // Admin optional initial fields
      adminRoleTitle,
      adminPermissions,
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const role = normalizeUserRole(rawRole);
    const resolvedCity = city || "Abuja (Wuse II)";
    const resolvedPhone = phone || "+234 803 000 0000";

    // Check if email already exists
    const [existing] = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(eq(userTable.email, normalizedEmail))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 409 }
      );
    }

    const initialOnboardingStatus =
      role === "admin" ? "completed" : "in_progress";
    const initialOnboardingStep = role === "admin" ? 5 : 1;

    // Register via Better Auth so password hashing (scrypt), session token, and 6-digit OTP email are handled natively
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
        accountStatus: role === "admin" ? "verified" : "active",
        adminRoleTitle:
          role === "admin"
            ? adminRoleTitle || "Operations Administrator"
            : undefined,
        adminPermissions:
          role === "admin"
            ? adminPermissions ||
              "User verification, booking dispatch & escrow support"
            : undefined,
      },
    });

    if (!signUpResult?.user?.id) {
      return NextResponse.json(
        { error: "Failed to register user account" },
        { status: 500 }
      );
    }

    const createdUserId = signUpResult.user.id;

    // Ensure role & additional fields are persisted on user table (in case admin plugin defaultRole overrode role)
    const [updatedUser] = await db
      .update(userTable)
      .set({
        role,
        phone: resolvedPhone,
        city: resolvedCity,
        address: address || resolvedCity,
        onboardingStatus: initialOnboardingStatus,
        onboardingStep: initialOnboardingStep,
        accountStatus: role === "admin" ? "verified" : "active",
        adminRoleTitle:
          role === "admin"
            ? adminRoleTitle || "Operations Administrator"
            : null,
        adminPermissions:
          role === "admin"
            ? adminPermissions ||
              "User verification, booking dispatch & escrow support"
            : null,
        emailVerified: role === "admin" ? true : false,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, createdUserId))
      .returning();

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

      if (existingArtisanByEmail) {
        const [linked] = await db
          .update(artisans)
          .set({
            userId: createdUserId,
            name: String(name).trim(),
            phone: resolvedPhone,
            city: resolvedCity,
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
              about ||
              `Verified ${resolvedTrade} specialist serving ${resolvedCity}.`,
            skills: Array.isArray(skills) && skills.length > 0
              ? skills
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
            ninNumber: ninNumber || null,
            bankName: bankName || null,
            bankAccountNumber: bankAccountNumber || null,
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
        ? "completed"
        : "verify_email_otp";

    return NextResponse.json(
      {
        data: {
          user: updatedUser,
          token: signUpResult.token || null,
          artisanProfile,
          onboarding: {
            role,
            status: updatedUser.onboardingStatus,
            step: updatedUser.onboardingStep,
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
