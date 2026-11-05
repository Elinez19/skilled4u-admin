# skilled4U — Next.js Backend, Admin Dashboard & Landing Page

Full-stack web backend, admin console, and marketing website for the **skilled4U** artisan marketplace ecosystem.

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript, Server Components)
- **Database**: Neon Serverless PostgreSQL (`skilled4u-db` / `empty-waterfall-76651473`)
- **ORM**: Drizzle ORM + Drizzle Kit (`src/db/schema/`)
- **Authentication**: Better-Auth (`admin` + `bearer` plugins for web & Expo mobile app)
- **Payments & Escrow**: Bachs.io Payment Gateway (`src/lib/bachs.ts` + `/api/webhooks/bachs`)
- **UI System**: shadcn/ui + Tailwind CSS v4 + Lucide Icons

---

## Quick Start

```bash
cd C:\Users\elija\Desktop\skilled4u-web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:

- **Landing Page Website**: `http://localhost:3000`
- **Admin Sign In / Register**: `http://localhost:3000/login`
- **Admin Dashboard Overview**: `http://localhost:3000/admin`
- **Artisan NIN/KYC Verification Desk**: `http://localhost:3000/admin/artisans`
- **Service Bookings & Dispatch**: `http://localhost:3000/admin/bookings`
- **Bachs.io Escrow & Settlement Ledger**: `http://localhost:3000/admin/payments`
- **Service Categories Manager**: `http://localhost:3000/admin/categories`

---

## Mobile App REST API Endpoints (`/api/v1`)

| Endpoint | Methods | Purpose |
|---|---|---|
| `/api/auth/[...all]` | `GET`, `POST` | Better-Auth session & mobile Bearer token endpoints |
| `/api/v1/categories` | `GET`, `POST` | List or create marketplace service categories |
| `/api/v1/artisans` | `GET`, `PATCH` | Query artisans or update KYC / online status |
| `/api/v1/bookings` | `GET`, `POST`, `PATCH` | Create and update service bookings |
| `/api/v1/payments/initialize` | `POST` | Initialize a Bachs.io escrow checkout session |
| `/api/v1/payments/release` | `POST` | Release escrow & settle 90% payout to artisan's bank |
| `/api/webhooks/bachs` | `POST` | HMAC-SHA256 verified Bachs.io webhook listener |

---

## Database Scripts

```bash
npm run db:generate   # Generate Drizzle SQL migrations
npm run db:push       # Push schema changes directly to Neon PostgreSQL
npm run db:seed       # Seed categories & artisans
npm run db:studio     # Launch Drizzle Studio GUI
```
