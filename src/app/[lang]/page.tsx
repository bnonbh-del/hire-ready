import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense, type CSSProperties } from "react";
import { ArrowLeft, CircleCheck } from "lucide-react";
import { Faq } from "@/components/faq";
import { FounderCards } from "@/components/founder-cards";
import { HeroSearch } from "@/components/hero-search";
import { InstagramIcon, TelegramIcon } from "@/components/icons";
import { JobCard } from "@/components/job-card";
import { wide } from "@/components/page-hero";
import { ProcessTimeline } from "@/components/process-timeline";
import { RevealGroup } from "@/components/reveal";
import { RevealWords } from "@/components/reveal-words";
import { SectionHead } from "@/components/section-head";
import { buttonPrimary } from "@/components/ui";
import { COMPANY, content } from "@/lib/content";
import { alternatesFor, isLocale, localeOf, localePath, t, type Locale } from "@/lib/i18n";
import { requestTime, todayInBaghdad } from "@/lib/jobs";
import { getFounders, getOpenJobs, getPartners } from "@/lib/public-data";
import { getSettings, toFounderCards } from "@/lib/site";
import { publicImageUrl } from "@/lib/storage";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const locale = localeOf((await params).lang);
  return {
    title: { absolute: COMPANY.nameFull },
    description: content(locale).hero.text,
    alternates: alternatesFor(locale, "/"),
  };
}

/*
 * The home page is for job seekers (companies only get a line on /services).
 * Order: hero + search (navy) -> latest openings -> how to apply -> partner
 * companies -> Telegram channel (navy card) -> FAQ -> the people behind
 * Hire Ready, then the navy footer.
 */
export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = t(lang).home;

  return (
    <main>
      <Hero locale={lang} />

      <section className={`${wide} py-16 md:py-24`} aria-labelledby="latest-jobs">
        <SectionHead id="latest-jobs" title={d.latestJobs} intro={d.latestIntro} link={{ href: localePath(lang, "/jobs"), label: d.allJobs }} />
        <Suspense fallback={<div className="mt-8 h-64 rounded-2xl bg-surface" aria-busy="true" />}>
          <LatestJobs locale={lang} />
        </Suspense>
      </section>

      <section className="bg-surface" aria-labelledby="how-to-apply">
        <div className={`${wide} py-16 md:py-24`}>
          <SectionHead id="how-to-apply" title={d.howToApply} />
          <ProcessTimeline steps={content(lang).applySteps} />
        </div>
      </section>

      <Partners locale={lang} />
      <Channel locale={lang} />

      <section className={`${wide} py-16 md:py-24`} aria-labelledby="faq-title">
        <div className="mx-auto max-w-3xl">
          <Faq locale={lang} />
        </div>
      </section>

      <Founders locale={lang} />
    </main>
  );
}

function Hero({ locale }: { locale: Locale }) {
  const hero = content(locale).hero;
  return (
    <section className="relative isolate overflow-hidden bg-navy text-on-navy">
      <Image
        src="/logo/hr-mark-white.png"
        alt=""
        width={366}
        height={300}
        priority
        className="pointer-events-none absolute -top-10 -z-10 w-[26rem] opacity-[0.07] ltr:-right-24 rtl:-left-24 md:-top-16 md:w-[40rem]"
      />

      <div className={`${wide} pb-16 pt-12 md:pb-24 md:pt-20`}>
        <RevealWords
          as="h1"
          on="load"
          parts={[{ text: hero.before }, { text: hero.highlight, highlight: true }, { text: hero.after }]}
          // 700 is lighter than the old heading font's 800, so the title is a bit bigger (40/60px instead of 36/56).
          // Negative tracking only in English: spacing Arabic letters apart would break their joins.
          className="max-w-4xl text-[2.5rem] font-bold leading-[1.3] ltr:tracking-[-0.02em] md:text-[3.75rem]"
        />
        <p className="mt-5 max-w-2xl text-on-navy-soft md:text-lg">{hero.text}</p>
        <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-on-navy">
          <CircleCheck size={16} className="text-accent-500" aria-hidden="true" />
          {t(locale).home.freeBadge}
        </p>

        <div className="mt-10 max-w-4xl">
          <HeroSearch locale={locale} />
        </div>
      </div>
    </section>
  );
}

async function LatestJobs({ locale }: { locale: Locale }) {
  await connection();
  const now = requestTime();
  const { jobs } = await getOpenJobs({ q: "", department: "", governorate: "", jobType: "", page: 1 }, todayInBaghdad(new Date(now)));
  const latest = jobs.slice(0, 6);

  if (latest.length === 0) {
    return <p className="mt-8 rounded-2xl border border-line bg-surface p-8 text-center text-ink-soft">{t(locale).home.noJobs}</p>;
  }
  return (
    <RevealGroup className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {latest.map((job) => (
        <JobCard key={job.id} job={job} now={now} locale={locale} />
      ))}
    </RevealGroup>
  );
}

/**
 * "منو ورا Hire Ready": the founder cards (duotone photo that turns to colour,
 * name, role, first line of the bio, LinkedIn), then a link to /about.
 * Hidden when there are no founders.
 */
