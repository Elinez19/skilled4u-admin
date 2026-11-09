import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { db } from "./index";
import { categories, artisans, user as userTable } from "./schema";
import { auth } from "../lib/auth";
import { decryptNin, prepareNinStorage } from "../lib/kyc-crypto";

async function ensureAuthUser({
  name,
  email,
  password,
  phone,
  role,
  city,
  onboardingStatus,
  onboardingStep,
  accountStatus,
  adminRoleTitle,
  adminPermissions,
}: {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "admin" | "client" | "artisan";
  city: string;
  onboardingStatus: string;
  onboardingStep: number;
  accountStatus: string;
  adminRoleTitle?: string;
  adminPermissions?: string;
}): Promise<string> {
  const normalizedEmail = email.trim().toLowerCase();
  const [existing] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, normalizedEmail))
    .limit(1);

  if (existing) {
    await db
      .update(userTable)
      .set({
        name,
        phone,
        role,
        city,
        address: city,
        emailVerified: true,
        onboardingStatus,
        onboardingStep,
        accountStatus,
        adminRoleTitle: adminRoleTitle || null,
        adminPermissions: adminPermissions || null,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, existing.id));
    return existing.id;
  }

  const signUpRes = await auth.api.signUpEmail({
    body: {
      name,
      email: normalizedEmail,
      password,
      phone,
      city,
      address: city,
      onboardingStatus,
      onboardingStep,
      accountStatus,
      adminRoleTitle,
      adminPermissions,
    },
  });

  const userId = signUpRes.user.id;
  await db
    .update(userTable)
    .set({
      role,
      phone,
      city,
      address: city,
      emailVerified: true,
      onboardingStatus,
      onboardingStep,
      accountStatus,
      adminRoleTitle: adminRoleTitle || null,
      adminPermissions: adminPermissions || null,
      updatedAt: new Date(),
    })
    .where(eq(userTable.id, userId));

  return userId;
}

