import { Suspense } from "react";
import { desc } from "drizzle-orm";
import { OverviewDashboard } from "@/components/admin/composites/overview-dashboard";
import { AdminLoadingState } from "@/components/admin/ui/admin-loading-state";
import { db } from "@/db";
import { artisans, bookings, categories, payments } from "@/db/schema";

async function OverviewLoader() {
  const [allArtisans, allBookings, allPayments, allCategories] =
    await Promise.all([
      db.select().from(artisans).orderBy(desc(artisans.createdAt)),
      db.select().from(bookings).orderBy(desc(bookings.createdAt)),
      db.select().from(payments).orderBy(desc(payments.createdAt)),
      db.select().from(categories),
    ]);

  return (
    <OverviewDashboard
      artisans={allArtisans}
      bookings={allBookings}
      payments={allPayments}
      categories={allCategories}
    />
  );
}

export default function AdminOverviewPage() {
  return (
    <Suspense
      fallback={
        <AdminLoadingState label="Loading marketplace overview, bookings & user activity..." />
      }
    >
      <OverviewLoader />
    </Suspense>
  );
}

