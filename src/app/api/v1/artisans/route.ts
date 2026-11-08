import { NextRequest, NextResponse, connection } from "next/server";
import { db } from "@/db";
import { artisans } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  await connection();
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
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
    const rateNum = Number(hourlyRateNumeric) || 15000;
    const formattedRate =
      typeof hourlyRate === "string" && hourlyRate.trim()
        ? hourlyRate.trim()
        : `₦${rateNum.toLocaleString()}`;

    const [created] = await db
      .insert(artisans)
      .values({
        id,
        name,
        email: email || `${slug}@skilled4u.ng`,
        phone: phone || "+234 803 000 0000",
        trade,
        serviceKey: trade.toLowerCase().split(" ")[0] || "general",
        profileImage: "/images/landing/hero-artisan.png",
        hourlyRate: formattedRate,
        hourlyRateNumeric: rateNum,
        about: `Verified ${trade} specialist serving ${city || "Abuja & Lagos"}.`,
        skills: [trade, "Diagnostics & Repair", "Safety Certified"],
        portfolioImages: ["/images/landing/hero-artisan.png"],
        rating: 5.0,
        reviewsCount: 1,
        completedJobs: 1,
        distance: "1.8 km",
        city: city || "Abuja",
        address: city || "Wuse II, Abuja",
        isOnline: typeof isOnline === "boolean" ? isOnline : true,
        kycStatus: kycStatus || "pending",
        ninNumber: ninNumber || "48192038471",
        bankName: bankName || "Access Bank",
        bankAccountNumber: bankAccountNumber || "0148291042",
        bankAccountName: name,
      })
      .returning();

    return NextResponse.json({ data: created }, { status: 201 });
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
    const body = await req.json();
    const {
      id,
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
      isOnline,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Artisan id is required" },
        { status: 400 }
      );
    }

    const updateValues: Partial<typeof artisans.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (typeof name === "string" && name.trim()) updateValues.name = name.trim();
    if (typeof email === "string" && email.trim()) updateValues.email = email.trim();
    if (typeof phone === "string" && phone.trim()) updateValues.phone = phone.trim();
    if (typeof trade === "string" && trade.trim()) updateValues.trade = trade.trim();
    if (typeof city === "string" && city.trim()) updateValues.city = city.trim();
    if (typeof hourlyRate === "string" && hourlyRate.trim()) {
      updateValues.hourlyRate = hourlyRate.trim();
    }
    if (typeof hourlyRateNumeric === "number" && !Number.isNaN(hourlyRateNumeric)) {
      updateValues.hourlyRateNumeric = hourlyRateNumeric;
    }
    if (typeof ninNumber === "string") updateValues.ninNumber = ninNumber.trim();
    if (typeof bankName === "string") updateValues.bankName = bankName.trim();
    if (typeof bankAccountNumber === "string") {
      updateValues.bankAccountNumber = bankAccountNumber.trim();
    }
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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Artisan id is required" },
        { status: 400 }
      );
    }
    await db.delete(artisans).where(eq(artisans.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/v1/artisans error:", error);
    return NextResponse.json(
      { error: "Failed to delete artisan" },
      { status: 500 }
    );
  }
}
