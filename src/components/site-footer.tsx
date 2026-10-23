import Image from "next/image";
import Link from "next/link";
import { cacheLife } from "next/cache";
import { Mail, MapPin, Phone } from "lucide-react";
import { SocialIcons } from "@/components/social-icons";
import { COMPANY, content } from "@/lib/content";
import { t, type Locale } from "@/lib/i18n";
import { getPartners } from "@/lib/public-data";
import { getSettings, navItems, socialLinks } from "@/lib/site";

/** Navy footer (the same in light and dark mode). */
export async function SiteFooter({ locale }: { locale: Locale }) {
  const [settings, partners] = await Promise.all([getSettings(), getPartners()]);
  const d = t(locale);
  const copy = content(locale);
  const social = socialLinks(settings, locale);
  const address = locale === "en" ? settings?.address_en || settings?.address : settings?.address;
  const link = "text-on-navy-soft transition-colors hover:text-on-navy";

  return (
    <footer className="site-footer bg-navy text-on-navy">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Image src="/logo/hr-mark.png" alt="" width={49} height={40} className="h-10 w-auto" />
            <span className="leading-tight" dir="ltr">
              <span className="block font-display font-bold">{COMPANY.name}</span>
              <span className="block text-xs text-on-navy-soft">{COMPANY.descriptor}</span>
            </span>
          </div>
          <p className="mt-5 font-display text-lg font-bold">
            {copy.tagline.before}
            {copy.tagline.highlight}
            {copy.tagline.after}
          </p>
          <p className="mt-2 text-sm text-on-navy-soft">
            {copy.fields.join(" · ")}
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">{d.footer.pages}</h2>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            {navItems(partners.length > 0, locale).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={link}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold">{d.footer.contact}</h2>
          <ul className="mt-4 space-y-3 text-[15px]">
            {settings?.phone_primary && (
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="shrink-0 text-accent-500" aria-hidden="true" />
                <a href={`tel:${settings.phone_primary}`} dir="ltr" className={link}>
                  {settings.phone_primary}
                </a>
              </li>
            )}
            {settings?.email && (
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="shrink-0 text-accent-500" aria-hidden="true" />
                <a href={`mailto:${settings.email}`} dir="ltr" className={`${link} break-all`}>
                  {settings.email}
                </a>
              </li>
            )}
            {address && (
              <li className="flex items-center gap-2.5 text-on-navy-soft">
                <MapPin size={16} className="shrink-0 text-accent-500" aria-hidden="true" />
                {address}
              </li>
            )}
          </ul>
        </div>

        {social.length > 0 && (
          <div>
            <h2 className="text-base font-semibold">{d.footer.follow}</h2>
            <div className="mt-4">
              <SocialIcons links={social} onNavy />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-on-navy/10">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-5 text-xs text-on-navy-soft">
          <p>
            <bdi dir="ltr">
              © {await copyrightYears()} {COMPANY.name}
            </bdi>
          </p>
          {/* Low-key way in for the company's staff (the admin is Arabic only). */}
          <Link href="/admin" rel="nofollow" prefetch={false} className={link}>
            {d.footer.admin}
          </Link>
        </div>
      </div>
    </footer>
  );
}

/**
 * "2025" in the founding year, "2025–2026" after it. Cached for a day, so the
 * year moves on by itself without making every page render per request.
 */
async function copyrightYears(): Promise<string> {
  "use cache";
  cacheLife("days");
  const year = new Date().getFullYear();
  return year > COMPANY.founded ? `${COMPANY.founded}–${year}` : String(COMPANY.founded);
}
