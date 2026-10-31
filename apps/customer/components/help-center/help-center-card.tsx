"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Plus } from "@usa-limousine-corporation/ui/svg";
import { NewTicketDialog } from "@/components/help-center/new-ticket-dialog";

export function HelpCenterCard() {
  const router = useRouter();

  return (
    <div className="relative overflow-hidden rounded-md bg-default-950 px-6 py-12 text-center sm:px-10 sm:py-14">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
      <p className="pointer-events-none absolute -bottom-6 right-6 select-none text-8xl font-bold leading-none text-white/5 sm:text-9xl">
        24/7
      </p>

      <div className="relative mx-auto flex max-w-xl flex-col items-center gap-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Customer care</p>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">How can we help?</h2>
          <p className="text-sm text-white/70 sm:text-base">
            Track your requests, find quick answers, or connect with our support team anytime.
          </p>
        </div>

        <Suspense fallback={null}>
          <NewTicketDialog
            onCreated={(id) => router.push(`/help-center/${id}`)}
            trigger={
              <Button type="button" className="mt-1 gap-2 rounded-md px-5">
                <Plus className="h-4 w-4" />
                New support ticket
              </Button>
            }
          />
        </Suspense>
      </div>
    </div>
  );
}
