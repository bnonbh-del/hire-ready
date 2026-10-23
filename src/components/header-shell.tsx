"use client";

import { useEffect, useRef, type ReactNode } from "react";

/*
 * The sticky header. Once the page scrolls it gets smaller and see-through
 * with a blur (globals.css `.site-header[data-scrolled]` + backdrop-blur here). The
 * attribute is set on the element directly: no re-render on every scroll.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      header.dataset.scrolled = String(window.scrollY > 12);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header ref={ref} data-scrolled="false" className="site-header sticky top-0 z-30 border-b border-transparent bg-page data-[scrolled=true]:backdrop-blur-md">
      {children}
    </header>
  );
}
