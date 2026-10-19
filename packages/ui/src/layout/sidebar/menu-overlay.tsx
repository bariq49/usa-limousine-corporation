"use client";

import { createPortal } from "react-dom";

export function MenuOverlayPortal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 h-full w-full flex-1 rounded-md bg-black/60 backdrop-blur-xs"
    />,
    document.body,
  );
}
