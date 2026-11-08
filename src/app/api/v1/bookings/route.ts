import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  await connection();
  try {
    const rows = await db
      .select()
      .from(bookings)
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

    if (!clientName || !artisanId || !serviceTitle || !agreedAmount) {
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
        clientName,
        clientEmail: clientEmail || "client@skilled4u.ng",
        clientPhone: clientPhone || "+234 800 000 0000",
        artisanId,
        artisanName: artisanName || "Skilled4U Pro",
        categoryId: categoryId || null,
        serviceTitle,
        description: description || serviceTitle,
        status: "pending",
        scheduledDate: scheduledDate || new Date().toISOString().split("T")[0],
        scheduledTime: scheduledTime || "10:00 AM",
        address: address || "Lekki Phase 1, Lagos",
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
    const body = await req.json();
    const { id, status, paymentStatus } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Booking id is required" },
        { status: 400 }
      );
    }

    const updateData: Partial<typeof bookings.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

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

