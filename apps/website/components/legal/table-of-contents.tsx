"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight, List } from "@usa-limousine-corporation/ui/svg";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import type { TableOfContentsProps } from "@/types/legal.types";

export default function TableOfContents(props: TableOfContentsProps) {
  const { items } = props;
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const navRef = useRef<HTMLElement>(null);
  const dragRef = useRef({ active: false, moved: false, startX: 0, scrollLeft: 0 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    const nav = navRef.current;
    const active = document.getElementById(`toc-${activeId}`);
    if (!nav || !active) return;
    if (window.matchMedia("(min-width: 1024px)").matches) {
      nav.scrollTo({
        top: active.offsetTop - nav.clientHeight / 2 + active.clientHeight / 2,
        behavior: "smooth",
      });
      return;
    }
    nav.scrollTo({
      left: active.offsetLeft - nav.clientWidth / 2 + active.clientWidth / 2,
      behavior: "smooth",
    });
  }, [activeId]);

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t border-neutral-200 bg-white/95 px-4 pt-3 pb-4 shadow-sheet-strong backdrop-blur-xl lg:sticky lg:top-28 lg:w-auto lg:rounded-md lg:border lg:bg-white lg:p-6 lg:shadow-none">
      <div className="mb-3 flex items-center gap-2 lg:mb-5">
        <List className="h-4 w-4 text-secondary lg:h-5 lg:w-5" />
        <span className="text-sm font-bold tracking-widest text-neutral-900 uppercase lg:text-base lg:tracking-normal lg:normal-case">
          Contents
        </span>
      </div>

      <nav
        ref={navRef}
        onPointerDown={(event) => {
          const nav = navRef.current;
          if (event.pointerType !== "mouse" || !nav || nav.scrollWidth <= nav.clientWidth) return;
          dragRef.current = {
            active: true,
            moved: false,
            startX: event.clientX,
            scrollLeft: nav.scrollLeft,
          };
        }}
        onPointerMove={(event) => {
          const nav = navRef.current;
          if (!dragRef.current.active || !nav) return;
          const distance = event.clientX - dragRef.current.startX;
          if (Math.abs(distance) > 4) dragRef.current.moved = true;
          nav.scrollLeft = dragRef.current.scrollLeft - distance;
        }}
        onPointerUp={() => {
          dragRef.current.active = false;
        }}
        onPointerLeave={() => {
          dragRef.current.active = false;
        }}
        onClickCapture={(event) => {
          if (!dragRef.current.moved) return;
          event.preventDefault();
          event.stopPropagation();
          dragRef.current.moved = false;
        }}
        className="relative flex cursor-grab gap-2.5 overflow-x-auto scrollbar-none select-none active:cursor-grabbing lg:cursor-auto lg:select-auto lg:active:cursor-auto lg:max-h-vh-60 lg:flex-col lg:gap-1 lg:overflow-x-visible lg:overflow-y-auto lg:pr-1"
      >
        {items.map((item) => {
          const active = activeId === item.id;
          return (
            <a
              key={item.id}
              id={`toc-${item.id}`}
              href={`#${item.id}`}
              draggable={false}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors duration-300 lg:rounded-md lg:border-transparent lg:px-3 lg:whitespace-normal",
                active
                  ? "border-black bg-black font-semibold text-white lg:bg-secondary/10 lg:text-secondary"
                  : "border-neutral-200 bg-white font-medium text-neutral-600 hover:text-black lg:bg-transparent lg:hover:bg-neutral-100",
              )}
            >
              <ChevronRight
                className={cn(
                  "hidden h-4 w-4 shrink-0 transition-transform duration-200 lg:block",
                  active ? "translate-x-0.5 text-secondary" : "text-neutral-300",
                )}
              />
              <span className="leading-tight">{item.label}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}
