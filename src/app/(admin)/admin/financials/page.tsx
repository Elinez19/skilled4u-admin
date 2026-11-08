import { Suspense } from "react";
import { desc } from "drizzle-orm";
import { PaymentsEscrowWorkspace } from "@/components/admin/composites/payments-escrow-workspace";
import { AdminLoadingState } from "@/components/admin/ui/admin-loading-state";
import { db } from "@/db";
import { payments } from "@/db/schema";

async function FinancialsLoader() {
  const rows = await db
    .select()
    .from(payments)
    .orderBy(desc(payments.createdAt));

  return <PaymentsEscrowWorkspace initialPayments={rows} />;
}

export default function AdminFinancialsPage() {
  return (
    <Suspense
      fallback={
        <AdminLoadingState label="Loading Bachs.io financials & escrow settlements..." />
      }
    >
      <FinancialsLoader />
    </Suspense>
  );
}

