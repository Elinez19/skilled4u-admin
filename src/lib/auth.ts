import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, bearer, emailOTP } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
import {
  sendAuthOtpEmail,
  sendPasswordResetEmail,
  sendVerificationLinkEmail,
} from "@/lib/resend";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    async sendResetPassword({ user, url, token }) {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        url,
        token,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: false,
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, url, token }) {
      await sendVerificationLinkEmail({
        to: user.email,
        name: user.name,
        url,
        token,
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // Base max (clamped per role in applyRoleSessionPolicy: 8h Admin, 7d Artisan, 30d Client)
    updateAge: 60 * 5,
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            prompt: "select_account" as const,
          },
        },
      }
    : {}),
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
      },
      onboardingStatus: {
        type: "string",
        defaultValue: "not_started",
      },
      onboardingStep: {
        type: "number",
        defaultValue: 1,
      },
      city: {
        type: "string",
        required: false,
        defaultValue: "Abuja (Wuse II)",
      },
      address: {
        type: "string",
        required: false,
      },
      accountStatus: {
        type: "string",
        defaultValue: "active",
      },
      adminRoleTitle: {
        type: "string",
        required: false,
      },
      adminPermissions: {
        type: "string",
        required: false,
      },
      adminScope: {
        type: "string",
        required: false,
      },
      mustChangePassword: {
        type: "boolean",
        defaultValue: false,
      },
    },
  },
  plugins: [
    admin({
      defaultRole: "client",
      adminRoles: ["admin"],
    }),
    bearer(),
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      sendVerificationOnSignUp: false,
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        await sendAuthOtpEmail({
          to: email,
          otp,
          type,
        });
      },
    }),
    nextCookies(),
  ],
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://localhost:8081",
    "exp://127.0.0.1:8081",
    "https://backend.skilled4u.com",
    "https://skilled4u.com",
    "https://www.skilled4u.com",
    "skilled4u://*",
    "skilled4u-artisan://*",
    "skilled4u-customer://*",
  ],
});

export type Session = typeof auth.$Infer.Session;
