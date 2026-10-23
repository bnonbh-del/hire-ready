import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Building2, ClipboardCheck, GraduationCap, Megaphone, UserSearch, type LucideIcon } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { PageHero, wide } from "@/components/page-hero";
import { ProcessTimeline } from "@/components/process-timeline";
import { RevealGroup } from "@/components/reveal";
import { SectionHead } from "@/components/section-head";
import { buttonSecondary } from "@/components/ui";
import { content } from "@/lib/content";
import { alternatesFor, localeOf, localePath, t } from "@/lib/i18n";
import { getServices } from "@/lib/public-data";
import { getSettings, hiringHref } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/services">): Promise<Metadata> {
  const locale = localeOf((await params).lang);
  const d = t(locale).services;
  return { title: d.metaTitle, description: d.metaDescription, alternates: alternatesFor(locale, "/services") };
}

/** Outline icon per service, picked by its English name; Briefcase if none matches. */
function serviceIcon(titleEn: string | null): LucideIcon {
  const name = (titleEn ?? "").toLowerCase();
  if (name.includes("recruit")) return UserSearch;
  if (name.includes("hr")) return ClipboardCheck;
  if (name.includes("training")) return GraduationCap;
  if (name.includes("pr")) return Megaphone;
  return Briefcase;
}

export default async function ServicesPage({ params }: PageProps<"/[lang]/services">) {
  const locale = localeOf((await params).lang);
  const d = t(locale);
  const copy = content(locale);
  const [services, settings] = await Promise.all([getServices(), getSettings()]);
  const hiring = hiringHref(settings, locale);
  const external = hiring.startsWith("http");

  return (
    <main>
      <PageHero title={d.services.heading} intro={<p>{copy.servicesNote}</p>}>
        {/* The only place on the site that speaks to companies. */}
        <p className="mt-6 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-on-navy/25 px-4 py-2 text-sm">
          <Building2 size={16} className="text-accent-500" aria-hidden="true" />
          {d.services.forCompanies}
          <a
            href={hiring}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="inline-flex items-center gap-1 font-bold text-on-navy underline decoration-accent-500 underline-offset-4 hover:decoration-2"
          >
            <WhatsAppIcon size={16} />
            {d.services.forCompaniesLink}
          </a>
        </p>
      </PageHero>

      {/* Services */}
      <section className={`${wide} py-16 md:py-24`} aria-label={d.services.heading}>
        <RevealGroup className="grid gap-5 md:grid-cols-2">
          {services.map((s) => {
            const Icon = serviceIcon(s.title_en);
            const title = locale === "en" ? s.title_en || s.title : s.title;
            const description = locale === "en" ? s.description_en : s.description;
            return (
              <article key={s.id} className="reveal card-lift rounded-2xl p-6 md:p-8">
                <h2 className="flex items-center gap-3 text-xl font-semibold">
                  <Icon size={24} strokeWidth={1.75} className="shrink-0 text-brand-700" aria-hidden="true" />
                  {title}
                </h2>
                {description && <p className="mt-3 leading-8 text-ink-soft">{description}</p>}
              </article>
            );
          })}
        </RevealGroup>
      </section>

      {/* How we work, on navy */}
      <section className="bg-navy py-16 text-on-navy md:py-24" aria-labelledby="process-title">
        <div className={wide}>
          <SectionHead id="process-title" title={d.home.process} onNavy />
          <ProcessTimeline steps={copy.process} onNavy />
        </div>
      </section>

      {/* Why Hire Ready */}
      <section className={`${wide} py-16 md:py-24`} aria-labelledby="why-title">
        <SectionHead id="why-title" title={d.services.why} />
        <RevealGroup as="ul" className="mt-8 grid gap-x-10 sm:grid-cols-2">
          {copy.whyUs.points.map((point) => (
            <li key={point.title} className="reveal border-t border-line py-5">
              <h3 className="font-semibold">{point.title}</h3>
              <p className="mt-1 text-ink-soft">{point.text}</p>
            </li>
          ))}
        </RevealGroup>
        <p className="mt-8 font-display text-xl font-bold">{copy.whyUs.note}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={localePath(locale, "/contact")} className={buttonSecondary}>
            {d.services.contact}
          </Link>
        </div>
      </section>
    </main>
  );
}
