import { Suspense } from "react";
import { desc } from "drizzle-orm";
import { BookingsDispatchWorkspace } from "@/components/admin/composites/bookings-dispatch-workspace";
import { AdminLoadingState } from "@/components/admin/ui/admin-loading-state";
import { db } from "@/db";
import { bookings } from "@/db/schema";

async function BookingsLoader() {
  const rows = await db
    .select()
    .from(bookings)
    .orderBy(desc(bookings.createdAt));

  return <BookingsDispatchWorkspace initialBookings={rows} />;
}

export default function AdminBookingsPage() {
  return (
    <Suspense
      fallback={
        <AdminLoadingState label="Loading service bookings & live dispatch queue..." />
      }
    >
      <BookingsLoader />
    </Suspense>
  );
}

