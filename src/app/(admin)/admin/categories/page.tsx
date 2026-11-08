import { Suspense } from "react";
import { asc } from "drizzle-orm";
import { CategoriesTaxonomyWorkspace } from "@/components/admin/composites/categories-taxonomy-workspace";
import { AdminLoadingState } from "@/components/admin/ui/admin-loading-state";
import { db } from "@/db";
import { categories } from "@/db/schema";

async function CategoriesLoader() {
  const rows = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.title));

  return <CategoriesTaxonomyWorkspace initialCategories={rows} />;
}

export default function AdminCategoriesPage() {
  return (
    <Suspense
      fallback={
        <AdminLoadingState label="Loading marketplace service categories..." />
      }
    >
      <CategoriesLoader />
    </Suspense>
  );
}

