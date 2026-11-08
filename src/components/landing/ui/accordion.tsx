"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { type FaqItemData } from "@/content/landing";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function FaqAccordion({ items }: { items: readonly FaqItemData[] }) {
  const [openId, setOpenId] = React.useState<string | null>(
    items[0]?.id ?? null
  );

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <motion.div
            key={item.id}
            layout
            className={cn(
              "surface-gloss-card overflow-hidden transition-colors",
              isOpen && "border-brand-300"
            )}
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-6 px-7 py-6 sm:px-9 sm:py-7 text-left cursor-pointer"
            >
              <span className="font-display text-xl sm:text-2xl font-extrabold text-brand-950">
                {item.question}
              </span>
              <span
                className="cta-surface-primary grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-ink-on-blue"
                aria-hidden="true"
              >
                {isOpen ? (
                  <Minus className="h-5 w-5 stroke-[2.75]" />
                ) : (
                  <Plus className="h-5 w-5 stroke-[2.75]" />
                )}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={motionTokens.spring.snappy}
                >
                  <div className="px-7 pb-7 sm:px-9 sm:pb-8 pt-0 text-base sm:text-lg font-medium leading-relaxed text-ink-secondary">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

