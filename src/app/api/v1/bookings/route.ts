import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { normalizeUserRole, requireAuth } from "@/lib/auth-guard";
import { protectMutationApi } from "@/lib/arcjet";
import { db } from "@/db";
import { bookings } from "@/db/schema";

export async function GET(req: NextRequest) {
  try {
    const guard = await requireAuth(req);
    if (!guard.ok) return guard.response;

    const { user } = guard.auth;
    const role = normalizeUserRole(user.role);

    const rows =
      role === "admin"
        ? await db
            .select()
            .from(bookings)
            .orderBy(desc(bookings.createdAt))
        : await db
            .select()
            .from(bookings)
            .where(eq(bookings.clientEmail, user.email))
            .orderBy(desc(bookings.createdAt));

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error("GET /api/v1/bookings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const blocked = await protectMutationApi(req);
    if (blocked) return blocked;

    const guard = await requireAuth(req);
    if (!guard.ok) return guard.response;

    const body = await req.json();
    const {
      clientName,
      clientEmail,
      clientPhone,
      artisanId,
      artisanName,
      categoryId,
      serviceTitle,
      description,
      scheduledDate,
      scheduledTime,
      address,
      agreedAmount,
    } = body;

    const resolvedClientName = clientName || guard.auth.user.name;
    const resolvedClientEmail =
      normalizeUserRole(guard.auth.user.role) === "admin" && clientEmail
        ? clientEmail
        : guard.auth.user.email;

    if (!resolvedClientName || !artisanId || !serviceTitle || !agreedAmount) {
      return NextResponse.json(
        { error: "Missing required booking fields" },
        { status: 400 }
      );
    }

    const id = `bk_${Date.now()}`;
    const bookingCode = `S4U-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const [created] = await db
      .insert(bookings)
      .values({
        id,
        bookingCode,
        clientName: resolvedClientName,
        clientEmail: resolvedClientEmail,
        clientPhone:
          clientPhone || guard.auth.user.phone || "+234 800 000 0000",
        artisanId,
        artisanName: artisanName || "Skilled4U Pro",
        categoryId: categoryId || null,
        serviceTitle,
        description: description || serviceTitle,
        status: "pending",
        scheduledDate: scheduledDate || new Date().toISOString().split("T")[0],
        scheduledTime: scheduledTime || "10:00 AM",
        address: address || guard.auth.user.address || "Abuja (Wuse II)",
        agreedAmount: Number(agreedAmount),
        paymentStatus: "unpaid",
      })
      .returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/bookings error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const blocked = await protectMutationApi(req);
    if (blocked) return blocked;

    const guard = await requireAuth(req);
    if (!guard.ok) return guard.response;

    const body = await req.json();
    const { id, status, paymentStatus } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Booking id is required" },
        { status: 400 }
      );
    }

    const isAdmin = normalizeUserRole(guard.auth.user.role) === "admin";
    const updateData: Partial<typeof bookings.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (status) updateData.status = status;
    // Only Admins may directly mutate paymentStatus on a booking
    if (paymentStatus && isAdmin) {
      updateData.paymentStatus = paymentStatus;
    }

    const [updated] = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, id))
      .returning();

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("PATCH /api/v1/bookings error:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
