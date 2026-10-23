"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonPrimary } from "@/components/ui";

/**
 * Phones only: a fixed "قدّم الآن" bar that appears once the top apply button
 * has scrolled off screen, and goes away again as soon as the bottom apply
 * button comes into view (so it never sits on top of the footer).
 * Expects elements with ids `apply-top` and `apply-bottom` on the page.
 */
export function StickyApplyBar({ href, label }: { href: string; label: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const top = document.getElementById("apply-top");
    const bottom = document.getElementById("apply-bottom");
    if (!top || !bottom) return;

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const topGone = top.getBoundingClientRect().bottom <= 0;
        const bottomReached = bottom.getBoundingClientRect().top < window.innerHeight;
        setShow(topGone && !bottomReached);
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      data-sticky-apply
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-10 border-t border-line bg-page/90 px-4 py-3 backdrop-blur-md md:hidden ${show ? "" : "hidden"}`}
    >
      <Link href={href} className={`${buttonPrimary} w-full`} tabIndex={show ? undefined : -1}>
        {label}
      </Link>
    </div>
  );
}
