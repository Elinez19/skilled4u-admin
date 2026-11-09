import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { normalizeUserRole, requireAuth } from "@/lib/auth-guard";
import { protectMutationApi } from "@/lib/arcjet";
import { customerOnboardingSchema } from "@/lib/validators/auth";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { sendWelcomeOnboardingEmail } from "@/lib/resend";

/**
 * POST /api/v1/auth/onboarding/customer
 * Completes Customer Mobile App onboarding (Step 3: Phone, Dispatch City & Neighborhood Address).
 * Strictly requires an active authenticated session (Bearer Token or Session Cookie) to prevent IDOR.
 */
export async function POST(req: NextRequest) {
  try {
    const blocked = await protectMutationApi(req);
    if (blocked) return blocked;

    const guard = await requireAuth(req, ["client", "admin"]);
    if (!guard.ok) {
      return guard.response;
    }

    const body = await req.json().catch(() => ({}));
    const caller = guard.auth.user;
    const isAdmin = normalizeUserRole(caller.role) === "admin";

    // Only an Admin may specify another user's ID/email; regular users can only onboard their own account
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

    const parsed = customerOnboardingSchema.safeParse({
      name: body.name || targetUser.name,
      phone: body.phone || targetUser.phone || "+234 803 000 0000",
      city: body.city || targetUser.city || "Abuja (Wuse II)",
      address: body.address || targetUser.address,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Valid phone number and city are required",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const {
      name: resolvedName,
      phone: resolvedPhone,
      city: resolvedCity,
      address,
    } = parsed.data;
    const resolvedAddress = address || targetUser.address || resolvedCity;

    const [updatedUser] = await db
      .update(userTable)
      .set({
        name: resolvedName || targetUser.name,
        phone: resolvedPhone,
        city: resolvedCity,
        address: resolvedAddress,
        role: "client",
        onboardingStatus: "completed",
        onboardingStep: 3,
        accountStatus: "active",
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, targetUser.id))
      .returning();

    const emailResult = await sendWelcomeOnboardingEmail({
      to: updatedUser.email,
      name: updatedUser.name,
      role: "client",
      city: resolvedCity,
    });

    return NextResponse.json({
      data: {
        user: updatedUser,
        onboarding: {
          role: "client",
          status: "completed",
          step: 3,
          readyToBook: true,
        },
        welcomeEmailSent: emailResult.success,
      },
    });
  } catch (error) {
    console.error("POST /api/v1/auth/onboarding/customer error:", error);
    return NextResponse.json(
      { error: "Failed to complete customer onboarding" },
      { status: 500 }
    );
  }
}
