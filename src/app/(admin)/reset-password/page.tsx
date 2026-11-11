import * as React from "react";
import { Suspense } from "react";
import { AdminAuthPortal } from "@/components/admin/composites/admin-auth-portal";

export const metadata = {
  title: "Reset Password | Skilled4U Admin",
  description: "Set a new password for your Skilled4U account.",
};

async function ResetPasswordContent({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string; email?: string }>;
}) {
  const params = await searchParams;
  return (
    <AdminAuthPortal
      initialStep="reset_password"
      initialToken={params?.token}
      initialEmail={params?.email}
    />
  );
}

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string; email?: string }>;
}) {
  return (
    <Suspense fallback={<AdminAuthPortal initialStep="reset_password" />}>
      <ResetPasswordContent searchParams={searchParams} />
    </Suspense>
  );
}
