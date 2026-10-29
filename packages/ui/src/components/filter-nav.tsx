"use client";

import { useRef } from "react";
import Link from "next/link";
import { cn } from "../utils/cn";

export type FilterItem = {
  id: string;
  label: string;
  href: string;
  count?: number;
};

export type FilterNavProps = {
  items: FilterItem[];
  activeId?: string | null;
  allHref?: string;
  allLabel?: string;
  label?: string;
  className?: string;
  showAll?: boolean;
  mobileBottom?: boolean;
};

export function FilterNav(props: FilterNavProps) {
  const {
    items,
    activeId,
    allHref = "/",
    allLabel = "All",
    label = "Filters",
    className,
    showAll = true,
    mobileBottom = false,
  } = props;

  const scrollerRef = useRef<HTMLElement>(null);
  const dragRef = useRef<{
    active: boolean;
    moved: boolean;
    startX: number;
    scrollLeft: number;
    pointerId: number;
  }>({
    active: false,
    moved: false,
    startX: 0,
    scrollLeft: 0,
    pointerId: -1,
  });

  if (items.length === 0) return null;

  const isAllActive = !activeId;

  const chipClass = (active: boolean) =>
    cn(
      "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
      active
        ? "border-black bg-black text-white"
        : "border-border text-gray-700 hover:border-secondary hover:text-secondary",
    );

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (!mobileBottom) return;
    if (window.matchMedia("(min-width: 768px)").matches) return;

    const node = scrollerRef.current;
    if (!node) return;

    dragRef.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      scrollLeft: node.scrollLeft,
      pointerId: event.pointerId,
    };
    node.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag.active) return;

    const node = scrollerRef.current;
    if (!node) return;

    const delta = event.clientX - drag.startX;
    if (Math.abs(delta) > 4) drag.moved = true;
    node.scrollLeft = drag.scrollLeft - delta;
  };

  const endDrag = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag.active) return;

    const node = scrollerRef.current;
    if (node && drag.pointerId === event.pointerId) {
      try {
        node.releasePointerCapture(event.pointerId);
      } catch {
        // ignore
      }
    }

    dragRef.current.active = false;
    dragRef.current.pointerId = -1;
  };

  const onClickCapture = (event: React.MouseEvent<HTMLElement>) => {
    if (!dragRef.current.moved) return;
    event.preventDefault();
    event.stopPropagation();
    dragRef.current.moved = false;
  };

  return (
    <nav
      ref={scrollerRef}
      aria-label={label}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={onClickCapture}
      className={cn(
        mobileBottom
          ? [
              "fixed inset-x-0 bottom-0 z-50 flex cursor-grab flex-nowrap gap-2 overflow-x-auto overscroll-x-contain active:cursor-grabbing",
              "touch-pan-x border-t border-border bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
              "shadow-[0_-6px_20px_rgba(0,0,0,0.06)] backdrop-blur-md",
              "[-webkit-overflow-scrolling:touch] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              "md:static md:mt-5 md:cursor-default md:flex-wrap md:overflow-visible md:border-0 md:bg-transparent",
              "md:p-0 md:pb-0 md:shadow-none md:backdrop-blur-none md:active:cursor-default",
            ]
          : "mt-5 flex flex-wrap gap-2",
        className,
      )}
    >
      {showAll ? (
        <Link href={allHref} className={chipClass(isAllActive)} draggable={false}>
          {allLabel}
        </Link>
      ) : null}
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={chipClass(isActive)}
            draggable={false}
          >
            {item.label}
            {typeof item.count === "number" ? (
              <span className="ml-1.5 text-xs opacity-70">{item.count}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
