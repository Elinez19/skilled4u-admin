"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Layers } from "lucide-react";
import type { CategoryRow } from "@/db/schema";
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
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";

export function CategoriesManager({
  initialCategories,
}: {
  initialCategories: CategoryRow[];
}) {
  const router = useRouter();
  const [items, setItems] = React.useState<CategoryRow[]>(initialCategories);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [basePrice, setBasePrice] = React.useState("15000");
  const [subServices, setSubServices] = React.useState(
    "Solar Panel Cleaning, Inverter Battery Check, Surge Protection"
  );
  const [saving, setSaving] = React.useState(false);

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/v1/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          basePrice: Number(basePrice),
          subServices,
          isPopular: true,
        }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setItems((prev) => [...prev, data]);
        setTitle("");
        setDescription("");
        setDialogOpen(false);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-500">
          Showing <span className="font-semibold text-zinc-900">{items.length}</span>{" "}
          marketplace service categories
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Service Category
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((cat) => (
          <Card key={cat.id} className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Layers className="h-5 w-5" />
                </div>
                <Badge variant={cat.isActive ? "success" : "secondary"}>
                  {cat.isActive ? "Active" : "Hidden"}
                </Badge>
              </div>
              <CardTitle className="pt-3 text-base">{cat.title}</CardTitle>
              <CardDescription>{cat.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {(cat.subServices || []).map((sub) => (
                  <span
                    key={sub}
                    className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700"
                  >
                    {sub}
                  </span>
                ))}
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-mono">{cat.slug}</span>
                <span className="font-bold text-emerald-700">
                  Base: {formatCurrency(cat.basePrice)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>Create Marketplace Category</DialogTitle>
          <DialogDescription>
            Adds a new category to Neon PostgreSQL and immediately exposes it to
            the skilled4U mobile app via `/api/v1/categories`.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Category Title</Label>
            <Input
              placeholder="e.g. Solar & Renewable Energy"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input
              placeholder="Rooftop solar arrays, lithium battery banks, and hybrid inverters."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Recommended Base Price (NGN)</Label>
            <Input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Sub-Services (comma separated)</Label>
            <Input
              value={subServices}
              onChange={(e) => setSubServices(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Create Category"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

