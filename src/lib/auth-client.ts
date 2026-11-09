import { createAuthClient } from "better-auth/react";
import { adminClient, emailOTPClient } from "better-auth/client/plugins";

const resolvedBaseUrl =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: resolvedBaseUrl,
  plugins: [adminClient(), emailOTPClient()],
});

export const { signIn, signUp, signOut, useSession, emailOtp } = authClient;
