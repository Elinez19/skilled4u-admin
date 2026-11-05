"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Clock } from "lucide-react";
import type { BookingRow } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

export function BookingsManager({
  initialBookings,
}: {
  initialBookings: BookingRow[];
}) {
  const router = useRouter();
  const [items, setItems] = React.useState<BookingRow[]>(initialBookings);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function updateBookingStatus(id: string, status: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/v1/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setItems((prev) => prev.map((b) => (b.id === id ? data : b)));
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  }

  const filtered =
    statusFilter === "all"
      ? items
      : items.filter((b) => b.status === statusFilter);

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle>Service Bookings &amp; Dispatch Desk</CardTitle>
          <CardDescription>
            Monitor active artisan dispatches, client schedules, and job
            completion states.
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["all", "pending", "accepted", "in_progress", "completed"].map(
            (st) => (
              <Button
                key={st}
                size="sm"
                variant={statusFilter === st ? "default" : "outline"}
                onClick={() => setStatusFilter(st)}
                className="capitalize"
              >
                {st.replace("_", " ")}
              </Button>
            )
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking Code</TableHead>
              <TableHead>Client &amp; Address</TableHead>
              <TableHead>Service &amp; Artisan</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Agreed Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Dispatch Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((bk) => (
              <TableRow key={bk.id}>
                <TableCell className="font-mono text-xs font-bold text-zinc-900">
                  {bk.bookingCode}
                </TableCell>

                <TableCell>
                  <div className="font-medium text-zinc-900">
                    {bk.clientName}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-zinc-500 mt-0.5">
                    <MapPin className="h-3 w-3 text-zinc-400 shrink-0" />
                    <span className="truncate max-w-[200px]">{bk.address}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="font-medium text-zinc-900">
                    {bk.serviceTitle}
                  </div>
                  <div className="text-xs text-emerald-700 font-medium">
                    Pro: {bk.artisanName}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1 text-xs text-zinc-700">
                    <Calendar className="h-3 w-3 text-zinc-400" />
                    {bk.scheduledDate}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Clock className="h-3 w-3 text-zinc-400" />
                    {bk.scheduledTime}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="font-bold text-zinc-900">
                    {formatCurrency(bk.agreedAmount)}
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-zinc-500">
                    Escrow: {bk.paymentStatus}
                  </div>
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

                <TableCell className="text-right">
                  {bk.status === "pending" && (
                    <Button
                      size="sm"
                      disabled={busyId === bk.id}
                      onClick={() => updateBookingStatus(bk.id, "accepted")}
                    >
                      Accept Dispatch
                    </Button>
                  )}
                  {bk.status === "accepted" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busyId === bk.id}
                      onClick={() => updateBookingStatus(bk.id, "in_progress")}
                    >
                      Mark In Progress
                    </Button>
                  )}
                  {bk.status === "in_progress" && (
                    <Button
                      size="sm"
                      variant="default"
                      disabled={busyId === bk.id}
                      onClick={() => updateBookingStatus(bk.id, "completed")}
                    >
                      Complete Job
                    </Button>
                  )}
                  {bk.status === "completed" && (
                    <span className="text-xs font-medium text-emerald-600">
                      ✓ Job Completed
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

