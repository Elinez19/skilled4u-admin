import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { artisans } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kycStatus = searchParams.get("kycStatus");

    const rows = kycStatus
      ? await db
          .select()
          .from(artisans)
          .where(eq(artisans.kycStatus, kycStatus))
          .orderBy(desc(artisans.rating))
      : await db.select().from(artisans).orderBy(desc(artisans.rating));

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error("GET /api/v1/artisans error:", error);
    return NextResponse.json(
      { error: "Failed to fetch artisans" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, kycStatus, isOnline } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Artisan id is required" },
        { status: 400 }
      );
    }

    const updateValues: Partial<typeof artisans.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (typeof kycStatus === "string") {
      updateValues.kycStatus = kycStatus;
    }
    if (typeof isOnline === "boolean") {
      updateValues.isOnline = isOnline;
    }

    const [updated] = await db
      .update(artisans)
      .set(updateValues)
      .where(eq(artisans.id, id))
      .returning();

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("PATCH /api/v1/artisans error:", error);
    return NextResponse.json(
      { error: "Failed to update artisan" },
      { status: 500 }
    );
  }
}

