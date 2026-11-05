import Link from "next/link";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Database, CreditCard } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-50/70">
      <SidebarNav />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Admin Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/90 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Badge variant="success" className="gap-1.5">
              <Database className="h-3 w-3" />
              Neon Postgres Connected
            </Badge>
            <Badge variant="outline" className="hidden sm:inline-flex gap-1.5">
              <CreditCard className="h-3 w-3 text-emerald-600" />
              Bachs.io Escrow Ready
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm">
                Public Website
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

