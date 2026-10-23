import Link from "next/link";
import { Bidi } from "@/components/bidi";
import { departmentLabel, jobTypeLabel, localePath, t, type Locale } from "@/lib/i18n";
import { jobText } from "@/lib/job-display";
import type { JobListItem } from "@/lib/public-data";

const relative = {
  ar: new Intl.RelativeTimeFormat("ar", { numeric: "auto" }),
  en: new Intl.RelativeTimeFormat("en", { numeric: "auto" }),
};

/** "اليوم" / "أمس" / "قبل 3 أيام"... / "today" / "3 days ago". `now` comes from a per-request render. */
export function postedAgo(publishedAt: string | null, now: number, locale: Locale = "ar"): string | null {
  if (!publishedAt) return null;
  const days = Math.max(0, Math.floor((now - Date.parse(publishedAt)) / 86_400_000));
  const format = relative[locale];
  if (days < 7) return format.format(-days, "day");
  if (days < 30) return format.format(-Math.floor(days / 7), "week");
  return format.format(-Math.floor(days / 30), "month");
}

/*
 * A job in a list (home page, /jobs), in the page language. The whole card is
 * the link. A job without an English copy shows its Arabic text (right to
 * left) on English pages, with an "Available in Arabic only" note.
 */
export function JobCard({ job, now, locale }: { job: JobListItem; now: number; locale: Locale }) {
  const d = t(locale);
  const view = jobText(job, locale);
  const posted = postedAgo(job.published_at, now, locale);
  const department = departmentLabel(job.department, locale);

  return (
    <article className="reveal card-lift relative flex flex-col rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div lang={view.lang} dir={view.dir} className="min-w-0">
          <h3 className="text-lg font-semibold leading-snug">
            <Link href={localePath(locale, `/jobs/${job.slug}`)} className="after:absolute after:inset-0 after:rounded-xl">
              <Bidi text={view.title} />
            </Link>
          </h3>
          <p className="mt-1 text-sm font-medium text-ink-soft">
            <Bidi text={view.company} />
          </p>
        </div>
        {posted && <span className="shrink-0 pt-0.5 text-xs text-muted">{posted}</span>}
      </div>

      <p className="mt-3 text-sm text-muted">
        <span lang={view.lang}>{view.location}</span>
        <span className="mx-1.5" aria-hidden="true">·</span>
        {jobTypeLabel(job.job_type, locale)}
      </p>

      <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-2 pt-4">
        {view.salary ? (
          <p className="text-sm font-semibold tabular-nums text-ink" lang={view.lang} dir={view.dir}>
            <Bidi text={view.salary} />
          </p>
        ) : (
          <span />
        )}
        {department && <span className="rounded-md bg-surface px-2 py-0.5 text-xs text-ink-soft">{department}</span>}
      </div>

      {view.fallback && <p className="mt-3 text-xs text-accent-700">{d.otherLanguageOnly}</p>}
    </article>
  );
}
