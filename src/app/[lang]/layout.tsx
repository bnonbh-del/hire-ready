import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeScript } from "@/components/theme-script";
import { COMPANY, content } from "@/lib/content";
import { fontVariables } from "@/lib/fonts";
import { LOCALES, dirOf, isLocale } from "@/lib/i18n";
import "../globals.css";

/*
 * Root layout of the public site, one per language: Arabic at /… (proxy.ts
 * rewrites it to /ar/…) and English at /en/…. /admin has its own root layout.
 */

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "ar";
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: { default: COMPANY.nameFull, template: `%s | ${COMPANY.name}` },
    description: content(locale).about.paragraphs[0],
  };
}

export default async function SiteLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    // suppressHydrationWarning: ThemeScript sets data-theme and the `js` class before React loads.
    <html lang={lang} dir={dirOf(lang)} className={fontVariables} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh bg-page font-sans text-ink antialiased">
        <SiteHeader locale={lang} />
        {/* Pages cross-fade into each other when navigating (where the browser supports it). */}
        <ViewTransition>{children}</ViewTransition>
        <SiteFooter locale={lang} />
      </body>
    </html>
  );
}
