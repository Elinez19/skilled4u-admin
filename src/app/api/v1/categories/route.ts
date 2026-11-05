import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
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
    const { title, description, basePrice, subServices, isPopular } = body;

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
        isActive: true,
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

