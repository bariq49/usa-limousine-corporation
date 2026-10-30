"use client";

import { createPortal } from "react-dom";
import { cn } from "../../utils/cn";

export function MenuOverlayPortal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      onClick={isOpen ? onClose : undefined}
      aria-hidden={!isOpen}
      className={cn(
        "fixed inset-0 z-55 h-full w-full bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-out",
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
    />,
    document.body,
  );
}
