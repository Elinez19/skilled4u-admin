import { NextRequest, NextResponse, connection } from "next/server";
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
      status,
      paymentStatus,
    } = body;

    if (!clientName || !serviceTitle || !agreedAmount) {
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
        artisanId: artisanId || "emeka-okafor",
        artisanName: artisanName || "Skilled4U Pro",
        categoryId: categoryId || null,
        serviceTitle,
        description: description || serviceTitle,
        status: status || "pending",
        scheduledDate: scheduledDate || new Date().toISOString().split("T")[0],
        scheduledTime: scheduledTime || "10:00 AM",
        address: address || "Lekki Phase 1, Lagos",
        agreedAmount: Number(agreedAmount),
        paymentStatus: paymentStatus || "unpaid",
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
    const {
      id,
      clientName,
      clientEmail,
      clientPhone,
      artisanName,
      serviceTitle,
      description,
      scheduledDate,
      scheduledTime,
      address,
      agreedAmount,
      status,
      paymentStatus,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Booking id is required" },
        { status: 400 }
      );
    }

    const updateData: Partial<typeof bookings.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (typeof clientName === "string" && clientName.trim()) {
      updateData.clientName = clientName.trim();
    }
    if (typeof clientEmail === "string" && clientEmail.trim()) {
      updateData.clientEmail = clientEmail.trim();
    }
    if (typeof clientPhone === "string" && clientPhone.trim()) {
      updateData.clientPhone = clientPhone.trim();
    }
    if (typeof artisanName === "string" && artisanName.trim()) {
      updateData.artisanName = artisanName.trim();
    }
    if (typeof serviceTitle === "string" && serviceTitle.trim()) {
      updateData.serviceTitle = serviceTitle.trim();
    }
    if (typeof description === "string" && description.trim()) {
      updateData.description = description.trim();
    }
    if (typeof scheduledDate === "string" && scheduledDate.trim()) {
      updateData.scheduledDate = scheduledDate.trim();
    }
    if (typeof scheduledTime === "string" && scheduledTime.trim()) {
      updateData.scheduledTime = scheduledTime.trim();
    }
    if (typeof address === "string" && address.trim()) {
      updateData.address = address.trim();
    }
    if (agreedAmount !== undefined && !Number.isNaN(Number(agreedAmount))) {
      updateData.agreedAmount = Number(agreedAmount);
    }
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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Booking id is required" },
        { status: 400 }
      );
    }
    await db.delete(bookings).where(eq(bookings.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/v1/bookings error:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
