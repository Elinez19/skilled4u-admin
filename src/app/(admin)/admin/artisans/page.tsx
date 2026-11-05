import { db } from "@/db";
import { artisans } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ArtisansManager } from "@/components/admin/artisans-manager";

export const dynamic = "force-dynamic";

export default async function AdminArtisansPage() {
  const rows = await db.select().from(artisans).orderBy(desc(artisans.rating));

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

      <ArtisansManager initialArtisans={rows} />
    </div>
  );
}

