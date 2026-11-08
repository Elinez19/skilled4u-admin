import * as React from "react";
import { Loader2 } from "lucide-react";
import { OffsetRing } from "@/components/brand/offset-ring";
import { PillBadge } from "@/components/landing/ui/pill-badge";

export function AdminLoadingState({
  label = "Loading marketplace management records...",
}: {
  label?: string;
}) {
  return (
    <div className="surface-slab-pearl w-full rounded-slab border-2 border-surface-frost px-6 py-24 text-center">
      <div className="flex flex-col items-center justify-center gap-5">
        <OffsetRing size="md" faceTone="ink">
          <Loader2 className="h-6 w-6 animate-spin text-accent-sky" />
        </OffsetRing>
        <PillBadge tone="porcelain" icon="dot">
          {label}
        </PillBadge>
      </div>
    </div>
  );
}
