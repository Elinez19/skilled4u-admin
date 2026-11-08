import { Suspense } from "react";
import { desc } from "drizzle-orm";
import { PaymentsEscrowWorkspace } from "@/components/admin/composites/payments-escrow-workspace";
import { AdminLoadingState } from "@/components/admin/ui/admin-loading-state";
import { db } from "@/db";
import { payments } from "@/db/schema";

async function PaymentsLoader() {
  const rows = await db
    .select()
    .from(payments)
    .orderBy(desc(payments.createdAt));

  return <PaymentsEscrowWorkspace initialPayments={rows} />;
}

export default function AdminPaymentsPage() {
  return (
    <Suspense
      fallback={
        <AdminLoadingState label="Loading Bachs.io escrow ledger & settlements..." />
      }
    >
      <PaymentsLoader />
    </Suspense>
  );
}

