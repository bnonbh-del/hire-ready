import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { TAGS } from "@/lib/cache-tags";
import { localePath, t, type Locale } from "@/lib/i18n";
import { createPublicClient } from "@/lib/supabase/public";
import type { FounderCardData } from "@/components/founder-cards";
import { publicImageUrl } from "@/lib/storage";
import type { Founder, Settings } from "@/lib/types";

/** Contact details and social links (edited in /admin/settings). Cached; the admin clears it on save. */
export async function getSettings(): Promise<Settings | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.settings);

  const { data } = await createPublicClient().from("settings").select("*").eq("id", 1).maybeSingle();
  return (data as Settings | null) ?? null;
}

export interface SocialLink {
  key: "instagram" | "linkedin" | "whatsapp" | "telegram";
  label: string;
  href: string;
}

/** The social links that are filled in, in display order. Empty ones are left out. */
export function socialLinks(settings: Settings | null, locale: Locale = "ar"): SocialLink[] {
  if (!settings) return [];
  const label = t(locale).social;
  const links: (SocialLink | null)[] = [
    settings.instagram_url ? { key: "instagram", label: label.instagram, href: settings.instagram_url } : null,
    settings.linkedin_url ? { key: "linkedin", label: label.linkedin, href: settings.linkedin_url } : null,
    settings.whatsapp ? { key: "whatsapp", label: label.whatsapp, href: `https://wa.me/${settings.whatsapp}` } : null,
    settings.telegram_url ? { key: "telegram", label: label.telegram, href: settings.telegram_url } : null,
  ];
  return links.filter((l): l is SocialLink => l !== null);
}

/**
 * The link for companies that need to hire (only on the services page: the
 * site is written for job seekers). WhatsApp with a ready message, or the
 * contact page if no number is set.
 */
export function hiringHref(settings: Settings | null, locale: Locale = "ar"): string {
  if (!settings?.whatsapp) return localePath(locale, "/contact");
  return `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(t(locale).hiringMessage)}`;
}

export interface NavItem {
  href: string;
  label: string;
}

/**
 * Main navigation. "شركاؤنا" only appears when there are partner companies to
 * show. The header leaves out "الوظائف" (`withJobs: false`): its main button
 * already goes there.
 */
export function navItems(hasPartners: boolean, locale: Locale = "ar", { withJobs = true } = {}): NavItem[] {
  const nav = t(locale).nav;
  const items: NavItem[] = [
    { href: "/", label: nav.home },
    ...(withJobs ? [{ href: "/jobs", label: nav.jobs }] : []),
    { href: "/services", label: nav.services },
    { href: "/about", label: nav.about },
    ...(hasPartners ? [{ href: "/partners", label: nav.partners }] : []),
    { href: "/contact", label: nav.contact },
  ];
  return items.map((item) => ({ ...item, href: localePath(locale, item.href) }));
}

/** Founders as the cards show them, in the page language (English fields fall back to Arabic). */
export function toFounderCards(founders: Founder[], locale: Locale, { firstLineOnly = false } = {}): FounderCardData[] {
  return founders.map((f) => {
    const bio = (locale === "en" ? f.bio_en : f.bio)?.trim() || null;
    return {
      id: f.id,
      name: (locale === "en" && f.name_en) || f.name,
      role: (locale === "en" && f.role_en) || f.role,
      bio: bio && firstLineOnly ? bio.split(/\r?\n/)[0].trim() : bio,
      linkedin: f.linkedin_url,
      photo: f.photo_path ? publicImageUrl(f.photo_path) : null,
      duotone: f.photo_duotone_path ? publicImageUrl(f.photo_duotone_path) : null,
    };
  });
}
