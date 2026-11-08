import { Suspense } from "react";
import { desc } from "drizzle-orm";
import { ArtisansKycWorkspace } from "@/components/admin/composites/artisans-kyc-workspace";
import { AdminLoadingState } from "@/components/admin/ui/admin-loading-state";
import { db } from "@/db";
import { artisans } from "@/db/schema";

async function ArtisansLoader() {
  const rows = await db.select().from(artisans).orderBy(desc(artisans.rating));
  return <ArtisansKycWorkspace initialArtisans={rows} />;
}

export default function AdminArtisansPage() {
  return (
    <Suspense
      fallback={
        <AdminLoadingState label="Loading artisans & NIN/KYC verification records..." />
      }
    >
      <ArtisansLoader />
    </Suspense>
  );
}

