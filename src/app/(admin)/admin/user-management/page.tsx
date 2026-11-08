import { Suspense } from "react";
import { desc } from "drizzle-orm";
import { ArtisansKycWorkspace } from "@/components/admin/composites/artisans-kyc-workspace";
import { AdminLoadingState } from "@/components/admin/ui/admin-loading-state";
import { db } from "@/db";
import { artisans } from "@/db/schema";

async function UserManagementLoader() {
  const rows = await db.select().from(artisans).orderBy(desc(artisans.rating));
  return <ArtisansKycWorkspace initialArtisans={rows} />;
}

export default function AdminUserManagementPage() {
  return (
    <Suspense
      fallback={
        <AdminLoadingState label="Loading user management & NIN/KYC verification records..." />
      }
    >
      <UserManagementLoader />
    </Suspense>
  );
}

