import { db } from "@/db";
import { payments } from "@/db/schema";
import { desc } from "drizzle-orm";
import { PaymentsManager } from "@/components/admin/payments-manager";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const rows = await db
    .select()
    .from(payments)
    .orderBy(desc(payments.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
          Bachs.io Payments &amp; Escrow Ledger
        </h1>
        <p className="text-sm text-zinc-500">
          Monitor multi-currency checkout deposits, webhook events, and instant
          artisan bank settlements.
        </p>
      </div>

      <PaymentsManager initialPayments={rows} />
    </div>
  );
}

