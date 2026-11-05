"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Star,
  Landmark,
  Search,
} from "lucide-react";
import type { ArtisanRow } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ArtisansManager({
  initialArtisans,
}: {
  initialArtisans: ArtisanRow[];
}) {
  const router = useRouter();
  const [items, setItems] = React.useState<ArtisanRow[]>(initialArtisans);
  const [filter, setFilter] = React.useState<"all" | "verified" | "pending" | "rejected">("all");
  const [search, setSearch] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function updateArtisanKyc(id: string, kycStatus: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/v1/artisans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, kycStatus }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setItems((prev) => prev.map((a) => (a.id === id ? data : a)));
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  }

  const filtered = items.filter((a) => {
    const matchesStatus = filter === "all" || a.kycStatus === filter;
    const matchesSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.trade.toLowerCase().includes(search.toLowerCase()) ||
      a.city.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Artisans &amp; NIN/KYC Verification Desk</CardTitle>
            <CardDescription>
              Approve or reject artisan identity documents and NUBAN payout
              accounts.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(["all", "verified", "pending", "rejected"] as const).map((st) => (
              <Button
                key={st}
                size="sm"
                variant={filter === st ? "default" : "outline"}
                onClick={() => setFilter(st)}
                className="capitalize"
              >
                {st}
              </Button>
            ))}
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search by name, trade, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Artisan</TableHead>
              <TableHead>Trade &amp; Rate</TableHead>
              <TableHead>NIN &amp; Bank Payout Details</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>KYC Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((art) => (
              <TableRow key={art.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={art.profileImage}
                      alt={art.name}
                      className="h-10 w-10 rounded-xl object-cover border border-zinc-200"
                    />
                    <div>
                      <div className="flex items-center gap-1 font-semibold text-zinc-900">
                        {art.name}
                        {art.kycStatus === "verified" && (
                          <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        )}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {art.phone} • {art.city}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="font-medium text-zinc-900">{art.trade}</div>
                  <div className="text-xs text-emerald-700 font-semibold">
                    {art.hourlyRate}/hr
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-xs font-mono text-zinc-700">
                    NIN: {art.ninNumber || "48192038471"}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-zinc-500 mt-0.5">
                    <Landmark className="h-3 w-3 text-zinc-400" />
                    {art.bankName || "Access Bank"} •{" "}
                    {art.bankAccountNumber || "0148291042"}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {art.rating.toFixed(1)} ({art.reviewsCount})
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    {art.completedJobs} completed jobs
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      art.kycStatus === "verified"
                        ? "success"
                        : art.kycStatus === "pending"
                          ? "warning"
                          : "destructive"
                    }
                  >
                    {art.kycStatus}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-2">
                    {art.kycStatus !== "verified" && (
                      <Button
                        size="sm"
                        variant="default"
                        disabled={busyId === art.id}
                        onClick={() => updateArtisanKyc(art.id, "verified")}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve KYC
                      </Button>
                    )}
                    {art.kycStatus !== "rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === art.id}
                        onClick={() => updateArtisanKyc(art.id, "rejected")}
                      >
                        <XCircle className="h-3.5 w-3.5 text-red-500" />
                        Reject
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