async function Founders({ locale }: { locale: Locale }) {
  const founders = await getFounders();
  if (founders.length === 0) return null;
  const d = t(locale);

  return (
    <section className="bg-surface" aria-labelledby="founders-title">
      <div className={`${wide} py-16 md:py-24`}>
        <SectionHead id="founders-title" title={d.home.founders} />
        <RevealGroup className="mt-10">
          <FounderCards founders={toFounderCards(founders, locale, { firstLineOnly: true })} linkedinLabel={d.about.linkedin} />
        </RevealGroup>
        <div className="mt-10 text-center">
          <Link href={localePath(locale, "/about")} className="group inline-flex items-center gap-1.5 font-medium text-accent-700">
            {d.home.aboutMore}
            <ArrowLeft
              size={18}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:-translate-x-1 ltr:-scale-x-100 ltr:group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

/** From this many partners up, the logos run in a moving strip; fewer sit still, centred. */
const MARQUEE_FROM = 5;

/*
 * Contracted companies' logos: grey until hovered (then in colour), on a
 * light plate that stays readable in dark mode. 5 or more: a continuous strip
 * that pauses on hover; fewer: a still, centred row. None: no section.
 */
async function Partners({ locale }: { locale: Locale }) {
  const partners = await getPartners();
  if (partners.length === 0) return null;
  const d = t(locale).home;
  const moving = partners.length >= MARQUEE_FROM;

  // In the moving strip each half repeats the list until it's wider than a big
  // screen (12 tiles), so the loop never shows a gap.
  const half = moving ? Array.from({ length: Math.ceil(12 / partners.length) }, () => partners).flat() : partners;

  const logos = (copy: number) =>
    half.map((p, i) => {
      const name = (locale === "en" && p.name_en) || p.name;
      return (
        <li
          key={`${copy}-${i}-${p.id}`}
          // Copies that only exist to fill the moving strip (hidden when motion is reduced).
          data-repeat={copy > 0 || i >= partners.length ? "" : undefined}
          title={name}
          className="group flex h-20 w-44 shrink-0 items-center justify-center rounded-2xl border border-line bg-logo-plate px-5"
        >
          {p.logo_path ? (
            <Image
              src={publicImageUrl(p.logo_path)}
              alt={copy === 0 && i < partners.length ? name : ""}
              width={160}
              height={64}
              unoptimized
              className="max-h-12 w-auto object-contain opacity-70 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
            />
          ) : (
            // The plate is light in both themes, so the name uses the fixed navy.
            <span className="text-center text-sm font-bold text-navy">{name}</span>
          )}
        </li>
      );
    });

  return (
    <section className="border-y border-line bg-surface" aria-labelledby="partners-title">
      <div className={`${wide} py-14`}>
        <SectionHead id="partners-title" title={d.partners} link={{ href: localePath(locale, "/partners"), label: d.allPartners }} />
      </div>
      {moving ? (
        <div className="marquee pb-14" dir="ltr">
          {/* The list twice, so the strip loops without a gap; the copy is hidden from screen readers. */}
          <div className="marquee-track gap-4" style={{ "--marquee-duration": `${half.length * 3.5}s` } as CSSProperties}>
            <ul className="flex gap-4">{logos(0)}</ul>
            <ul className="flex gap-4" aria-hidden="true">
              {logos(1)}
            </ul>
          </div>
        </div>
      ) : (
        <RevealGroup as="ul" className={`${wide} flex flex-wrap justify-center gap-4 pb-14`}>
          {logos(0)}
        </RevealGroup>
      )}
    </section>
  );
}

/**
 * "خلي الوظائف توصلك أول بأول": a navy card pointing to the Telegram channel
 * (link from /admin/settings). No channel set: Instagram instead. Neither:
 * the section is left out.
 */
async function Channel({ locale }: { locale: Locale }) {
  const settings = await getSettings();
  const d = t(locale).home;
  const telegram = settings?.telegram_url;
  const instagram = settings?.instagram_url;
  if (!telegram && !instagram) return null;

  const href = (telegram || instagram)!;
  const Icon = telegram ? TelegramIcon : InstagramIcon;

  return (
    <section className={`${wide} pt-16 md:pt-24`} aria-labelledby="channel-title">
      <RevealGroup>
        <div className="reveal rounded-2xl bg-navy p-8 text-on-navy md:p-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-5">
              <Icon size={32} className="mt-1 shrink-0 text-accent-500" />
              <div>
                <h2 id="channel-title" className="text-2xl font-bold md:text-3xl">
                  {d.telegramTitle}
                </h2>
                <p className="mt-3 max-w-xl text-on-navy-soft md:text-lg">{telegram ? d.telegramText : d.instagramText}</p>
              </div>
            </div>
            <a href={href} target="_blank" rel="noopener noreferrer" className={`${buttonPrimary} shrink-0 self-start md:self-center`}>
              <Icon size={20} />
              {telegram ? d.telegramButton : d.instagramButton}
            </a>
          </div>
        </div>
      </RevealGroup>
    </section>
  );
}
