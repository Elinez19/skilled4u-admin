"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Send,
  Plus,
  Lock,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import type { PaymentRow } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";

export function PaymentsManager({
  initialPayments,
}: {
  initialPayments: PaymentRow[];
}) {
  const router = useRouter();
  const [items, setItems] = React.useState<PaymentRow[]>(initialPayments);
  const [releasingId, setReleasingId] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // New Bachs checkout simulation fields
  const [clientName, setClientName] = React.useState("Toluwalase Adeyemi");
  const [clientEmail, setClientEmail] = React.useState("tolu.adeyemi@gmail.com");
  const [artisanName, setArtisanName] = React.useState("Emeka Okafor");
  const [amount, setAmount] = React.useState("35000");
  const [paymentMethod, setPaymentMethod] = React.useState("card");
  const [creating, setCreating] = React.useState(false);

  async function handleReleaseEscrow(paymentId: string) {
    setReleasingId(paymentId);
    try {
      const res = await fetch("/api/v1/payments/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setItems((prev) => prev.map((p) => (p.id === paymentId ? data : p)));
        router.refresh();
      }
    } finally {
      setReleasingId(null);
    }
  }

  async function handleInitializePayment(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/v1/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          clientEmail,
          artisanId: "emeka-okafor",
          artisanName,
          amount: Number(amount),
          currency: "NGN",
          paymentMethod,
        }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setItems((prev) => [data, ...prev]);
        setDialogOpen(false);
        router.refresh();
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              Bachs.io Escrow &amp; Settlement Ledger
            </CardTitle>
            <CardDescription>
              All marketplace deposits, 10% platform commissions, and 90%
              artisan bank settlements.
            </CardDescription>
          </div>

          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Initialize Bachs.io Checkout
          </Button>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bachs Reference</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Artisan Beneficiary</TableHead>
                <TableHead>Gross Amount</TableHead>
                <TableHead>Split (90% / 10%)</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Escrow State</TableHead>
                <TableHead className="text-right">Settlement Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((pay) => (
                <TableRow key={pay.id}>
                  <TableCell>
                    <div className="font-mono text-xs font-bold text-zinc-900">
                      {pay.reference}
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400">
                      {pay.bachsTransactionId || "awaiting_webhook"}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-medium text-zinc-900">
                      {pay.clientName}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {pay.clientEmail}
                    </div>
                  </TableCell>

                  <TableCell className="font-medium text-zinc-800">
                    {pay.artisanName}
                  </TableCell>

                  <TableCell className="font-bold text-zinc-950">
                    {formatCurrency(pay.amount, pay.currency)}
                  </TableCell>

                  <TableCell>
                    <div className="text-xs font-semibold text-emerald-700">
                      Pro: {formatCurrency(pay.artisanPayout, pay.currency)}
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Fee: {formatCurrency(pay.platformFee, pay.currency)}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="uppercase text-[10px]">
                      {pay.paymentMethod.replace("_", " ")}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        pay.escrowStatus === "released"
                          ? "success"
                          : pay.escrowStatus === "held"
                            ? "warning"
                            : "secondary"
                      }
                      className="gap-1"
                    >
                      {pay.escrowStatus === "held" && (
                        <Lock className="h-3 w-3" />
                      )}
                      {pay.escrowStatus}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    {pay.escrowStatus === "held" ? (
                      <Button
                        size="sm"
                        disabled={releasingId === pay.id}
                        onClick={() => handleReleaseEscrow(pay.id)}
                      >
                        {releasingId === pay.id ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Settling...
                          </>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" />
                            Release Payout
                          </>
                        )}
                      </Button>
                    ) : pay.escrowStatus === "released" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Settled to Bank
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400">
                        Awaiting Payment
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>Initialize Bachs.io Escrow Checkout</DialogTitle>
          <DialogDescription>
            Creates a new transaction via `/api/v1/payments/initialize` and
            calculates the 90/10 marketplace escrow split.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleInitializePayment} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Client Name</Label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Client Email</Label>
              <Input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Artisan Beneficiary</Label>
              <Input
                value={artisanName}
                onChange={(e) => setArtisanName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Amount (NGN)</Label>
              <Input
                type="number"
                min={1000}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Bachs.io Payment Channel</Label>
            <div className="grid grid-cols-4 gap-2">
              {(["card", "bank_transfer", "mobile_money", "usdt"] as const).map(
                (ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setPaymentMethod(ch)}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold uppercase transition-all cursor-pointer ${
                      paymentMethod === ch
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                        : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    {ch.replace("_", " ")}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="rounded-xl bg-zinc-50 p-3.5 border border-zinc-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-zinc-500">Artisan Escrow Share (90%):</span>
              <span className="font-bold text-emerald-700">
                {formatCurrency(Math.round(Number(amount || 0) * 0.9))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Platform Commission (10%):</span>
              <span className="font-semibold text-zinc-900">
                {formatCurrency(Math.round(Number(amount || 0) * 0.1))}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? "Initializing..." : "Create & Lock in Escrow"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

