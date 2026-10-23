import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { Briefcase, CalendarClock, CircleAlert, Clock, MapPin, UsersRound, Wallet } from "lucide-react";
import { Bidi } from "@/components/bidi";
import { CoverImage } from "@/components/cover-image";
import { OtherLanguageNote, PageHero } from "@/components/page-hero";
import { RevealGroup } from "@/components/reveal";
import { ShareButtons } from "@/components/share-buttons";
import { StickyApplyBar } from "@/components/sticky-apply-bar";
import { buttonPrimary } from "@/components/ui";
import { COMPANY } from "@/lib/content";
import { env } from "@/lib/env";
import { alternatesFor, genderLabel, jobTypeLabel, localeOf, localePath, t, type Locale } from "@/lib/i18n";
import { hasEnglish, jobText, type JobText } from "@/lib/job-display";
import {
  formatDate,
  generatedCoverUrl,
  getPublishedJob,
  isAcceptingApplications,
  jobCoverUrl,
  jobUrl,
  todayInBaghdad,
  type PublicJob,
} from "@/lib/jobs";

const wide = "mx-auto w-full max-w-5xl px-4";

function previewDescription(view: JobText, job: PublicJob, locale: Locale): string {
  const facts = `${view.companyLine} · ${view.location} · ${jobTypeLabel(job.job_type, locale)}`;
  const intro = view.intro?.replace(/\s+/g, " ");
  if (!intro) return facts;
  return intro.length > 160 ? `${intro.slice(0, 160).trimEnd()}…` : intro;
}

