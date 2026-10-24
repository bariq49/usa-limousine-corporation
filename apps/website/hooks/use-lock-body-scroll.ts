import { useEffect } from "react";

/** Locks page scroll on mobile only so desktop keeps its scrollbar.
 *  Avoids `position: fixed` on body — that breaks fixed headers. */
export function useLockBodyScroll(locked: boolean, mobileOnly = true) {
  useEffect(() => {
    if (!locked) return;

    const isMobile = window.matchMedia("(max-width: 639px)").matches;
    if (mobileOnly && !isMobile) return;

    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior,
      bodyOverscroll: body.style.overscrollBehavior,
      touchAction: body.style.touchAction,
    };

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";
    body.style.touchAction = "none";

    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      html.style.overscrollBehavior = prev.htmlOverscroll;
      body.style.overscrollBehavior = prev.bodyOverscroll;
      body.style.touchAction = prev.touchAction;
    };
  }, [locked, mobileOnly]);
}
