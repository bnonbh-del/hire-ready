import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { TAGS, jobTag } from "@/lib/cache-tags";
import { localePath, type Locale } from "@/lib/i18n";
import { createPublicClient } from "@/lib/supabase/public";
import { publicImageUrl } from "@/lib/storage";
import type { Job } from "@/lib/types";

/**
 * A job as visitors may see it (the `jobs_public` view): for hidden-company
 * jobs, company_name and company_id are null.
 */
export type PublicJob = Omit<Job, "company_name" | "company_id"> & {
  company_name: string | null;
  company_id: string | null;
};

/**
 * A published (open or closed) job by slug, or null. Cached and shared by all
 * visitors; /admin clears it with updateTag(jobTag(slug)) after an edit.
 */
export async function getPublishedJob(slug: string): Promise<PublicJob | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.jobs, jobTag(slug));

  // The view only contains open and closed jobs, with hidden company names blanked.
  const { data, error } = await createPublicClient().from("jobs_public").select("*").eq("slug", slug).maybeSingle();

  if (error) throw new Error(`Could not load job "${slug}": ${error.message}`);
  return data as PublicJob | null;
}

/** Today's date in Baghdad as YYYY-MM-DD (deadlines are calendar dates in Iraq time). */
export function todayInBaghdad(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Baghdad" }).format(now);
}

/** Open, and the deadline (if any) hasn't passed. The deadline day itself still counts. */
export function isAcceptingApplications(job: Pick<Job, "status" | "deadline">, today: string): boolean {
  return job.status === "open" && (!job.deadline || job.deadline >= today);
}

/** "2026-11-15" -> "15 تشرين الثاني 2026" / "15 November 2026" */
export function formatDate(isoDate: string, locale: Locale = "ar"): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ar-IQ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    numberingSystem: "latn",
    timeZone: "UTC",
  }).format(new Date(`${isoDate.slice(0, 10)}T00:00:00Z`));
}

/** The generated cover, in a page language (/jobs/x/cover or /en/jobs/x/cover). `v` busts caches after edits. */
export function generatedCoverUrl(job: Pick<Job, "slug" | "updated_at">, locale: Locale = "ar"): string {
  return `${localePath(locale, `/jobs/${job.slug}/cover`)}?v=${Date.parse(job.updated_at) || 0}`;
}

/** Cover image: the uploaded one if any (one image for both languages), otherwise the generated one. */
export function jobCoverUrl(job: Pick<Job, "slug" | "cover_path" | "updated_at">, locale: Locale = "ar"): string {
  return job.cover_path ? publicImageUrl(job.cover_path) : generatedCoverUrl(job, locale);
}

/** Full link to a job page: https://site/jobs/x or https://site/en/jobs/x. */
export function jobUrl(siteUrl: string, slug: string, locale: Locale = "ar"): string {
  return `${siteUrl.replace(/\/$/, "")}${localePath(locale, `/jobs/${slug}`)}`;
}

/**
 * The current time, for per-request renders ("نُشرت قبل يومين"). Call it only
 * after `await connection()`, so it never gets baked into a cached page.
 */
export function requestTime(): number {
  return Date.now();
}
