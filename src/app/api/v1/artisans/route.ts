import { NextRequest, NextResponse, connection } from "next/server";
import { desc, eq, inArray, or } from "drizzle-orm";
import { auth } from "@/lib/auth";
import {
  canAdminReviewKyc,
  normalizeUserRole,
  requireAdmin,
  resolveAuthSession,
} from "@/lib/auth-guard";
import { decryptNin, maskNin, prepareNinStorage } from "@/lib/kyc-crypto";
import { protectMutationApi } from "@/lib/arcjet";
import { db } from "@/db";
import {
  artisans,
  session as sessionTable,
  user as userTable,
} from "@/db/schema";
import {
  sendArtisanKycStatusEmail,
  sendWelcomeOnboardingEmail,
} from "@/lib/resend";

export async function GET(req: NextRequest) {
  try {
    await connection();
  } catch {
    // Direct invocation outside Next.js request store
  }
  try {
    const authCtx = await resolveAuthSession(req);
    const callerRole = authCtx ? normalizeUserRole(authCtx.user.role) : null;
    const isAdmin = callerRole === "admin";
    const canViewDecryptedKyc = Boolean(
      authCtx && isAdmin && canAdminReviewKyc(authCtx.user)
    );

    const { searchParams } = new URL(req.url);
    const kycStatus = searchParams.get("kycStatus");

    const rows = kycStatus
      ? await db
          .select()
          .from(artisans)
          .where(eq(artisans.kycStatus, kycStatus))
          .orderBy(desc(artisans.rating))
      : await db.select().from(artisans).orderBy(desc(artisans.rating));

    // SECURITY & GRANULAR RBAC:
    // - Super Admins & KYC Moderators receive in-memory decrypted NIN (`ninNumber`) + `ninMasked` + KYC Selfie/ID URLs
    // - Dispatch Support Admins & the Artisan themselves receive only `ninMasked` ("*******4519")
    // - Public/Customer callers have all KYC & NUBAN fields strictly redacted (`null`)
    const sanitized = rows.map((row) => {
      const isSelf = Boolean(
        authCtx &&
          (row.userId === authCtx.user.id || row.email === authCtx.user.email)
      );

      if (canViewDecryptedKyc) {
        const plainNin =
          decryptNin(row.ninEncrypted) ||
          decryptNin(row.ninNumber) ||
          row.ninNumber;
        return {
          ...row,
          ninNumber: plainNin,
          ninMasked: maskNin(plainNin || row.ninNumber),
          ninEncrypted: null,
          ninHash: null,
        };
      }

      if (isAdmin || isSelf) {
        const masked = maskNin(row.ninNumber || decryptNin(row.ninEncrypted));
        return {
          ...row,
          ninNumber: masked,
          ninMasked: masked,
          ninEncrypted: null,
          ninHash: null,
        };
      }

      return {
        ...row,
        ninNumber: null,
        ninMasked: null,
        ninEncrypted: null,
        ninHash: null,
        kycSelfieUrl: null,
        kycIdDocumentUrl: null,
        bankAccountNumber: null,
        bankAccountName: null,
      };
    });

    return NextResponse.json({ data: sanitized });
  } catch (error) {
    console.error("GET /api/v1/artisans error:", error);
    return NextResponse.json(
      { error: "Failed to fetch artisans" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const blocked = await protectMutationApi(req);
    if (blocked) return blocked;

    const adminGuard = await requireAdmin(req, [
      "super_admin",
      "kyc_moderator",
    ]);
    if (!adminGuard.ok) return adminGuard.response;

    const body = await req.json();
    const {
      name,
      email,
      password,
      phone,
      trade,
      city,
      hourlyRate,
      hourlyRateNumeric,
      ninNumber,
      bankName,
      bankAccountNumber,
      kycSelfieUrl,
      kycIdDocumentUrl,
      kycIdType,
      kycStatus,
      isOnline,
    } = body;

    if (!name || !trade) {
      return NextResponse.json(
        { error: "Artisan name and trade are required" },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const id = `${slug || "art"}-${Date.now().toString().slice(-4)}`;
    const resolvedEmail = (email || `${slug}@skilled4u.ng`).trim().toLowerCase();
    const resolvedPhone = phone || "+234 803 000 0000";
    const resolvedCity = city || "Abuja";
    const resolvedKyc = kycStatus || "pending";
    const resolvedPassword = password || "Artisan@2026";
    const rateNum = Number(hourlyRateNumeric) || 15000;
    const formattedRate =
      typeof hourlyRate === "string" && hourlyRate.trim()
        ? hourlyRate.trim()
        : `₦${rateNum.toLocaleString()}`;

    const rawNin = ninNumber || "48192038471";
    const ninPrepared = prepareNinStorage(rawNin);

    // Ensure a corresponding `user` AND `account` credential record exist via Better Auth
    let linkedUserId: string | null = null;
    const [existingUser] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, resolvedEmail))
      .limit(1);

    if (existingUser) {
      linkedUserId = existingUser.id;
      await db
        .update(userTable)
        .set({
          role: "artisan",
          phone: resolvedPhone,
          city: resolvedCity,
          onboardingStatus:
            resolvedKyc === "verified" ? "completed" : "pending_kyc",
          onboardingStep: resolvedKyc === "verified" ? 5 : 4,
          accountStatus: resolvedKyc === "verified" ? "verified" : "pending",
          updatedAt: new Date(),
        })
        .where(eq(userTable.id, existingUser.id));
    } else {
      const signUpRes = await auth.api.signUpEmail({
        body: {
          name: String(name).trim(),
          email: resolvedEmail,
          password: resolvedPassword,
          phone: resolvedPhone,
          city: resolvedCity,
          address: resolvedCity,
          onboardingStatus:
            resolvedKyc === "verified" ? "completed" : "pending_kyc",
          onboardingStep: resolvedKyc === "verified" ? 5 : 4,
          accountStatus: resolvedKyc === "verified" ? "verified" : "pending",
        },
      });

      linkedUserId = signUpRes.user.id;

      if (signUpRes.token) {
        const baseTok = signUpRes.token.includes(".")
          ? signUpRes.token.split(".")[0]
          : signUpRes.token;
        await db.delete(sessionTable).where(eq(sessionTable.token, baseTok));
      }

      await db
        .update(userTable)
        .set({
          role: "artisan",
          emailVerified: true,
          phone: resolvedPhone,
          city: resolvedCity,
          address: resolvedCity,
          onboardingStatus:
            resolvedKyc === "verified" ? "completed" : "pending_kyc",
          onboardingStep: resolvedKyc === "verified" ? 5 : 4,
          accountStatus: resolvedKyc === "verified" ? "verified" : "pending",
          updatedAt: new Date(),
        })
        .where(eq(userTable.id, linkedUserId));
    }

    const [created] = await db
      .insert(artisans)
      .values({
        id,
        userId: linkedUserId,
        name: String(name).trim(),
        email: resolvedEmail,
        phone: resolvedPhone,
        trade,
        serviceKey: trade.toLowerCase().split(" ")[0] || "general",
        profileImage: "/images/landing/hero-artisan.png",
        hourlyRate: formattedRate,
        hourlyRateNumeric: rateNum,
        about: `Verified ${trade} specialist serving ${resolvedCity}.`,
        skills: [trade, "Diagnostics & Repair", "Safety Certified"],
        portfolioImages: ["/images/landing/hero-artisan.png"],
        rating: 5.0,
        reviewsCount: 1,
        completedJobs: 1,
        distance: "1.8 km",
        city: resolvedCity,
        address: resolvedCity,
        isOnline: typeof isOnline === "boolean" ? isOnline : true,
        kycStatus: resolvedKyc,
        ninNumber: ninPrepared.ninMasked,
        ninEncrypted: ninPrepared.ninEncrypted,
        ninHash: ninPrepared.ninHash,
        kycSelfieUrl: kycSelfieUrl || null,
        kycIdDocumentUrl: kycIdDocumentUrl || null,
        kycIdType: kycIdType || "nin_slip",
        bankName: bankName || "Access Bank",
        bankAccountNumber: bankAccountNumber || "0148291042",
        bankAccountName: String(name).trim(),
      })
      .returning();

    await sendWelcomeOnboardingEmail({
      to: resolvedEmail,
      name: String(name).trim(),
      role: "artisan",
      city: resolvedCity,
      trade,
    });

    return NextResponse.json(
      { data: { ...created, ninEncrypted: null, ninHash: null } },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/v1/artisans error:", error);
    return NextResponse.json(
      { error: "Failed to create artisan" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const blocked = await protectMutationApi(req);
    if (blocked) return blocked;

    const body = await req.json();
    const {
      id,
      ids,
      name,
      email,
      phone,
      trade,
      city,
      hourlyRate,
      hourlyRateNumeric,
      ninNumber,
      bankName,
      bankAccountNumber,
      kycStatus,
      kycRejectionReason,
      note,
      isOnline,
    } = body;

    // Granular RBAC: Approving/rejecting KYC or modifying NIN/NUBAN requires `super_admin` or `kyc_moderator`
    const isKycMutation =
      kycStatus !== undefined ||
      ninNumber !== undefined ||
      bankAccountNumber !== undefined ||
      kycRejectionReason !== undefined;

    const adminGuard = await requireAdmin(
      req,
      isKycMutation ? ["super_admin", "kyc_moderator"] : undefined
    );
    if (!adminGuard.ok) return adminGuard.response;

    const targetIds: string[] = Array.isArray(ids)
      ? ids.map(String)
      : id
        ? [String(id)]
        : [];

    if (targetIds.length === 0) {
      return NextResponse.json(
        { error: "Artisan id or ids array is required" },
        { status: 400 }
      );
    }

    const previousRows = await db
      .select()
      .from(artisans)
      .where(
        targetIds.length === 1
          ? eq(artisans.id, targetIds[0])
          : inArray(artisans.id, targetIds)
      );

    const updateValues: Partial<typeof artisans.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (typeof name === "string" && name.trim()) updateValues.name = name.trim();
    if (typeof email === "string" && email.trim()) {
      updateValues.email = email.trim().toLowerCase();
    }
    if (typeof phone === "string" && phone.trim()) updateValues.phone = phone.trim();
    if (typeof trade === "string" && trade.trim()) updateValues.trade = trade.trim();
    if (typeof city === "string" && city.trim()) updateValues.city = city.trim();
    if (typeof hourlyRate === "string" && hourlyRate.trim()) {
      updateValues.hourlyRate = hourlyRate.trim();
    }
    if (typeof hourlyRateNumeric === "number" && !Number.isNaN(hourlyRateNumeric)) {
      updateValues.hourlyRateNumeric = hourlyRateNumeric;
    }
    if (typeof ninNumber === "string" && ninNumber.trim()) {
      const prepared = prepareNinStorage(ninNumber.trim());
      updateValues.ninNumber = prepared.ninMasked;
      updateValues.ninEncrypted = prepared.ninEncrypted;
      updateValues.ninHash = prepared.ninHash;
    }
    if (typeof bankName === "string") updateValues.bankName = bankName.trim();
    if (typeof bankAccountNumber === "string") {
      updateValues.bankAccountNumber = bankAccountNumber.trim();
    }
    if (typeof kycStatus === "string") {
      updateValues.kycStatus = kycStatus;
      if (kycStatus === "rejected") {
        const resolvedReason =
          (typeof kycRejectionReason === "string" && kycRejectionReason.trim()) ||
          (typeof note === "string" && note.trim()) ||
          "Your submitted NIN or ID document could not be verified. Please re-upload a clear live selfie and valid government ID.";
        updateValues.kycRejectionReason = resolvedReason;
        updateValues.isOnline = false;
      } else if (kycStatus === "verified") {
        updateValues.kycRejectionReason = null;
      }
    }
    if (typeof isOnline === "boolean" && kycStatus !== "rejected") {
      updateValues.isOnline = isOnline;
    }

    const updatedRows = await db
      .update(artisans)
      .set(updateValues)
      .where(
        targetIds.length === 1
          ? eq(artisans.id, targetIds[0])
          : inArray(artisans.id, targetIds)
      )
      .returning();

    for (const updated of updatedRows) {
      const previous = previousRows.find((r) => r.id === updated.id);
      const [linkedUser] = await db
        .select()
        .from(userTable)
        .where(
          updated.userId
            ? or(
                eq(userTable.id, updated.userId),
                eq(userTable.email, updated.email)
              )
            : eq(userTable.email, updated.email)
        )
        .limit(1);

      if (linkedUser) {
        const isKycVerified = updated.kycStatus === "verified";
        const isKycRejected = updated.kycStatus === "rejected";
        await db
          .update(userTable)
          .set({
            name: updated.name,
            phone: updated.phone,
            city: updated.city,
            onboardingStatus: isKycVerified
              ? "completed"
              : isKycRejected
                ? "kyc_rejected"
                : "pending_kyc",
            onboardingStep: isKycVerified ? 5 : 4,
            accountStatus: isKycVerified ? "verified" : "pending",
            updatedAt: new Date(),
          })
          .where(eq(userTable.id, linkedUser.id));
      }

      if (
        typeof kycStatus === "string" &&
        previous &&
        previous.kycStatus !== kycStatus
      ) {
        await sendArtisanKycStatusEmail({
          to: updated.email,
          name: updated.name,
          trade: updated.trade,
          kycStatus: updated.kycStatus as "verified" | "pending" | "rejected",
          note: updated.kycRejectionReason || undefined,
        });
      }
    }

    const sanitizedUpdated = updatedRows.map((r) => ({
      ...r,
      ninEncrypted: null,
      ninHash: null,
    }));

    return NextResponse.json({
      data:
        targetIds.length === 1 ? sanitizedUpdated[0] : sanitizedUpdated,
    });
  } catch (error) {
    console.error("PATCH /api/v1/artisans error:", error);
    return NextResponse.json(
      { error: "Failed to update artisan" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const blocked = await protectMutationApi(req);
    if (blocked) return blocked;

    const adminGuard = await requireAdmin(req, ["super_admin"]);
    if (!adminGuard.ok) return adminGuard.response;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const idsParam = searchParams.get("ids");
    const targetIds = idsParam
      ? idsParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : id
        ? [id]
        : [];

    if (targetIds.length === 0) {
      return NextResponse.json(
        { error: "Artisan id or ids is required" },
        { status: 400 }
      );
    }

    await db
      .delete(artisans)
      .where(
        targetIds.length === 1
          ? eq(artisans.id, targetIds[0])
          : inArray(artisans.id, targetIds)
      );
    return NextResponse.json({ success: true, deletedCount: targetIds.length });
  } catch (error) {
    console.error("DELETE /api/v1/artisans error:", error);
    return NextResponse.json(
      { error: "Failed to delete artisan" },
      { status: 500 }
    );
  }
}
