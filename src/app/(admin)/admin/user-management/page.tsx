import { Suspense } from "react";
import { desc } from "drizzle-orm";
import { ArtisansKycWorkspace } from "@/components/admin/composites/artisans-kyc-workspace";
import { AdminLoadingState } from "@/components/admin/ui/admin-loading-state";
import { db } from "@/db";
import { artisans, user } from "@/db/schema";

async function UserManagementLoader() {
  const [artisanRows, userRows] = await Promise.all([
    db.select().from(artisans).orderBy(desc(artisans.rating)),
    db.select().from(user).orderBy(desc(user.createdAt)),
  ]);
  return (
    <ArtisansKycWorkspace
      initialArtisans={artisanRows}
      initialUsers={userRows}
    />
  );
}

export default function AdminUserManagementPage() {
  return (
    <Suspense
      fallback={
        <AdminLoadingState label="Loading customers, artisans & administrator accounts from NeonDB..." />
      }
    >
      <UserManagementLoader />
    </Suspense>
  );
}
