import Link from "next/link";
import { ArrowLeft, Briefcase, Languages, MapPin, Wallet } from "lucide-react";
import { Bidi } from "@/components/bidi";
import { jobTypeLabel, localePath, t, type Locale } from "@/lib/i18n";
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
 * left) on English pages, with an "Available in Arabic only" tag.
 * Hover: lifts, gets the logo-gradient border, the arrow moves (globals.css).
 */
export function JobCard({ job, now, locale }: { job: JobListItem; now: number; locale: Locale }) {
  const d = t(locale);
  const view = jobText(job, locale);
  const posted = postedAgo(job.published_at, now, locale);

  return (
    <article className="reveal card-lift relative flex flex-col rounded-2xl p-5 md:p-6">
      {view.fallback && (
        <p className="mb-3 inline-flex items-center gap-1.5 self-start rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent-700">
          <Languages size={14} aria-hidden="true" />
          {d.otherLanguageOnly}
        </p>
      )}
      <div lang={view.lang} dir={view.dir}>
        <h3 className="font-display text-lg font-semibold leading-snug">
          <Link href={localePath(locale, `/jobs/${job.slug}`)} className="after:absolute after:inset-0 after:rounded-2xl">
            <Bidi text={view.title} />
          </Link>
        </h3>
        <p className="mt-1 text-[15px] text-ink-soft">
          <Bidi text={view.company} />
        </p>
      </div>

      <ul className="mb-5 mt-4 space-y-1.5 text-[15px] text-ink-soft">
        <li className="flex items-center gap-2">
          <MapPin size={16} className="shrink-0 text-brand-500" aria-hidden="true" />
          <span lang={view.lang}>{view.location}</span>
        </li>
        <li className="flex items-center gap-2">
          <Briefcase size={16} className="shrink-0 text-brand-500" aria-hidden="true" />
          {jobTypeLabel(job.job_type, locale)}
        </li>
        {view.salary && (
          <li className="flex items-center gap-2">
            <Wallet size={16} className="shrink-0 text-brand-500" aria-hidden="true" />
            <span lang={view.lang} dir={view.dir}>
              <Bidi text={view.salary} />
            </span>
          </li>
        )}
      </ul>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4 text-sm">
        <span className="text-muted">{posted && `${d.jobCard.posted} ${posted}`}</span>
        <span className="inline-flex items-center gap-1.5 font-medium text-brand-700" aria-hidden="true">
          {d.jobCard.details}
          <ArrowLeft size={16} className="card-arrow" />
        </span>
      </div>
    </article>
  );
}
