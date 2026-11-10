import { Suspense } from "react";
import { desc } from "drizzle-orm";
import { ArtisansKycWorkspace } from "@/components/admin/composites/artisans-kyc-workspace";
import { AdminLoadingState } from "@/components/admin/ui/admin-loading-state";
import { db } from "@/db";
import { artisans, bookings, user } from "@/db/schema";

async function UserManagementLoader() {
  const [artisanRows, userRows, bookingRows] = await Promise.all([
    db.select().from(artisans).orderBy(desc(artisans.rating)),
    db.select().from(user).orderBy(desc(user.createdAt)),
    db
      .select({
        clientId: bookings.clientId,
        clientEmail: bookings.clientEmail,
      })
      .from(bookings),
  ]);

  const bookingCountsMap: Record<string, number> = {};
  for (const b of bookingRows) {
    if (b.clientId) {
      bookingCountsMap[b.clientId] = (bookingCountsMap[b.clientId] || 0) + 1;
    }
    if (b.clientEmail) {
      const em = b.clientEmail.toLowerCase().trim();
      bookingCountsMap[em] = (bookingCountsMap[em] || 0) + 1;
    }
  }

  return (
    <ArtisansKycWorkspace
      initialArtisans={artisanRows}
      initialUsers={userRows}
      initialBookingCounts={bookingCountsMap}
      defaultTab="customers"
    />
  );
}

export default function AdminUserManagementPage() {
  return (
    <Suspense
      fallback={
        <AdminLoadingState label="Loading customers, artisans & administrator accounts..." />
      }
    >
      <UserManagementLoader />
    </Suspense>
  );
}
