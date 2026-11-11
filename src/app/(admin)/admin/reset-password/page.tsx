import * as React from "react";
import { Suspense } from "react";
import { redirect } from "next/navigation";

async function AdminResetPasswordRedirector({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string; email?: string }>;
}): Promise<React.ReactNode> {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params?.token) query.set("token", params.token);
  if (params?.email) query.set("email", params.email);
  const qs = query.toString();
  redirect(qs ? `/reset-password?${qs}` : "/reset-password");
  return null;
}

export default function AdminResetPasswordRedirectPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string; email?: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <AdminResetPasswordRedirector searchParams={searchParams} />
    </Suspense>
  );
}
