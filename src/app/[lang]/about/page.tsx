import type { Metadata } from "next";
import { FounderCards } from "@/components/founder-cards";
import { PageHero, wide } from "@/components/page-hero";
import { RevealGroup } from "@/components/reveal";
import { SectionHead } from "@/components/section-head";
import { COMPANY, content } from "@/lib/content";
import { alternatesFor, localeOf, t } from "@/lib/i18n";
import { getFounders } from "@/lib/public-data";
import { toFounderCards } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const locale = localeOf((await params).lang);
  return {
    title: t(locale).about.metaTitle,
    description: content(locale).about.paragraphs[0],
    alternates: alternatesFor(locale, "/about"),
  };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const locale = localeOf((await params).lang);
  const d = t(locale).about;
  const about = content(locale).about;
  const founders = await getFounders();

  return (
    <main>
      <PageHero title={d.heading} intro={<p>{about.paragraphs[0]}</p>} />

      {/* Who we are + our goal */}
      <section className={`${wide} grid gap-10 py-16 md:py-24 lg:grid-cols-[1.3fr_1fr]`}>
        <RevealGroup className="space-y-5 text-lg leading-9 text-ink-soft">
          {about.paragraphs.slice(1).map((p) => (
            <p key={p} className="reveal">
              {p}
            </p>
          ))}
          <dl className="reveal grid grid-cols-2 gap-4 pt-2">
            <div className="rounded-2xl bg-surface p-5">
              <dt className="text-sm text-muted">{d.founded}</dt>
              <dd className="mt-1 font-display text-2xl font-bold text-brand-700">{COMPANY.founded}</dd>
            </div>
            <div className="rounded-2xl bg-surface p-5">
              <dt className="text-sm text-muted">{d.fields}</dt>
              <dd className="mt-1 font-bold text-ink">{content(locale).fields.join(" · ")}</dd>
            </div>
          </dl>
        </RevealGroup>

        <RevealGroup className="self-start">
          <div className="reveal card-box rounded-2xl p-7 md:p-9">
            <h2 className="text-sm font-semibold text-brand-700">{d.goal}</h2>
            <p className="relative mt-3 font-display text-2xl font-bold leading-[1.6]">{about.goal}</p>
          </div>
        </RevealGroup>
      </section>

      {/* Founders */}
      {founders.length > 0 && (
        <section className="bg-navy py-16 text-on-navy md:py-24" aria-labelledby="founders-title">
          <div className={wide}>
            <SectionHead id="founders-title" title={d.founders} onNavy />
            <RevealGroup className="mt-10">
              <FounderCards founders={toFounderCards(founders, locale)} linkedinLabel={d.linkedin} />
            </RevealGroup>
          </div>
        </section>
      )}
    </main>
  );
}
