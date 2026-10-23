"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";

/*
 * Children marked `reveal` fade in and rise 12px as they scroll into view,
 * 400ms, 80ms apart, once (`reveal-zoom`: images, fade only).
 *
 * The hidden starting state only applies when JavaScript runs (the `js` class
 * the root layout sets before paint), so content is never hidden without JS.
 * Reduced-motion users get everything in place immediately (globals.css).
 */
export function RevealGroup({ children, className, as: Tag = "div" }: { children: ReactNode; className?: string; as?: "div" | "section" | "ol" | "ul" }) {
  const ref = useRef<HTMLElement>(null);
  // Typed as one tag: React only needs a DOM element for the ref.
  const Element = Tag as "div";

  useEffect(() => {
    const items = Array.from(ref.current?.querySelectorAll<HTMLElement>(":is(.reveal, .reveal-zoom):not(.is-revealed)") ?? []);
    if (items.length === 0) return;

    const show = (el: HTMLElement, delayMs: number) => {
      el.style.transitionDelay = `${delayMs}ms`;
      el.classList.add("is-revealed");
      // Drop the stagger delay once it has played, so hover effects respond at once.
      window.setTimeout(() => el.style.removeProperty("transition-delay"), delayMs + 50);
    };

    // On a first load that took over 3s, the CSS fallback has already shown the
    // cards; don't hide them again. (Once armed, later in-app visits animate.)
    const root = document.documentElement;
    const fallbackFired = !root.classList.contains("reveal-ready") && performance.now() > 3000;
    if (!("IntersectionObserver" in window) || fallbackFired) {
      items.forEach((el) => show(el, 0));
      return;
    }
    root.classList.add("reveal-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        // Cards that arrive together come in one after another, in page order.
        entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target as HTMLElement)
          .sort((a, b) => items.indexOf(a) - items.indexOf(b))
          .forEach((el, i) => {
            show(el, i * 80);
            observer.unobserve(el);
          });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <Element ref={ref as RefObject<HTMLDivElement>} className={className}>
      {children}
    </Element>
  );
}
