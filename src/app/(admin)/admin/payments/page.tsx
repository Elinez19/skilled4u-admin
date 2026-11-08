import { Suspense } from "react";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { desc } from "drizzle-orm";
import { PaymentsManager } from "@/components/admin/payments-manager";

async function PaymentsContent() {
  const rows = await db
    .select()
    .from(payments)
    .orderBy(desc(payments.createdAt));

  return <PaymentsManager initialPayments={rows} />;
}

export default function AdminPaymentsPage() {
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

      <Suspense
        fallback={
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-sm text-zinc-500">
            Loading Bachs.io escrow ledger...
          </div>
        }
      >
        <PaymentsContent />
      </Suspense>
    </div>
  );
}

