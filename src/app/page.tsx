import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/db";
import { artisans, categories, reviews } from "@/db/schema";
import { formatCurrency } from "@/lib/utils";
import { asc, desc } from "drizzle-orm";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Hammer,
  Lock,
  MapPin,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Tv,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function getCategoryIcon(iconName: string) {
  switch (iconName) {
    case "air-conditioner":
      return <Wind className="h-6 w-6 text-emerald-600" />;
    case "hammer-wrench":
      return <Hammer className="h-6 w-6 text-emerald-600" />;
    case "pipe-leak":
      return <Wrench className="h-6 w-6 text-emerald-600" />;
    case "broom":
      return <Sparkles className="h-6 w-6 text-emerald-600" />;
    case "television-classic":
      return <Tv className="h-6 w-6 text-emerald-600" />;
    case "lightning-bolt-outline":
      return <Zap className="h-6 w-6 text-emerald-600" />;
    default:
      return <Wrench className="h-6 w-6 text-emerald-600" />;
  }
}

export default async function LandingPage() {
  const [categoryList, artisanList, reviewList] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.title)),
    db.select().from(artisans).orderBy(desc(artisans.rating)),
    db.select().from(reviews).orderBy(desc(reviews.createdAt)),
  ]);

  const verifiedArtisans = artisanList.filter(
    (a) => a.kycStatus === "verified"
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Marketing Navbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-zinc-900">
                skilled<span className="text-emerald-600">4U</span>
              </span>
              <span className="ml-2 hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 sm:inline-block">
                Nigeria &amp; Africa
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
            <a href="#services" className="hover:text-emerald-600 transition-colors">
              Services
            </a>
            <a href="#artisans" className="hover:text-emerald-600 transition-colors">
              Verified Pros
            </a>
            <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">
              How It Works
            </a>
            <a href="#escrow" className="hover:text-emerald-600 transition-colors">
              Bachs.io Escrow
            </a>
            <a href="#reviews" className="hover:text-emerald-600 transition-colors">
              Reviews
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" size="sm">
                Admin Dashboard
              </Button>
            </Link>
            <a href="#download">
              <Button size="sm">Download App</Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-white to-white pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                NIN-Verified Artisans • 100% Escrow Protected by Bachs.io
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl leading-[1.1]">
                Hire Trusted{" "}
                <span className="text-emerald-600">
                  Skilled Professionals
                </span>{" "}
                in Minutes.
              </h1>

              <p className="max-w-2xl text-lg text-zinc-600 leading-relaxed">
                From emergency plumbing and solar inverter installations to
                custom carpentry and deep cleaning—connect with top-rated local
                artisans in real time with GPS tracking and protected escrow
                payments.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2" id="download">
                <a
                  href="#services"
                  className="inline-flex items-center gap-3 rounded-2xl bg-zinc-900 px-6 py-4 text-white shadow-lg hover:bg-zinc-800 transition-all"
                >
                  <Smartphone className="h-6 w-6 text-emerald-400" />
                  <div className="text-left">
                    <div className="text-[11px] uppercase tracking-wider text-zinc-400">
                      Download Client App
                    </div>
                    <div className="text-sm font-semibold">
                      App Store &amp; Google Play
                    </div>
                  </div>
                </a>

                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-sm font-semibold text-zinc-900 shadow-xs hover:bg-zinc-50 transition-all"
                >
                  Explore Live Admin Portal
                  <ArrowRight className="h-4 w-4 text-emerald-600" />
                </Link>
              </div>

              {/* Trust Metrics */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-zinc-200/80 max-w-lg">
                <div>
                  <div className="text-2xl font-bold text-zinc-950">2,400+</div>
                  <div className="text-xs text-zinc-500">KYC Verified Pros</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-zinc-950">4.8 ★</div>
                  <div className="text-xs text-zinc-500">Average Job Rating</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600">100%</div>
                  <div className="text-xs text-zinc-500">Escrow Money-Back</div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Mobile App Showcase Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md rounded-3xl border border-zinc-200 bg-zinc-950 p-4 shadow-2xl">
                <div className="rounded-2xl bg-white p-5 space-y-5">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
                        Live Dispatch Preview
                      </span>
                      <h3 className="text-base font-bold text-zinc-900">
                        Artisan En Route • 8 mins away
                      </h3>
                    </div>
                    <Badge variant="success">Escrow Active</Badge>
                  </div>

                  {/* Featured Artisan inside mockup */}
                  <div className="flex items-center gap-4 rounded-2xl bg-zinc-50 p-3.5 border border-zinc-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://randomuser.me/api/portraits/men/32.jpg"
                      alt="Emeka Okafor"
                      className="h-14 w-14 rounded-2xl object-cover ring-2 ring-emerald-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-zinc-900 truncate">
                          Emeka Okafor
                        </p>
                        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                      </div>
                      <p className="text-xs text-zinc-500">
                        Master Plumber • Lekki Phase 1
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs font-medium text-zinc-700">
                        <span className="flex items-center gap-1 text-amber-600">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          4.8 (124)
                        </span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">
                          ₦15,000/hr
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Progress Timeline */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between rounded-xl bg-emerald-50/80 px-3.5 py-2.5 text-emerald-900">
                      <span className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Payment Escrowed via Bachs.io
                      </span>
                      <span className="font-bold">₦45,000</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3.5 py-2.5 text-zinc-700">
                      <span className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-zinc-500" />
                        Funds released only when you confirm job done
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs text-zinc-500">
                    <span>skilled4U iOS &amp; Android App</span>
                    <span className="font-semibold text-emerald-600">
                      Real-Time GPS Tracking →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories Section */}
      <section id="services" className="py-20 bg-zinc-50/70 border-y border-zinc-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <Badge variant="success" className="mb-3">
                Marketplace Categories
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-950">
                Every Home &amp; Office Service Covered
              </h2>
              <p className="mt-2 text-zinc-600 max-w-2xl">
                Synced directly with our Neon PostgreSQL catalog and the
                skilled4U mobile app.
              </p>
            </div>
            <Link href="/admin/categories">
              <Button variant="outline" size="sm">
                Manage Categories in Admin
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categoryList.map((cat) => (
              <Card
                key={cat.id}
                className="hover:border-emerald-300 hover:shadow-md transition-all"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100">
                      {getCategoryIcon(cat.iconName)}
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      From {formatCurrency(cat.basePrice)}
                    </span>
                  </div>
                  <CardTitle className="pt-3 text-lg">{cat.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {cat.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {(cat.subServices || []).slice(0, 4).map((sub) => (
                      <span
                        key={sub}
                        className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700"
                      >
                        {sub}
                      </span>
                    ))}
                    {(cat.subServices || []).length > 4 && (
                      <span className="rounded-lg bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-500">
                        +{(cat.subServices || []).length - 4} more
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Top Verified Artisans Section */}
      <section id="artisans" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <Badge variant="success" className="mb-3">
                Background Checked &amp; Vetted
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-950">
                Top-Rated Skilled Professionals
              </h2>
              <p className="mt-2 text-zinc-600 max-w-2xl">
                Every artisan undergoes NIN identity verification, trade test
                screening, and bank account validation before appearing on the
                app.
              </p>
            </div>
            <Link href="/admin/artisans">
              <Button variant="outline" size="sm">
                Open Admin KYC Desk
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {verifiedArtisans.slice(0, 4).map((artisan) => (
              <Card
                key={artisan.id}
                className="flex flex-col justify-between hover:shadow-md transition-all"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={artisan.profileImage}
                      alt={artisan.name}
                      className="h-14 w-14 rounded-2xl object-cover border border-zinc-200"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <h3 className="font-bold text-zinc-900 truncate">
                          {artisan.name}
                        </h3>
                        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                      </div>
                      <p className="text-xs font-medium text-emerald-700">
                        {artisan.trade}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                        <span className="flex items-center gap-1 font-semibold text-amber-600">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {artisan.rating.toFixed(1)}
                        </span>
                        <span>({artisan.reviewsCount} reviews)</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-xs text-zinc-600 line-clamp-2">
                    {artisan.about}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(artisan.skills || []).slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100 text-xs">
                    <span className="flex items-center gap-1 text-zinc-500">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                      {artisan.distance} • {artisan.city}
                    </span>
                    <span className="font-bold text-zinc-900">
                      {artisan.hourlyRate}/hr
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-zinc-950 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="mb-3 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              Simple &amp; Transparent Workflow
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How skilled4U Protects Every Job
            </h2>
            <p className="mt-3 text-zinc-400 text-sm sm:text-base">
              Built for homeowners who want peace of mind and skilled artisans
              who deserve instant, guaranteed payouts.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-7 space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 font-bold">
                01
              </div>
              <h3 className="text-lg font-bold">Match with a Verified Pro</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Browse categories in the skilled4U app, compare ratings, hourly
                rates, and distance, and book an available artisan near you.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-7 space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 font-bold">
                02
              </div>
              <h3 className="text-lg font-bold">Fund Secure Bachs.io Escrow</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Pay via Card, Bank Transfer, Mobile Money, or USDT through
                Bachs.io. Your money is locked safely in escrow while the work
                takes place.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-7 space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 font-bold">
                03
              </div>
              <h3 className="text-lg font-bold">Approve Work &amp; Instant Payout</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Once you mark the job complete, Bachs.io automatically settles
                the artisan&apos;s bank account in seconds and logs the verified
                review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bachs.io Escrow & Payment Guarantee Section */}
      <section id="escrow" className="py-20 bg-emerald-950 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-900/80 border border-emerald-700 px-3.5 py-1 text-xs font-semibold text-emerald-300">
                <CreditCard className="h-3.5 w-3.5" />
                Powered by Bachs.io Payment Gateway
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Zero Payment Disputes. Multi-Currency Escrow Built for Africa.
              </h2>
              <p className="text-emerald-100/80 text-base leading-relaxed max-w-2xl">
                Whether a client pays in NGN via bank transfer, card, mobile
                money, or USD/USDT stablecoins, Bachs.io holds the funds in a
                dedicated marketplace ledger until job completion is verified.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">HMAC Signed Webhooks</h4>
                    <p className="text-xs text-emerald-200/70">
                      Every transaction state transition is cryptographically
                      verified on `/api/webhooks/bachs`.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Instant Bank Settlement</h4>
                    <p className="text-xs text-emerald-200/70">
                      Artisans receive 90% payout directly to their verified
                      Nigerian bank account immediately after job sign-off.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-emerald-800 bg-emerald-900/50 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">
                    Escrow Split Formula
                  </span>
                  <Badge className="bg-emerald-500 text-emerald-950 font-bold">
                    Automated
                  </Badge>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-emerald-800/80">
                    <span className="text-emerald-200">Client Booking Deposit</span>
                    <span className="font-bold">100% Held in Escrow</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-emerald-800/80">
                    <span className="text-emerald-200">Artisan Direct Settlement</span>
                    <span className="font-bold text-emerald-300">90% Instant Payout</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-emerald-200">Platform Protection &amp; Fee</span>
                    <span className="font-bold">10% Commission</span>
                  </div>
                </div>
                <Link href="/admin/payments" className="block pt-2">
                  <Button className="w-full bg-white text-emerald-950 hover:bg-emerald-50">
                    Inspect Live Bachs.io Ledger
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="success" className="mb-3">
              Verified Customer Stories
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-950">
              Loved by Homeowners &amp; Businesses
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {reviewList.map((rev) => (
              <Card key={rev.id} className="bg-zinc-50/60">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star
                        key={idx}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-zinc-700 leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                  <div className="pt-2 border-t border-zinc-200/70 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-zinc-900">{rev.clientName}</p>
                      <p className="text-zinc-500">{rev.serviceTitle}</p>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Award className="h-3 w-3 text-emerald-600" />
                      Verified Job
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50 py-12 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Wrench className="h-4 w-4" />
            </div>
            <span className="font-bold text-zinc-900">
              skilled<span className="text-emerald-600">4U</span>
            </span>
            <span className="text-xs text-zinc-500">
              © {new Date().getFullYear()} Skilled4U Marketplace Inc.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-zinc-600">
            <Link href="/admin" className="hover:text-emerald-600">
              Admin Dashboard
            </Link>
            <Link href="/admin/artisans" className="hover:text-emerald-600">
              Artisan KYC
            </Link>
            <Link href="/admin/payments" className="hover:text-emerald-600">
              Bachs.io Ledger
            </Link>
            <a
              href="/api/v1/categories"
              target="_blank"
              className="hover:text-emerald-600"
            >
              Mobile API (/api/v1)
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
