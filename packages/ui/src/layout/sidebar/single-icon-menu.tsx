"use client";

import Link from "next/link";
import type { SingleIconMenuProps } from "../../types/navigation";
import { cn } from "../../utils/cn";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/tooltip";

export function SingleIconMenu(props: SingleIconMenuProps) {
  const { index, activeIndex, item, locationName } = props;
  const Icon = item.icon;
  const href = item.href;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {href ? (
            <Link
              href={href}
              className={cn(
                "relative mx-auto flex h-12 w-12 cursor-pointer flex-col items-center justify-center rounded-lg transition-all duration-200",
                locationName === href
                  ? "bg-primary/10 text-primary"
                  : "text-default-500 hover:bg-primary/10 hover:text-primary dark:text-default-400",
              )}
            >
              {Icon ? <Icon className="h-6 w-6" /> : null}
            </Link>
          ) : (
            <button
              type="button"
              className={cn(
                "relative mx-auto flex h-12 w-12 cursor-pointer flex-col items-center justify-center rounded-lg transition-all duration-200",
                activeIndex === index
                  ? "bg-primary/10 text-primary dark:bg-primary dark:text-primary-foreground"
                  : "text-default-500 hover:bg-primary/10 hover:text-primary dark:text-default-400",
              )}
            >
              {Icon ? <Icon className="h-6 w-6" /> : null}
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent side="right" className="capitalize">
          {item.title}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
