import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { ArrowRight, CircleAlert } from "lucide-react";
import { Bidi } from "@/components/bidi";
import { OtherLanguageNote, PageHero } from "@/components/page-hero";
import { textLink } from "@/components/ui";
import { daysText, localeOf, localePath, t, type Locale } from "@/lib/i18n";
import { jobText, type JobText } from "@/lib/job-display";
import { getPublishedJob, isAcceptingApplications, todayInBaghdad, type PublicJob } from "@/lib/jobs";
import { ApplyForm } from "./apply-form";

const wide = "mx-auto w-full max-w-5xl px-4";

export async function generateMetadata({ params }: PageProps<"/[lang]/jobs/[slug]/apply">): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = localeOf(lang);
  const job = await getPublishedJob(slug);
  if (!job) notFound();
  return {
    title: t(locale).apply.metaTitle(jobText(job, locale).title),
    robots: { index: false },
  };
}

// The slug is only known per request, so everything that reads it renders inside <Suspense>.
export default function ApplyPage({ params }: PageProps<"/[lang]/jobs/[slug]/apply">) {
  return (
    <Suspense fallback={<div className="h-96 bg-navy" aria-busy="true" />}>
      <ApplyContent params={params} />
    </Suspense>
  );
}

async function ApplyContent({ params }: Pick<PageProps<"/[lang]/jobs/[slug]/apply">, "params">) {
  const { lang, slug } = await params;
  const locale = localeOf(lang);
  const job = await getPublishedJob(slug);
  if (!job) notFound();

  await connection();
  const accepting = isAcceptingApplications(job, todayInBaghdad());
  const d = t(locale);
  const view = jobText(job, locale);

  return (
    <main>
      <PageHero
        heading={
          <>
            {view.fallback && <OtherLanguageNote text={d.otherLanguageOnly} />}
            <h1 className="max-w-4xl text-[1.75rem] font-bold leading-snug md:text-4xl">
              {d.apply.heading}{" "}
              <span lang={view.lang} dir={view.dir} className="text-highlight">
                <Bidi text={view.title} />
              </span>
            </h1>
          </>
        }
      >
        <MobileSummary view={view} job={job} locale={locale} />
      </PageHero>

      {/* Form first in the page order: on the start side from tablet width up, card below it on phones. */}
      <div className={`${wide} grid items-start gap-8 pb-16 pt-10 md:grid-cols-[minmax(0,1fr)_17rem] md:pb-24 lg:grid-cols-[minmax(0,1fr)_20rem]`}>
        <div>
          {accepting ? (
            <ApplyForm slug={slug} jobTitle={view.title} locale={locale} />
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4" role="status">
              <CircleAlert size={20} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />
              <p className="text-ink-soft">{d.job.closed}</p>
            </div>
          )}
        </div>
        <JobSummaryCard view={view} job={job} locale={locale} />
      </div>
    </main>
  );
}

/**
 * Phones only (the full card is below the form there; from tablet width it sits beside it): one line such as
 * "نرد خلال يومين · مكالمة هاتفية ثم مقابلة حضورية". Empty parts are left out.
 */
function MobileSummary({ view, job, locale }: { view: JobText; job: PublicJob; locale: Locale }) {
  const d = t(locale).apply;
  const parts = [
    job.response_days ? d.respondWithin(daysText(job.response_days, locale)) : null,
    view.hiringStages.length > 0 && !view.fallback ? view.hiringStages.join(d.then) : null,
  ].filter((p): p is string => Boolean(p));
  if (parts.length === 0) return null;
  return (
    <p className="mt-3 text-sm text-on-navy-soft md:hidden">
      <Bidi text={parts.join(" · ")} />
    </p>
  );
}

function JobSummaryCard({ view, job, locale }: { view: JobText; job: PublicJob; locale: Locale }) {
  const d = t(locale).apply;
  const own = { lang: view.lang, dir: view.dir } as const;

  return (
    <aside aria-label={d.summaryLabel} className="card-box rounded-2xl p-5 md:sticky md:top-24">
      <div {...own}>
        <h2 className="text-lg font-semibold leading-snug">
          <Bidi text={view.title} />
        </h2>
        <p className="mt-1 text-ink-soft">
          <Bidi text={view.company} />
        </p>
        <p className="text-sm text-muted">{view.location}</p>
      </div>

      {job.response_days && (
        <p className="mt-5 border-t border-line pt-4 font-medium">{d.respondWithin(daysText(job.response_days, locale))}</p>
      )}

      {view.hiringStages.length > 0 && (
        <div className="mt-5 border-t border-line pt-4">
          <h3 className="font-semibold">{d.stages}</h3>
          <ol className="mt-3 space-y-3" {...own}>
            {view.hiringStages.map((stage, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
                  {i + 1}
                </span>
                <span className="pt-0.5">
                  <Bidi text={stage} />
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {job.offer_days && <p className="mt-5 border-t border-line pt-4 text-ink-soft">{d.offerWithin(daysText(job.offer_days, locale))}</p>}

      <Link href={localePath(locale, `/jobs/${job.slug}`)} className={`group mt-5 flex w-full items-center gap-1.5 border-t border-line pt-4 text-sm ${textLink}`}>
        <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-1 ltr:rotate-180 ltr:group-hover:-translate-x-1" />
        {d.back}
      </Link>
    </aside>
  );
}
