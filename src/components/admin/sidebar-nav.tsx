"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  Layers,
  ExternalLink,
  ShieldCheck,
  Wrench,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Overview & KPIs",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Artisans & KYC Desk",
    href: "/admin/artisans",
    icon: Users,
  },
  {
    title: "Bookings & Dispatch",
    href: "/admin/bookings",
    icon: CalendarCheck,
  },
  {
    title: "Bachs.io Escrow Ledger",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    title: "Service Categories",
    href: "/admin/categories",
    icon: Layers,
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-zinc-200 bg-white flex flex-col justify-between">
      <div className="p-5">
        <Link href="/" className="flex items-center gap-2.5 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
            <Wrench className="h-4 w-4" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-zinc-900">
              skilled<span className="text-emerald-600">4U</span>
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Admin Console
            </span>
          </div>
        </Link>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-emerald-600" : "text-zinc-400"
                  )}
                />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-zinc-100 space-y-3">
        <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-200/60 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Stack Status: Online
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Neon Postgres • Drizzle ORM • Better-Auth • Bachs.io Gateway
          </p>
        </div>

        <div className="flex items-center justify-between text-xs font-medium text-zinc-600 px-1">
          <Link
            href="/login"
            className="flex items-center gap-1.5 hover:text-emerald-600"
          >
            <LogIn className="h-3.5 w-3.5" />
            Auth Session
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-emerald-600"
          >
            Landing Page
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

