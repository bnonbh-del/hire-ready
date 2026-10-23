"use client";

import { Moon, Sun } from "lucide-react";
import { THEME_STORAGE_KEY } from "@/components/theme-script";

/*
 * Sun/moon button. The icon and label come from CSS (`dark:`), not React
 * state, so the server HTML is already right for either theme and nothing
 * jumps when the page hydrates.
 */
export function ThemeToggle({
  toDark,
  toLight,
  className = "size-10",
  onNavy = false,
}: {
  toDark: string;
  toLight: string;
  className?: string;
  /** For a navy header (the admin panel). */
  onNavy?: boolean;
}) {
  function toggle() {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    const apply = () => {
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Private mode / storage blocked: the choice just isn't remembered.
      }
    };
    // A soft cross-fade between the two themes where the browser supports it.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (document.startViewTransition && !reduce) document.startViewTransition(apply);
    else apply();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex shrink-0 items-center justify-center rounded-full border transition-colors ${
        onNavy ? "border-on-navy/25 text-on-navy hover:border-accent-500" : "border-line text-ink hover:border-brand-500 hover:text-brand-700"
      } ${className}`}
    >
      <Moon size={18} aria-hidden="true" className="dark:hidden" />
      <Sun size={18} aria-hidden="true" className="hidden dark:block" />
      <span className="sr-only dark:hidden">{toDark}</span>
      <span className="sr-only hidden dark:inline">{toLight}</span>
    </button>
  );
}