export async function generateMetadata({ params }: PageProps<"/[lang]/jobs/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = localeOf(lang);
  const job = await getPublishedJob(slug);
  // Here (not only in the page body) so link-preview bots get a real 404 status.
  if (!job) notFound();

  // jobText() shows "لأحد عملاء Hire Ready" / "A Hire Ready client" for hidden companies; the real name never gets here.
  const view = jobText(job, locale);
  const title = job.hide_company ? view.title : `${view.title} - ${view.company}`;
  const description = previewDescription(view, job, locale);
  const image = { url: jobCoverUrl(job, locale), width: 1200, height: 630, alt: view.title };
  const path = `/jobs/${slug}`;

  return {
    title,
    description,
    // The English URL is only a separate version when the job has English.
    alternates: hasEnglish(job) ? alternatesFor(locale, path) : { canonical: path },
    openGraph: {
      type: "website",
      url: localePath(locale, path),
      siteName: COMPANY.name,
      locale: view.lang === "en" ? "en_US" : "ar_IQ",
      title,
      description,
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}

// The slug is only known per request, so everything that reads it renders inside <Suspense>.
export default function JobPage({ params }: PageProps<"/[lang]/jobs/[slug]">) {
  return (
    <Suspense fallback={<JobSkeleton />}>
      <JobDetails params={params} />
    </Suspense>
  );
}

async function JobDetails({ params }: Pick<PageProps<"/[lang]/jobs/[slug]">, "params">) {
  const { lang, slug } = await params;
  const locale = localeOf(lang);
  const job = await getPublishedJob(slug);
  if (!job) notFound();

  const d = t(locale);
  const view = jobText(job, locale);
  // Content written by the admin keeps its own language and direction.
  const own = { lang: view.lang, dir: view.dir } as const;
  const link = jobUrl(env.siteUrl, job.slug, locale);

  const facts = [
    { icon: <MapPin />, label: d.job.location, value: view.location, own: true },
    { icon: <Clock />, label: d.job.hours, value: view.workHours, own: true },
    { icon: <Wallet />, label: d.job.salary, value: view.salary, own: true },
    { icon: <Briefcase />, label: d.job.type, value: jobTypeLabel(job.job_type, locale), own: false },
    { icon: <UsersRound />, label: d.job.gender, value: job.gender ? genderLabel(job.gender, locale) : null, own: false },
    { icon: <CalendarClock />, label: d.job.deadline, value: job.deadline ? formatDate(job.deadline, locale) : null, own: false },
  ].filter((f): f is typeof f & { value: string } => Boolean(f.value?.trim()));

  const status = { slug: job.slug, status: job.status, deadline: job.deadline, locale };

  return (
    <main>
      {/* 1-2. Title, company, location, apply, intro, on navy */}
      <PageHero
        heading={
          <>
            {view.fallback && <OtherLanguageNote text={d.otherLanguageOnly} />}
            <div {...own}>
              <h1 className="max-w-4xl text-[2rem] font-bold leading-tight md:text-5xl">
                <Bidi text={view.title} />
              </h1>
              <p className="mt-4 text-lg text-on-navy-soft">
                <Bidi text={view.companyLine} />
              </p>
            </div>
          </>
        }
      >
        <p className="mt-2 flex items-center gap-1.5 text-on-navy-soft" {...own}>
          <MapPin size={18} className="shrink-0 text-accent-500" aria-hidden="true" />
          {view.location}
        </p>
        <div className="mt-7">
          <Suspense fallback={<div className="h-12" />}>
            <ApplyCta {...status} variant="top" />
          </Suspense>
        </div>
        {view.intro && (
          <p className="mt-8 max-w-3xl whitespace-pre-line text-lg leading-8 text-on-navy-soft" {...own}>
            <Bidi text={view.intro} />
          </p>
        )}
      </PageHero>

      {/* 3. Cover, rising over the navy band */}
      <div className={`${wide} -mt-6 md:-mt-10`}>
        <RevealGroup>
          <div className="reveal-zoom overflow-hidden rounded-2xl border border-line">
            <CoverImage
              src={jobCoverUrl(job, locale)}
              fallbackSrc={generatedCoverUrl(job, locale)}
              className="aspect-[1200/630] w-full object-cover"
            />
          </div>
        </RevealGroup>
      </div>

      {/* 4. Facts */}
      {facts.length > 0 && (
        <section aria-label={d.job.factsLabel} className="mt-12 bg-surface py-12 md:py-16">
          <RevealGroup className={`${wide} grid gap-5 sm:grid-cols-2 lg:grid-cols-3`}>
            {facts.map((fact) => (
              <div key={fact.label} className="reveal flex items-start gap-3 rounded-xl border border-line bg-card px-5 py-4">
                <span className="flex shrink-0 pt-1 text-brand-700 [&>svg]:size-5" aria-hidden="true">
                  {fact.icon}
                </span>
                <div>
                  <h2 className="text-sm font-normal text-muted">{fact.label}</h2>
                  <p className="mt-0.5 font-medium" {...(fact.own ? own : {})}>
                    <Bidi text={fact.value} />
                  </p>
                </div>
              </div>
            ))}
          </RevealGroup>
        </section>
      )}

      {/* 5. Content cards */}
      <RevealGroup className={`${wide} space-y-6 py-12 md:py-16`}>
        {view.description && (
          <ContentCard title={d.job.about}>
            <p className="whitespace-pre-line px-6 pb-6 leading-8" {...own}>
              <Bidi text={view.description} />
            </p>
          </ContentCard>
        )}
        <ListCard title={d.job.responsibilities} items={view.responsibilities} own={own} />
        <ListCard title={d.job.requirements} items={view.requirements} own={own} />
        <ListCard title={d.job.benefits} items={view.benefits} own={own} />
      </RevealGroup>

      {/* 6. Apply + share */}
      <section className={`${wide} flex flex-col items-center pb-16 text-center md:pb-24`}>
        <Suspense fallback={<div className="h-14" />}>
          <ApplyCta {...status} variant="bottom" />
        </Suspense>
        <ShareButtons url={link} title={view.title} locale={locale} className="mt-6 justify-center" />
      </section>

      {/* 7. Fixed apply button on phones */}
      <Suspense fallback={null}>
        <ApplyCta {...status} variant="sticky" />
      </Suspense>
    </main>
  );
}

/** "قدّم الآن" / "Apply now", or a closed notice. Depends on today's date, so it renders per request. */
async function ApplyCta({
  slug,
  status,
  deadline,
  locale,
  variant,
}: Pick<PublicJob, "slug" | "status" | "deadline"> & { locale: Locale; variant: "top" | "bottom" | "sticky" }) {
  await connection();
  const d = t(locale).job;
  const today = todayInBaghdad();
  const href = localePath(locale, `/jobs/${slug}/apply`);

  if (!isAcceptingApplications({ status, deadline }, today)) {
    if (variant === "sticky") return null;
    const deadlinePassed = status === "open" && deadline !== null && deadline < today;
    return (
      <p
        className={`inline-flex items-start gap-2 rounded-xl border px-4 py-3 ${
          variant === "top" ? "border-on-navy/25 text-on-navy-soft" : "border-line bg-surface text-ink-soft"
        }`}
        role={variant === "top" ? "status" : undefined}
      >
        <CircleAlert size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
        {deadlinePassed ? d.deadlinePassed : d.closed}
      </p>
    );
  }

  // Shown on phones between the two buttons below (see StickyApplyBar).
  if (variant === "sticky") return <StickyApplyBar href={href} label={d.apply} />;

  return (
    <Link
      id={variant === "top" ? "apply-top" : "apply-bottom"}
      href={href}
      className={`${buttonPrimary} ${variant === "bottom" ? "px-12 py-4 text-lg" : ""}`}
    >
      {d.apply}
    </Link>
  );
}

function ContentCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="reveal overflow-hidden rounded-2xl border border-line bg-card">
      <h2 className="px-6 pb-4 pt-6 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function ListCard({ title, items, own }: { title: string; items: string[]; own: { lang: Locale; dir: "rtl" | "ltr" } }) {
  if (items.length === 0) return null;
  return (
    <ContentCard title={title}>
      <ul className="space-y-3 px-6 pb-6" {...own}>
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 leading-7">
            <span className="mt-2.5 size-2 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
            <span>
              <Bidi text={item} />
            </span>
          </li>
        ))}
      </ul>
    </ContentCard>
  );
}

function JobSkeleton() {
  return (
    <main aria-busy="true">
      <div className="bg-navy">
        <div className={`${wide} pb-12 pt-10`}>
          <div className="h-10 w-2/3 rounded bg-on-navy/10" />
          <div className="mt-4 h-5 w-1/2 rounded bg-on-navy/10" />
          <div className="mt-6 h-12 w-32 rounded-full bg-on-navy/10" />
        </div>
      </div>
      <div className={`${wide} mt-8`}>
        <div className="aspect-[1200/630] w-full rounded-2xl bg-surface" />
      </div>
    </main>
  );
}
