import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { JobCard } from "@/components/job-card";
import { JobSearchForm } from "@/components/job-search-form";
import { PageHero, wide } from "@/components/page-hero";
import { RevealGroup } from "@/components/reveal";
import { buttonSmallSecondary, textLink } from "@/components/ui";
import { alternatesFor, jobsCountText, localeOf, localePath, t, type Locale } from "@/lib/i18n";
import { requestTime, todayInBaghdad } from "@/lib/jobs";
import { JOBS_PAGE_SIZE, getOpenJobs, parseJobFilters, type JobFilters } from "@/lib/public-data";

export async function generateMetadata({ params }: PageProps<"/[lang]/jobs">): Promise<Metadata> {
  const locale = localeOf((await params).lang);
  const d = t(locale).jobs;
  return { title: d.metaTitle, description: d.metaDescription, alternates: alternatesFor(locale, "/jobs") };
}

export default async function JobsPage({ params, searchParams }: PageProps<"/[lang]/jobs">) {
  const locale = localeOf((await params).lang);
  const d = t(locale).jobs;

  return (
    <main>
      <PageHero title={d.heading} intro={d.intro}>
        <div className="mt-8">
          <Suspense fallback={<div className="h-40 rounded-2xl bg-card" aria-busy="true" />}>
            <Filters searchParams={searchParams} locale={locale} />
          </Suspense>
        </div>
      </PageHero>

      <section className={`${wide} pb-16 pt-10 md:pb-24`} aria-labelledby="results-title">
        <h2 id="results-title" className="sr-only">
          {d.results}
        </h2>
        <Suspense fallback={<div className="h-64 rounded-2xl bg-surface" aria-busy="true" />}>
          <JobsResults searchParams={searchParams} locale={locale} />
        </Suspense>
      </section>
    </main>
  );
}

async function Filters({ searchParams, locale }: Pick<PageProps<"/[lang]/jobs">, "searchParams"> & { locale: Locale }) {
  const filters = parseJobFilters(await searchParams);
  return <JobSearchForm values={filters} locale={locale} />;
}

function pageHref(locale: Locale, filters: JobFilters, page: number) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.department) params.set("dept", filters.department);
  if (filters.governorate) params.set("gov", filters.governorate);
  if (filters.jobType) params.set("type", filters.jobType);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  const base = localePath(locale, "/jobs");
  return query ? `${base}?${query}` : base;
}

async function JobsResults({ searchParams, locale }: Pick<PageProps<"/[lang]/jobs">, "searchParams"> & { locale: Locale }) {
  const d = t(locale).jobs;
  const filters = parseJobFilters(await searchParams);
  await connection();
  const now = requestTime();
  const { jobs, total } = await getOpenJobs(filters, todayInBaghdad(new Date(now)));
  const pages = Math.max(1, Math.ceil(total / JOBS_PAGE_SIZE));
  const filtered = Boolean(filters.q || filters.department || filters.governorate || filters.jobType);

  if (jobs.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-10 text-center">
        <p className="font-display text-lg font-bold">{filters.page > 1 ? d.emptyPage : filtered ? d.emptyFiltered : d.empty}</p>
        {(filtered || filters.page > 1) && (
          <Link href={localePath(locale, "/jobs")} className={`mt-3 inline-block ${textLink}`}>
            {d.clearAll}
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      <p className="font-display text-lg font-bold text-ink-soft" aria-live="polite">
        {jobsCountText(total, locale)}
      </p>

      <RevealGroup className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} now={now} locale={locale} />
        ))}
      </RevealGroup>

      {pages > 1 && (
        <nav aria-label={d.pages} className="mt-10 flex items-center justify-between gap-3 text-sm">
          <span className="text-ink-soft">{d.pageOf(filters.page, pages)}</span>
          <div className="flex gap-2">
            {filters.page > 1 && (
              <Link href={pageHref(locale, filters, filters.page - 1)} className={`${buttonSmallSecondary} btn-lift rounded-full`}>
                <ArrowLeft size={16} aria-hidden="true" className="rotate-180 ltr:rotate-0" />
                {d.previous}
              </Link>
            )}
            {filters.page < pages && (
              <Link href={pageHref(locale, filters, filters.page + 1)} className={`${buttonSmallSecondary} btn-lift rounded-full`}>
                {d.next}
                <ArrowLeft size={16} aria-hidden="true" className="ltr:rotate-180" />
              </Link>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
