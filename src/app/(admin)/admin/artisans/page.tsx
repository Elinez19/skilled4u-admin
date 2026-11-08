import { Suspense } from "react";
import { db } from "@/db";
import { artisans } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ArtisansManager } from "@/components/admin/artisans-manager";

async function ArtisansContent() {
  const rows = await db.select().from(artisans).orderBy(desc(artisans.rating));

  return <ArtisansManager initialArtisans={rows} />;
}

export default function AdminArtisansPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
          Artisans &amp; KYC Verification
        </h1>
        <p className="text-sm text-zinc-500">
          Review artisan credentials, NIN records, and Bachs.io settlement bank
          accounts.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-sm text-zinc-500">
            Loading artisans &amp; KYC records...
          </div>
        }
      >
        <ArtisansContent />
      </Suspense>
    </div>
  );
}

