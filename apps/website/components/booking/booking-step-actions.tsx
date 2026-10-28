"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "@usa-limousine-corporation/ui/svg";
import { Button } from "@usa-limousine-corporation/ui/components/button";

type Props = {
  backHref: string;
  children: ReactNode;
};

/** Sticky bottom bar with a back button and the step's primary action. */
export default function BookingStepActions({ backHref, children }: Props) {
  const router = useRouter();

  return (
    <div className="sticky bottom-0 z-30 -mx-1 mt-4 rounded-b-sm border-t border-border bg-white/95 px-3 py-3 shadow-sheet backdrop-blur-sm md:mx-0 md:rounded-none md:border-t-0 md:bg-white md:px-0 md:shadow-none md:backdrop-blur-none">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          aria-label="Back"
          onClick={() => router.push(backHref)}
          className="h-11 w-12 shrink-0 rounded-sm border border-border bg-white p-0 text-black hover:bg-gray-100"
        >
          <ChevronLeft width={20} height={20} strokeWidth={2.5} />
        </Button>
        {children}
      </div>
    </div>
  );
}
