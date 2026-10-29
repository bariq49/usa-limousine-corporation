"use client";

import Link from "next/link";
import { PLATFORM } from "@usa-limousine-corporation/config";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import { Stagger, StaggerItem } from "@/components/animations";

export default function FooterBottomBar() {
  const year = formatDate({
    date: new Date(),
    options: { year: "numeric" },
  });

  return (
    <div className="border-t border-white/15 bg-black">
      <Stagger className="container mx-auto flex flex-col items-center justify-center gap-2 px-4 py-5 text-center text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:text-left">
        <StaggerItem soft>
          <p>
            Copyright © {year} <span className="font-semibold text-secondary">{PLATFORM.name}</span>
            . All Rights Reserved
          </p>
        </StaggerItem>
        <StaggerItem soft>
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-start">
            <span>
              Developed by,{" "}
              <Link
                href="https://thedevsquare.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-secondary transition-colors hover:text-secondary/80"
              >
                The DevSquare
              </Link>
            </span>
          </p>
        </StaggerItem>
      </Stagger>
    </div>
  );
}
