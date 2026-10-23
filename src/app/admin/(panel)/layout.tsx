import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "../login/actions";
import { AdminNav, AdminNavLinks } from "./admin-nav";

export const metadata: Metadata = {
  title: { default: "لوحة التحكم", template: "%s | لوحة التحكم" },
  robots: { index: false, follow: false },
};

/*
 * Shell for every admin page. It doesn't check the session itself (that would
 * make the whole shell wait); each page calls requireAdmin() inside its own
 * <Suspense>, and the database's RLS refuses non-admins regardless.
 */
export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-dvh bg-surface">
      {/* Navy like the site's hero and footer; the same in light and dark mode. */}
      <header className="relative isolate overflow-hidden bg-navy text-on-navy">
        <Image
          src="/logo/hr-mark-white.png"
          alt=""
          width={366}
          height={300}
          className="pointer-events-none absolute -top-10 -z-10 w-56 opacity-[0.06] ltr:-right-10 rtl:-left-10"
        />
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/admin/applicants" className="flex items-center gap-2.5">
            <Image src="/logo/hr-mark.png" alt="" width={39} height={32} className="h-8 w-auto" />
            <span className="font-display font-bold">لوحة التحكم</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <ThemeToggle toDark="الوضع الليلي" toLight="الوضع النهاري" className="size-9" onNavy />
            <Link href="/" className="text-on-navy-soft hover:text-on-navy">
              الموقع
            </Link>
            <form action={signOut}>
              <button type="submit" className="inline-flex items-center gap-1.5 text-on-navy-soft hover:text-on-navy">
                <LogOut size={16} aria-hidden="true" />
                خروج
              </button>
            </form>
          </div>
        </div>
        <div className="mx-auto w-full max-w-6xl px-4">
          <Suspense fallback={<AdminNavLinks pathname={null} />}>
            <AdminNav />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">{children}</main>
    </div>
  );
}
