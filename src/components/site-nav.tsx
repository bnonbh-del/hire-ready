"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { barePath, switchLocalePath, type Locale } from "@/lib/i18n";
import type { NavItem } from "@/lib/site";

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  const [current, target] = [barePath(pathname), barePath(href)];
  return target === "/" ? current === "/" : current === target || current.startsWith(`${target}/`);
}

/** Desktop links. `pathname` is null in the prerendered shell (no highlight yet). */
export function DesktopNavLinks({ items, pathname }: { items: NavItem[]; pathname: string | null }) {
  return (
    <ul className="hidden items-center lg:flex">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`nav-link block px-3 py-2 text-sm font-medium transition-colors ${
                active ? "text-brand-700" : "text-ink hover:text-brand-700"
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Reads the current URL, so the header renders it inside <Suspense>. */
export function DesktopNav({ items }: { items: NavItem[] }) {
  return <DesktopNavLinks items={items} pathname={usePathname()} />;
}

const roundButton =
  "flex size-10 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-brand-500 hover:text-brand-700";

/**
 * "EN" / "ع": the same page in the other language. A plain link (full page
 * load, not client navigation) so the browser reads the new <html lang/dir>
 * from scratch; otherwise Chrome may keep offering to translate.
 */
export function LanguageLink({ href, locale, short, label }: { href: string; locale: Locale; short: string; label: string }) {
  const other = locale === "ar" ? "en" : "ar";
  return (
    <a href={href} hrefLang={other} aria-label={label} title={label} className={`${roundButton} text-sm font-bold`}>
      <span lang={other}>{short}</span>
    </a>
  );
}

export function LanguageSwitch({ locale, short, label }: { locale: Locale; short: string; label: string }) {
  const pathname = usePathname();
  return <LanguageLink href={switchLocalePath(pathname, locale === "ar" ? "en" : "ar")} locale={locale} short={short} label={label} />;
}

/** Phones and tablets: a menu button that opens the page links. */
export function MobileMenu({ items, openLabel, closeLabel }: { items: NavItem[]; openLabel: string; closeLabel: string }) {
  const pathname = usePathname();
  // The menu remembers the page it was opened on, so it closes by itself after navigating.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn !== null && openOn === pathname;
  const setOpen = (next: boolean) => setOpenOn(next ? pathname : null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? closeLabel : openLabel}
        onClick={() => setOpen(!open)}
        className={roundButton}
      >
        {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>

      {open && (
        <div id="mobile-menu" className="absolute inset-x-0 top-full z-20 border-b border-line bg-page px-4 pb-5 pt-2 shadow-lg">
          <ul className="mx-auto max-w-6xl divide-y divide-line">
            {items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block py-3 font-medium ${active ? "text-brand-700" : "text-ink"}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
