import { NextRequest, NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { resolveAuthSession } from "@/lib/auth-guard";
import { db } from "@/db";
import { artisans, user as userTable } from "@/db/schema";
import { sendWelcomeOnboardingEmail } from "@/lib/resend";

/**
 * POST /api/v1/auth/onboarding/artisan
 * Multi-step Artisan Mobile App onboarding & KYC submission endpoint.
 * Supports:
 * - `step: "trade_profile"` (Step 3: Trade specialty, category, hourly rate, skills, dispatch city & GPS)
 * - `step: "kyc_submission"` (Step 4: NIN 11-digit identity + NUBAN 10-digit bank settlement account)
 * - `step: "complete_all"` (Single-call full profile + KYC submission)
 */
export async function POST(req: NextRequest) {
  try {
    const authCtx = await resolveAuthSession(req);
    const body = await req.json();
    const {
      step = "complete_all",
      userId: bodyUserId,
      email: bodyEmail,
      name,
      phone,
      trade,
      categoryId,
      serviceKey,
      hourlyRateNumeric,
      about,
      skills,
      portfolioImages,
      city,
      address,
      latitude,
      longitude,
      ninNumber,
      bankName,
      bankAccountNumber,
      bankAccountName,
    } = body;

    let targetUser = authCtx?.user || null;

    if (!targetUser && bodyUserId) {
      const [found] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, String(bodyUserId)))
        .limit(1);
      targetUser = found || null;
    } else if (!targetUser && bodyEmail) {
      const [found] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, String(bodyEmail).trim().toLowerCase()))
        .limit(1);
      targetUser = found || null;
    }

    if (!targetUser) {
      return NextResponse.json(
        {
          error:
            "Unauthorized: Please provide a valid Bearer token or user identifier",
        },
        { status: 401 }
      );
    }

    // Locate existing artisan record linked by userId or email
    const [existingArtisan] = await db
      .select()
      .from(artisans)
      .where(
        or(
          eq(artisans.userId, targetUser.id),
          eq(artisans.email, targetUser.email)
        )
      )
      .limit(1);

    const resolvedName = name || targetUser.name;
    const resolvedPhone =
      phone || targetUser.phone || existingArtisan?.phone || "+234 803 000 0000";
    const resolvedCity =
      city || targetUser.city || existingArtisan?.city || "Abuja (Wuse II)";
    const resolvedAddress =
      address || targetUser.address || existingArtisan?.address || resolvedCity;
    const resolvedTrade =
      trade || existingArtisan?.trade || "AC & Refrigeration Specialist";
    const rateNum =
      Number(hourlyRateNumeric) ||
      existingArtisan?.hourlyRateNumeric ||
      15000;
    const formattedRate = `₦${rateNum.toLocaleString()}`;

    if (
      (step === "kyc_submission" || step === "complete_all") &&
      (!ninNumber || !bankName || !bankAccountNumber)
    ) {
      return NextResponse.json(
        {
          error:
            "NIN verification number, settlement bank name, and NUBAN account number are required for KYC submission",
        },
        { status: 400 }
      );
    }

    let artisanProfile = existingArtisan || null;

    if (!artisanProfile) {
      const slug = resolvedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const newArtisanId = `${slug || "art"}-${Date.now().toString().slice(-4)}`;

      const [created] = await db
        .insert(artisans)
        .values({
          id: newArtisanId,
          userId: targetUser.id,
          name: resolvedName,
          email: targetUser.email,
          phone: resolvedPhone,
          trade: resolvedTrade,
          categoryId: categoryId || null,
          serviceKey:
            serviceKey ||
            resolvedTrade.toLowerCase().split(" ")[0] ||
            "general",
          profileImage: "/images/landing/hero-artisan.png",
          hourlyRate: formattedRate,
          hourlyRateNumeric: rateNum,
          about:
            about ||
            `Verified ${resolvedTrade} specialist serving ${resolvedCity}.`,
          skills:
            Array.isArray(skills) && skills.length > 0
              ? skills
              : [resolvedTrade, "Diagnostics & Repair", "Safety Certified"],
          portfolioImages:
            Array.isArray(portfolioImages) && portfolioImages.length > 0
              ? portfolioImages
              : ["/images/landing/hero-artisan.png"],
          rating: 5.0,
          reviewsCount: 0,
          completedJobs: 0,
          distance: "1.5 km",
          city: resolvedCity,
          address: resolvedAddress,
          latitude: typeof latitude === "number" ? latitude : 9.0765,
          longitude: typeof longitude === "number" ? longitude : 7.3986,
          isOnline: true,
          kycStatus: "pending",
          ninNumber: ninNumber || null,
          bankName: bankName || null,
          bankAccountNumber: bankAccountNumber || null,
          bankAccountName: bankAccountName || resolvedName,
        })
        .returning();

      artisanProfile = created;
    } else {
      const [updated] = await db
        .update(artisans)
        .set({
          userId: targetUser.id,
          name: resolvedName,
          phone: resolvedPhone,
          trade: resolvedTrade,
          ...(categoryId !== undefined ? { categoryId } : {}),
          ...(serviceKey ? { serviceKey } : {}),
          hourlyRate: formattedRate,
          hourlyRateNumeric: rateNum,
          ...(about ? { about } : {}),
          ...(Array.isArray(skills) && skills.length > 0 ? { skills } : {}),
          ...(Array.isArray(portfolioImages) && portfolioImages.length > 0
            ? { portfolioImages }
            : {}),
          city: resolvedCity,
          address: resolvedAddress,
          ...(typeof latitude === "number" ? { latitude } : {}),
          ...(typeof longitude === "number" ? { longitude } : {}),
          ...(ninNumber ? { ninNumber: String(ninNumber).trim() } : {}),
          ...(bankName ? { bankName: String(bankName).trim() } : {}),
          ...(bankAccountNumber
            ? { bankAccountNumber: String(bankAccountNumber).trim() }
            : {}),
          bankAccountName:
            bankAccountName || artisanProfile.bankAccountName || resolvedName,
          kycStatus:
            artisanProfile.kycStatus === "verified" ? "verified" : "pending",
          updatedAt: new Date(),
        })
        .where(eq(artisans.id, artisanProfile.id))
        .returning();

      artisanProfile = updated;
    }

    const isKycSubmitted =
      step === "kyc_submission" ||
      step === "complete_all" ||
      Boolean(artisanProfile.ninNumber && artisanProfile.bankAccountNumber);

    const nextOnboardingStatus =
      artisanProfile.kycStatus === "verified"
        ? "completed"
        : isKycSubmitted
          ? "pending_kyc"
          : "in_progress";
    const nextOnboardingStep =
      artisanProfile.kycStatus === "verified"
        ? 5
        : isKycSubmitted
          ? 4
          : 3;

    const [updatedUser] = await db
      .update(userTable)
      .set({
        name: resolvedName,
        phone: resolvedPhone,
        city: resolvedCity,
        address: resolvedAddress,
        role: "artisan",
        onboardingStatus: nextOnboardingStatus,
        onboardingStep: nextOnboardingStep,
        accountStatus:
          artisanProfile.kycStatus === "verified" ? "verified" : "pending",
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, targetUser.id))
      .returning();

    let welcomeEmailSent = false;
    if (isKycSubmitted) {
      const emailRes = await sendWelcomeOnboardingEmail({
        to: updatedUser.email,
        name: updatedUser.name,
        role: "artisan",
        city: resolvedCity,
        trade: resolvedTrade,
      });
      welcomeEmailSent = emailRes.success;
    }

    return NextResponse.json({
      data: {
        user: updatedUser,
        artisanProfile,
        onboarding: {
          role: "artisan",
          status: nextOnboardingStatus,
          step: nextOnboardingStep,
          kycStatus: artisanProfile.kycStatus,
          nextStep:
            nextOnboardingStatus === "completed"
              ? "ready_for_dispatch"
              : isKycSubmitted
                ? "awaiting_admin_kyc_verification"
                : "submit_nin_and_nuban_kyc",
        },
        welcomeEmailSent,
      },
    });
  } catch (error) {
    console.error("POST /api/v1/auth/onboarding/artisan error:", error);
    return NextResponse.json(
      { error: "Failed to process artisan onboarding step" },
      { status: 500 }
    );
  }
}

