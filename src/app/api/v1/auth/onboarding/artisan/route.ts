import { NextRequest, NextResponse } from "next/server";
import { and, eq, ne, or } from "drizzle-orm";
import { normalizeUserRole, requireAuth } from "@/lib/auth-guard";
import { prepareNinStorage } from "@/lib/kyc-crypto";
import { protectMutationApi } from "@/lib/arcjet";
import { artisanOnboardingSchema } from "@/lib/validators/auth";
import { db } from "@/db";
import { artisans, user as userTable } from "@/db/schema";
import { sendWelcomeOnboardingEmail } from "@/lib/resend";

/**
 * POST /api/v1/auth/onboarding/artisan
 * Multi-step Artisan Mobile App onboarding, encrypted NIN + Selfie/ID KYC submission,
 * and KYC rejection re-submission endpoint.
 * Strictly requires an active authenticated Artisan (or Admin) session to prevent IDOR and cross-role mutation.
 */
export async function POST(req: NextRequest) {
  try {
    const blocked = await protectMutationApi(req);
    if (blocked) return blocked;

    const guard = await requireAuth(req, ["artisan", "admin"]);
    if (!guard.ok) {
      return guard.response;
    }

    const body = await req.json().catch(() => ({}));
    const parsed = artisanOnboardingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Invalid artisan onboarding or KYC data",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const caller = guard.auth.user;
    const isAdmin = normalizeUserRole(caller.role) === "admin";

    // Only an Admin may specify another user's ID/email; artisans can only onboard their own account
    let targetUser = caller;
    if (isAdmin && (body.userId || body.email)) {
      if (body.userId) {
        const [found] = await db
          .select()
          .from(userTable)
          .where(eq(userTable.id, String(body.userId)))
          .limit(1);
        if (found) targetUser = found;
      } else if (body.email) {
        const [found] = await db
          .select()
          .from(userTable)
          .where(eq(userTable.email, String(body.email).trim().toLowerCase()))
          .limit(1);
        if (found) targetUser = found;
      }
    }

    const {
      step = "complete_all",
      name,
      phone,
      trade,
      categoryId,
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
      kycSelfieUrl,
      kycIdDocumentUrl,
      kycIdType = "nin_slip",
    } = parsed.data;
    const serviceKey = body.serviceKey;

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
      phone ||
      targetUser.phone ||
      existingArtisan?.phone ||
      "+234 803 000 0000";
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

    const isKycStep = step === "kyc_submission" || step === "complete_all";
    const effectiveSelfieUrl =
      kycSelfieUrl || existingArtisan?.kycSelfieUrl || null;
    const effectiveIdDocUrl =
      kycIdDocumentUrl || existingArtisan?.kycIdDocumentUrl || null;

    if (
      isKycStep &&
      (!ninNumber ||
        !bankName ||
        !bankAccountNumber ||
        !effectiveSelfieUrl ||
        !effectiveIdDocUrl)
    ) {
      return NextResponse.json(
        {
          error:
            "11-digit NIN, settlement bank name, 10-digit NUBAN account number, live KYC selfie URL (kycSelfieUrl), and government ID document URL (kycIdDocumentUrl) are required for KYC submission.",
          code: "MISSING_KYC_FIELDS",
        },
        { status: 400 }
      );
    }

    // Encrypt NIN with AES-256-GCM & compute HMAC-SHA256 blind index to prevent duplicate NINs across accounts
    let ninPrepared: ReturnType<typeof prepareNinStorage> | null = null;
    if (ninNumber) {
      ninPrepared = prepareNinStorage(ninNumber);
      const duplicateQuery = existingArtisan
        ? and(
            eq(artisans.ninHash, ninPrepared.ninHash),
            ne(artisans.id, existingArtisan.id)
          )
        : eq(artisans.ninHash, ninPrepared.ninHash);

      const [duplicateArtisan] = await db
        .select({ id: artisans.id })
        .from(artisans)
        .where(duplicateQuery)
        .limit(1);

      if (duplicateArtisan) {
        return NextResponse.json(
          {
            error:
              "This 11-digit NIN is already registered to another Skilled4U Artisan account. Duplicate NIN registrations are not permitted.",
            code: "DUPLICATE_NIN",
          },
          { status: 409 }
        );
      }
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
          ninNumber: ninPrepared ? ninPrepared.ninMasked : null,
          ninEncrypted: ninPrepared ? ninPrepared.ninEncrypted : null,
          ninHash: ninPrepared ? ninPrepared.ninHash : null,
          kycSelfieUrl: effectiveSelfieUrl,
          kycIdDocumentUrl: effectiveIdDocUrl,
          kycIdType: isKycStep ? kycIdType : null,
          kycRejectionReason: null,
          bankName: bankName || null,
          bankAccountNumber: bankAccountNumber || null,
          bankAccountName: bankAccountName || resolvedName,
        })
        .returning();

      artisanProfile = created;
    } else {
      // If artisan is re-submitting KYC after a previous rejection, transition kycStatus from "rejected" -> "pending"
      const nextKycStatus =
        isKycStep && artisanProfile.kycStatus === "rejected"
          ? "pending"
          : artisanProfile.kycStatus === "verified"
            ? "verified"
            : "pending";

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
          ...(ninPrepared
            ? {
                ninNumber: ninPrepared.ninMasked,
                ninEncrypted: ninPrepared.ninEncrypted,
                ninHash: ninPrepared.ninHash,
              }
            : {}),
          ...(effectiveSelfieUrl ? { kycSelfieUrl: effectiveSelfieUrl } : {}),
          ...(effectiveIdDocUrl
            ? { kycIdDocumentUrl: effectiveIdDocUrl }
            : {}),
          ...(isKycStep ? { kycIdType, kycRejectionReason: null } : {}),
          ...(bankName ? { bankName: String(bankName).trim() } : {}),
          ...(bankAccountNumber
            ? { bankAccountNumber: String(bankAccountNumber).trim() }
            : {}),
          bankAccountName:
            bankAccountName || artisanProfile.bankAccountName || resolvedName,
          kycStatus: nextKycStatus,
          updatedAt: new Date(),
        })
        .where(eq(artisans.id, artisanProfile.id))
        .returning();

      artisanProfile = updated;
    }

    const isKycSubmitted =
      isKycStep ||
      Boolean(
        (artisanProfile.ninEncrypted || artisanProfile.ninNumber) &&
          artisanProfile.bankAccountNumber
      );

    const nextOnboardingStatus =
      artisanProfile.kycStatus === "verified"
        ? "completed"
        : artisanProfile.kycStatus === "rejected"
          ? "kyc_rejected"
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
    if (isKycStep || !existingArtisan) {
      const emailRes = await sendWelcomeOnboardingEmail({
        to: updatedUser.email,
        name: updatedUser.name,
        role: "artisan",
        city: resolvedCity,
        trade: resolvedTrade,
      });
      welcomeEmailSent = emailRes.success;
    }

    // Never expose raw AES-256-GCM ciphertext or blind-index hash in API responses
    const safeArtisanProfile = {
      ...artisanProfile,
      ninEncrypted: null,
      ninHash: null,
    };

    return NextResponse.json({
      data: {
        user: updatedUser,
        artisanProfile: safeArtisanProfile,
        onboarding: {
          role: "artisan",
          status: nextOnboardingStatus,
          step: nextOnboardingStep,
          kycStatus: artisanProfile.kycStatus,
          kycDocumentsUploaded: Boolean(
            artisanProfile.kycSelfieUrl && artisanProfile.kycIdDocumentUrl
          ),
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
