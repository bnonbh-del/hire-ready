"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/applicants", label: "المتقدمين" },
  { href: "/admin/jobs", label: "الوظائف" },
  { href: "/admin/companies", label: "الشركات المتعاقدة" },
  { href: "/admin/founders", label: "المؤسسين" },
  { href: "/admin/settings", label: "الإعدادات" },
];

/** The links, with `pathname` (if known) deciding which one is highlighted. */
export function AdminNavLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="أقسام لوحة التحكم" className="flex gap-1.5 overflow-x-auto overflow-y-hidden pb-3">
      {LINKS.map((link) => {
        const active = pathname?.startsWith(link.href) ?? false;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active ? "bg-on-navy text-navy" : "text-on-navy-soft hover:bg-on-navy/10 hover:text-on-navy"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Reads the current URL, so the layout renders it inside <Suspense> (see layout.tsx). */
export function AdminNav() {
  return <AdminNavLinks pathname={usePathname()} />;
}
