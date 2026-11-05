import { db } from "@/db";
import { bookings } from "@/db/schema";
import { desc } from "drizzle-orm";
import { BookingsManager } from "@/components/admin/bookings-manager";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const rows = await db
    .select()
    .from(bookings)
    .orderBy(desc(bookings.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
          Bookings &amp; Dispatch Management
        </h1>
        <p className="text-sm text-zinc-500">
          Track client requests, artisan dispatch progress, and job completion
          confirmations.
        </p>
      </div>

      <BookingsManager initialBookings={rows} />
    </div>
  );
}

