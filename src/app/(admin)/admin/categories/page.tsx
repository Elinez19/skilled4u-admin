import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc } from "drizzle-orm";
import { CategoriesManager } from "@/components/admin/categories-manager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const rows = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.title));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
          Service Categories &amp; Taxonomy
        </h1>
        <p className="text-sm text-zinc-500">
          Manage the service categories, sub-services, and base pricing synced
          with the skilled4U mobile app.
        </p>
      </div>

      <CategoriesManager initialCategories={rows} />
    </div>
  );
}

