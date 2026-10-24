"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DROPDOWN_CLOSE_DELAY = 100;

export function useHeaderMenu(pathname: string | null) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const desktopNavRef = useRef<HTMLElement>(null);

  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const closeAll = useCallback(() => {
    setMobileOpen(false);
    setOpenDropdownId(null);
    clearHoverTimeout();
  }, []);

  const openDropdown = useCallback((id: string) => {
    clearHoverTimeout();
    setOpenDropdownId(id);
  }, []);

  const scheduleCloseDropdown = useCallback(() => {
    clearHoverTimeout();
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenDropdownId(null);
      hoverTimeoutRef.current = null;
    }, DROPDOWN_CLOSE_DELAY);
  }, []);

  const toggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const toggleDropdown = useCallback((id: string) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  }, []);

  // Close everything on route change
  useEffect(() => {
    closeAll();
  }, [pathname, closeAll]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Outside click + Escape key
  useEffect(() => {
    if (!mobileOpen && !openDropdownId) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        mobileOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        mobileToggleRef.current &&
        !mobileToggleRef.current.contains(target)
      ) {
        setMobileOpen(false);
        setOpenDropdownId(null);
      }

      if (
        openDropdownId &&
        desktopNavRef.current &&
        !desktopNavRef.current.contains(target)
      ) {
        setOpenDropdownId(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen, openDropdownId, closeAll]);

  // Cleanup hover timeout on unmount
  useEffect(() => () => clearHoverTimeout(), []);

  return {
    mobileOpen,
    openDropdownId,
    closeAll,
    openDropdown,
    scheduleCloseDropdown,
    toggleMobile,
    toggleDropdown,
    mobileMenuRef,
    mobileToggleRef,
    desktopNavRef,
  };
}
