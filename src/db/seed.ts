import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import { categories, artisans } from "./schema";

async function seed() {
  console.log("Seeding Neon PostgreSQL database for skilled4U...");

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

  console.log("Seed completed successfully!");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});

