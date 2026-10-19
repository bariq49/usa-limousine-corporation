"use client";

import { useEffect, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../utils/cn";

type TimeColumnProps<T extends string | number> = {
  label: string;
  values: T[];
  selected: T | null;
  onSelect: (val: T) => void;
  formatValue?: (val: T) => string;
};

export function TimeColumn<T extends string | number>(props: TimeColumnProps<T>) {
  const { label, values, selected, onSelect, formatValue } = props;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected === null || !ref.current) {
      return;
    }
    const selectedIndex = values.indexOf(selected);
    if (selectedIndex < 0) {
      return;
    }
    const selectedElement = ref.current.children[selectedIndex] as HTMLElement | undefined;
    if (!selectedElement) {
      return;
    }
    ref.current.scrollTo({
      top: selectedElement.offsetTop,
      behavior: "smooth",
    });
  }, [selected, values]);

  const scroll = (dir: "up" | "down") => {
    if (!ref.current) {
      return;
    }
    ref.current.scrollBy({
      top: dir === "up" ? -40 : 40,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex flex-col">
      <label className="mb-2 text-center text-xs font-medium text-default-500">{label}</label>

      <div className="relative overflow-hidden rounded-md border border-border bg-card">
        <button
          type="button"
          onClick={() => scroll("up")}
          className="flex w-full cursor-pointer justify-center border-b border-border py-1.5 transition hover:bg-primary/10"
        >
          <ChevronUp size={14} className="text-default-400" />
        </button>

        <div
          ref={ref}
          className="relative max-h-40 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {values.map((val) => {
            const isSelected = selected === val;
            const labelText =
              formatValue?.(val) ??
              (typeof val === "number" ? val.toString().padStart(2, "0") : String(val));

            return (
              <button
                key={String(val)}
                type="button"
                onClick={() => onSelect(val)}
                className={cn(
                  "w-full cursor-pointer border-b border-border py-2 text-sm font-bold transition last:border-b-0",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "text-default-700 hover:bg-primary/10",
                )}
              >
                {labelText}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scroll("down")}
          className="flex w-full cursor-pointer justify-center border-t border-border py-1.5 transition hover:bg-primary/10"
        >
          <ChevronDown size={14} className="text-default-400" />
        </button>
      </div>
    </div>
  );
}
