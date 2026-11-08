import { Suspense } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Users,
  CalendarCheck,
  Lock,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { db } from "@/db";
import { artisans, bookings, payments, categories } from "@/db/schema";
import { desc } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

async function OverviewMetricsAndTables() {
  const [allArtisans, allBookings, allPayments, allCategories] =
    await Promise.all([
      db.select().from(artisans).orderBy(desc(artisans.createdAt)),
      db.select().from(bookings).orderBy(desc(bookings.createdAt)),
      db.select().from(payments).orderBy(desc(payments.createdAt)),
      db.select().from(categories),
    ]);

  const totalGmv = allPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalCommission = allPayments.reduce(
    (sum, p) => sum + p.platformFee,
    0
  );
  const escrowHeldAmount = allPayments
    .filter((p) => p.escrowStatus === "held")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingKycArtisans = allArtisans.filter(
    (a) => a.kycStatus === "pending"
  );
  const verifiedArtisansCount = allArtisans.filter(
    (a) => a.kycStatus === "verified"
  ).length;

  return (
    <>
      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="font-medium">
              Gross Merchandise Value
            </CardDescription>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-950">
              {formatCurrency(totalGmv)}
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              {formatCurrency(totalCommission)} platform fee (10%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="font-medium">
              Bachs.io Escrow in Hold
            </CardDescription>
            <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Lock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-950">
              {formatCurrency(escrowHeldAmount)}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Awaiting job completion sign-off
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="font-medium">
              Total Service Bookings
            </CardDescription>
            <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-950">
              {allBookings.length}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Across {allCategories.length} active service categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="font-medium">
              Artisans &amp; KYC Queue
            </CardDescription>
            <div className="h-9 w-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-950">
              {verifiedArtisansCount} Verified
            </div>
            <p className="text-xs text-amber-600 font-medium mt-1">
              {pendingKycArtisans.length} pending NIN/KYC approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Recent Bookings + Pending KYC Approvals */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Recent Bookings Table */}
        <Card className="lg:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Service Bookings</CardTitle>
              <CardDescription>
                Live bookings dispatched from the skilled4U mobile app.
              </CardDescription>
            </div>
            <Link href="/admin/bookings">
              <Button variant="outline" size="sm">
                View All
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking Code</TableHead>
                  <TableHead>Client &amp; Service</TableHead>
                  <TableHead>Artisan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allBookings.slice(0, 5).map((bk) => (
                  <TableRow key={bk.id}>
                    <TableCell className="font-mono text-xs font-semibold">
                      {bk.bookingCode}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-zinc-900">
                        {bk.clientName}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {bk.serviceTitle}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{bk.artisanName}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(bk.agreedAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          bk.status === "completed"
                            ? "success"
                            : bk.status === "in_progress" ||
                                bk.status === "accepted"
                              ? "default"
                              : "warning"
                        }
                      >
                        {bk.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pending KYC Queue */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pending KYC Reviews</CardTitle>
              <CardDescription>
                Artisans awaiting NIN &amp; bank verification.
              </CardDescription>
            </div>
            <Badge variant="warning">{pendingKycArtisans.length} Pending</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingKycArtisans.length === 0 ? (
              <div className="rounded-xl bg-emerald-50 p-4 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                All artisans have been verified!
              </div>
            ) : (
              pendingKycArtisans.map((art) => (
                <div
                  key={art.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-200/80 p-3.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={art.profileImage}
                      alt={art.name}
                      className="h-10 w-10 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 truncate">
                        {art.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {art.trade} • NIN: {art.ninNumber || "Submitted"}
                      </p>
                    </div>
                  </div>
                  <Link href="/admin/artisans">
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                  </Link>
                </div>
              ))
            )}

            <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-200/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800">
                <ShieldAlert className="h-4 w-4 text-emerald-600" />
                Verification Checklist
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Verify NIN slip match, trade certificate, and Nigerian NUBAN
                account name before activating artisan dispatch.
              </p>
              <Link href="/admin/artisans" className="block pt-1">
                <Button variant="secondary" size="sm" className="w-full">
                  Open Full KYC Verification Desk
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
            Marketplace Operations &amp; Analytics
          </h1>
          <p className="text-sm text-zinc-500">
            Real-time metrics queried via Drizzle ORM from your Neon PostgreSQL
            database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/payments">
            <Button size="sm">Manage Bachs.io Escrow</Button>
          </Link>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-sm text-zinc-500">
            Loading marketplace operations &amp; analytics...
          </div>
        }
      >
        <OverviewMetricsAndTables />
      </Suspense>
    </div>
  );
}
