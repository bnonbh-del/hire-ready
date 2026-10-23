import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { HeaderShell } from "@/components/header-shell";
import { DesktopNav, DesktopNavLinks, LanguageLink, LanguageSwitch, MobileMenu } from "@/components/site-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonPrimarySmall } from "@/components/ui";
import { COMPANY } from "@/lib/content";
import { localePath, t, type Locale } from "@/lib/i18n";
import { getPartners } from "@/lib/public-data";
import { navItems } from "@/lib/site";

export async function SiteHeader({ locale }: { locale: Locale }) {
  const partners = await getPartners();
  const d = t(locale);
  const items = navItems(partners.length > 0, locale, { withJobs: false });
  const other = locale === "ar" ? "en" : "ar";

  return (
    <HeaderShell>
      <nav aria-label={d.navLabel} className="header-inner mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href={localePath(locale, "/")} className="flex shrink-0 items-center gap-2.5">
          <Image src="/logo/hr-mark.png" alt="" width={44} height={36} className="h-9 w-auto" priority />
          {/* The name hides on the narrowest phones so the header buttons still fit. */}
          <span className="leading-tight max-[479px]:sr-only">
            <span className="block font-display font-bold text-ink" dir="ltr">
              {COMPANY.name}
            </span>
            <span className="hidden text-xs text-muted sm:block" dir="ltr">
              {COMPANY.descriptor}
            </span>
          </span>
        </Link>

        <Suspense fallback={<DesktopNavLinks items={items} pathname={null} />}>
          <DesktopNav items={items} />
        </Suspense>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Suspense
            fallback={<LanguageLink href={localePath(other, "/")} locale={locale} short={d.languageSwitch.short} label={d.languageSwitch.label} />}
          >
            <LanguageSwitch locale={locale} short={d.languageSwitch.short} label={d.languageSwitch.label} />
          </Suspense>
          <ThemeToggle toDark={d.theme.toDark} toLight={d.theme.toLight} />
          {/* Visible on every screen size: the site is for job seekers, so this is its main action. */}
          <Link href={localePath(locale, "/jobs")} className={`${buttonPrimarySmall} whitespace-nowrap`}>
            {d.jobsCta}
          </Link>
          <Suspense fallback={<div className="size-10 lg:hidden" />}>
            <MobileMenu items={items} openLabel={d.openMenu} closeLabel={d.closeMenu} />
          </Suspense>
        </div>
      </nav>
    </HeaderShell>
  );
}
