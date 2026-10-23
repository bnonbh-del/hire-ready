import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ThemeScript } from "@/components/theme-script";
import { buttonPrimary, buttonSecondary } from "@/components/ui";
import { COMPANY } from "@/lib/content";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

/*
 * 404 for URLs that match no page at all (the site and /admin have separate
 * root layouts, so there is no shared layout to put it in). Arabic, with the
 * English line underneath: the URL doesn't tell us the visitor's language.
 */

export const metadata: Metadata = {
  title: `ما لكينا هالصفحة | ${COMPANY.name}`,
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="ar" dir="rtl" className={fontVariables} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh bg-page font-sans text-ink antialiased">
        <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-start justify-center px-4 py-16">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo/hr-mark.png" alt="" width={44} height={36} className="h-9 w-auto" />
            <span className="font-display font-bold" dir="ltr">
              {COMPANY.name}
            </span>
          </Link>
          <h1 className="mt-10 text-3xl font-bold md:text-4xl">ما لكينا هالصفحة</h1>
          <p className="mt-3 text-ink-soft">يمكن الرابط غلط، أو الوظيفة انشالت.</p>
          <p className="mt-1 text-sm text-muted" lang="en" dir="ltr">
            We couldn&apos;t find that page. The link may be wrong, or the job may have been taken down.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className={buttonPrimary}>
              ارجع للرئيسية
            </Link>
            <Link href="/jobs" className={buttonSecondary}>
              شوف الوظائف المتاحة
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
