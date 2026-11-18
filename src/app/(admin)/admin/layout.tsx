import * as React from "react";
import { Suspense } from "react";
import { AdminLoadingState } from "@/components/admin/ui/admin-loading-state";
import { AdminShell } from "@/components/admin/ui/admin-navigation";
import { requireAdminPage } from "@/lib/auth-guard";

export const instant = false;
export const prefetch = "force-disabled";

async function AdminAuthGate({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return <AdminShell>{children}</AdminShell>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface-pearl p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <AdminLoadingState label="Verifying administrator session..." />
          </div>
        </div>
      }
    >
      <AdminAuthGate>{children}</AdminAuthGate>
    </Suspense>
  );
}
