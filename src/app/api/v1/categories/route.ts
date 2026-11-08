import { NextRequest, NextResponse, connection } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function GET() {
  await connection();
  try {
    const items = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.title));
    return NextResponse.json({ data: items });
  } catch (error) {
    console.error("GET /api/v1/categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, basePrice, subServices, isPopular, isActive } =
      body;

    if (!title) {
      return NextResponse.json(
        { error: "Category title is required" },
        { status: 400 }
      );
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const id = `cat_${slug.slice(0, 18)}_${Date.now().toString().slice(-4)}`;

    const [created] = await db
      .insert(categories)
      .values({
        id,
        title,
        slug,
        description: description || `${title} professional services`,
        basePrice: Number(basePrice) || 12000,
        subServices: Array.isArray(subServices)
          ? subServices
          : typeof subServices === "string"
            ? subServices
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean)
            : [],
        isPopular: Boolean(isPopular),
        isActive: typeof isActive === "boolean" ? isActive : true,
      })
      .returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/categories error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      description,
      basePrice,
      subServices,
      isPopular,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Category id is required" },
        { status: 400 }
      );
    }

    const updateValues: Partial<typeof categories.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (typeof title === "string" && title.trim()) {
      updateValues.title = title.trim();
      updateValues.slug = title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    if (typeof description === "string") {
      updateValues.description = description.trim();
    }
    if (basePrice !== undefined && !Number.isNaN(Number(basePrice))) {
      updateValues.basePrice = Number(basePrice);
    }
    if (Array.isArray(subServices)) {
      updateValues.subServices = subServices;
    } else if (typeof subServices === "string") {
      updateValues.subServices = subServices
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
    if (typeof isPopular === "boolean") {
      updateValues.isPopular = isPopular;
    }
    if (typeof isActive === "boolean") {
      updateValues.isActive = isActive;
    }

    const [updated] = await db
      .update(categories)
      .set(updateValues)
      .where(eq(categories.id, id))
      .returning();

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("PATCH /api/v1/categories error:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
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
        { error: "Category id is required" },
        { status: 400 }
      );
    }
    await db.delete(categories).where(eq(categories.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/v1/categories error:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
