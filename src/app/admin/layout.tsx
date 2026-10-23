import type { Metadata } from "next";
import { ThemeScript } from "@/components/theme-script";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";

/* Root layout of the admin panel (Arabic only). Same theme and fonts as the site. */

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="ar" dir="rtl" className={fontVariables} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh bg-page font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