async function seed() {
  console.log("Seeding Neon PostgreSQL database for Skilled4U (Users, Admins, Customers & Artisans)...");

  // 1. Seed Categories
  await db
    .insert(categories)
    .values([
      {
        id: "cat_ac_refrig",
        title: "A.C / Refrigeration Services",
        slug: "ac-refrigeration",
        iconName: "air-conditioner",
        iconFamily: "MaterialCommunityIcons",
        description:
          "Complete split-unit A.C installation, gas refilling, freezer and cold room servicing.",
        subServices: [
          "A.C Gas Filling / Servicing",
          "A.C Repair or Installation",
          "Refrigerator Repair",
          "Freezer Repair",
          "Water Dispenser",
          "Cold Room Servicing",
        ],
        basePrice: 14000,
        isPopular: true,
        isActive: true,
      },
      {
        id: "cat_carpentry",
        title: "Carpentry / Interior Services",
        slug: "carpentry-interior",
        iconName: "hammer-wrench",
        iconFamily: "MaterialCommunityIcons",
        description:
          "Custom cabinetry, doors, roofing, wood flooring, TV mounting, and home fittings.",
        subServices: [
          "Windows and Doors",
          "Cabinetry",
          "Furniture",
          "Roofing",
          "Window Blinds Install / Repair",
          "TV Mounting / Install",
        ],
        basePrice: 20000,
        isPopular: true,
        isActive: true,
      },
      {
        id: "cat_plumbing",
        title: "Plumbing Services",
        slug: "plumbing-services",
        iconName: "pipe-leak",
        iconFamily: "MaterialCommunityIcons",
        description:
          "Emergency leak repair, pipe installation, pumping machine, toilet repairs, and water treatment.",
        subServices: [
          "Plumbing Repair/Install",
          "Drain / Leaks Fixing",
          "Pumping Machine",
          "Toilet Repairs",
          "Water Treatment / Tank Washing",
        ],
        basePrice: 15000,
        isPopular: true,
        isActive: true,
      },
    ])
    .onConflictDoNothing();

  // 2. Seed Web Administrators
  const adminSeeds = [
    {
      name: "Elijah Admin",
      email: "admin@skilled4u.ng",
      phone: "+234 800 754 5533",
      city: "Abuja (Maitama)",
      accountStatus: "verified",
      adminRoleTitle: "Super Administrator",
      adminPermissions:
        "Full access: Users, Bookings, Financials, Disputes & Settings",
    },
    {
      name: "Elijah Ndenwa",
      email: "elijahndenwa88@gmail.com",
      phone: "+234 800 754 5534",
      city: "Abuja (Maitama)",
      accountStatus: "verified",
      adminRoleTitle: "Super Administrator",
      adminPermissions:
        "Full access: Users, Bookings, Financials, Disputes & Settings",
    },
    {
      name: "Funke Oladipo",
      email: "trust@skilled4u.ng",
      phone: "+234 809 112 4401",
      city: "Lagos (Victoria Island)",
      accountStatus: "verified",
      adminRoleTitle: "KYC & Dispute Moderator",
      adminPermissions:
        "Artisan identity verification, dispute claims & review moderation",
    },
    {
      name: "Sadiq Abdullahi",
      email: "dispatch@skilled4u.ng",
      phone: "+234 803 882 1904",
      city: "Abuja (Wuse II)",
      accountStatus: "active",
      adminRoleTitle: "Dispatch & Support Lead",
      adminPermissions:
        "Live booking dispatch, schedule updates & customer helpdesk",
    },
  ];

  for (const adm of adminSeeds) {
    await ensureAuthUser({
      ...adm,
      password: "Admin@2026",
      role: "admin",
      onboardingStatus: "completed",
      onboardingStep: 5,
    });
  }

  // 3. Seed Mobile App Customers (`role: "client"`)
  const customerSeeds = [
    {
      name: "Amina Bello",
      email: "amina.bello@gmail.com",
      phone: "+234 809 332 1104",
      city: "Abuja (Wuse II)",
      accountStatus: "active",
      onboardingStatus: "completed",
      onboardingStep: 3,
    },
    {
      name: "Toluwalase Adeyemi",
      email: "tolu.adeyemi@gmail.com",
      phone: "+234 803 741 9920",
      city: "Lagos (Lekki Phase 1)",
      accountStatus: "active",
      onboardingStatus: "completed",
      onboardingStep: 3,
    },
    {
      name: "Chidinma Nwosu",
      email: "chidinma.nwosu@yahoo.com",
      phone: "+234 812 509 4418",
      city: "Abuja (Maitama)",
      accountStatus: "active",
      onboardingStatus: "completed",
      onboardingStep: 3,
    },
    {
      name: "Ibrahim Danjuma",
      email: "ibrahim.danjuma@outlook.com",
      phone: "+234 805 612 8830",
      city: "Abuja (Gwarinpa)",
      accountStatus: "pending",
      onboardingStatus: "in_progress",
      onboardingStep: 2,
    },
  ];

  for (const cust of customerSeeds) {
    await ensureAuthUser({
      ...cust,
      password: "Customer@2026",
      role: "client",
    });
  }

  // 4. Ensure initial Artisan row exists & link all Artisans in NeonDB to Better Auth `user` accounts
  await db
    .insert(artisans)
    .values([
      {
        id: "emeka-okafor",
        name: "Emeka Okafor",
        email: "emeka.okafor@skilled4u.ng",
        phone: "+234 803 451 8920",
        trade: "Plumber",
        categoryId: "cat_plumbing",
        serviceKey: "plumbing",
        profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
        hourlyRate: "₦15,000",
        hourlyRateNumeric: 15000,
        about:
          "Professional plumber with 8+ years of experience in residential and commercial plumbing.",
        skills: ["Leak Repair", "Pipe Installation", "Drain Cleaning", "Water Heater"],
        rating: 4.8,
        reviewsCount: 124,
        completedJobs: 189,
        distance: "2.3 km",
        city: "Lagos",
        address: "Admiralty Way, Lekki Phase 1",
        isOnline: true,
        kycStatus: "verified",
      },
    ])
    .onConflictDoNothing();

  const allArtisans = await db.select().from(artisans);
  for (const art of allArtisans) {
    const isVerified = art.kycStatus === "verified";
    const linkedUserId = await ensureAuthUser({
      name: art.name,
      email: art.email,
      password: "Artisan@2026",
      phone: art.phone,
      role: "artisan",
      city: art.city,
      onboardingStatus: isVerified ? "completed" : "pending_kyc",
      onboardingStep: isVerified ? 5 : 4,
      accountStatus: isVerified ? "verified" : "pending",
    });

    const rawNin =
      decryptNin(art.ninEncrypted) ||
      (art.ninNumber && /^\d{11}$/.test(art.ninNumber)
        ? art.ninNumber
        : "48192038471");
    const ninPrepared = prepareNinStorage(rawNin);

    await db
      .update(artisans)
      .set({
        userId: linkedUserId,
        ninNumber: ninPrepared.ninMasked,
        ninEncrypted: ninPrepared.ninEncrypted,
        ninHash: ninPrepared.ninHash,
        kycSelfieUrl:
          art.kycSelfieUrl || "https://randomuser.me/api/portraits/men/32.jpg",
        kycIdDocumentUrl:
          art.kycIdDocumentUrl ||
          "https://skilled4u.com/images/landing/hero-artisan.png",
        kycIdType: art.kycIdType || "nin_slip",
        bankName: art.bankName || "Access Bank",
        bankAccountNumber: art.bankAccountNumber || "0148291042",
        bankAccountName: art.bankAccountName || art.name,
      })
      .where(eq(artisans.id, art.id));
  }

  console.log("Seed completed successfully! All Admins, Customers, and Artisans are stored in NeonDB.");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
