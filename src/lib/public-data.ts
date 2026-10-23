import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { TAGS } from "@/lib/cache-tags";
import { DEPARTMENTS, GOVERNORATES, JOB_TYPES, type Department, type Governorate, type JobType } from "@/lib/constants";
import type { PublicJob } from "@/lib/jobs";
import { createPublicClient } from "@/lib/supabase/public";
import type { Company, Founder, Service } from "@/lib/types";

/*
 * Cached public reads for the site pages. Each is tagged so /admin can clear
 * it after an edit (companies, founders and settings actions already do).
 */

export type JobListItem = Pick<
  PublicJob,
  | "id"
  | "slug"
  | "title"
  | "title_en"
  | "company_name"
  | "company_name_en"
  | "hide_company"
  | "governorate"
  | "area"
  | "area_en"
  | "job_type"
  | "department"
  | "salary"
  | "salary_en"
  | "published_at"
>;

const LIST_COLUMNS =
  "id, slug, title, title_en, company_name, company_name_en, hide_company, governorate, area, area_en, job_type, department, salary, salary_en, published_at";

export interface JobFilters {
  q: string;
  department: Department | "";
  governorate: Governorate | "";
  jobType: JobType | "";
  page: number;
}

export const JOBS_PAGE_SIZE = 12;

/** Reads ?q=&dept=&gov=&type=&page= into safe values. */
export function parseJobFilters(params: Record<string, string | string[] | undefined>): JobFilters {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const dept = one(params.dept);
  const gov = one(params.gov);
  const type = one(params.type);
  return {
    // Characters with a meaning in the filter syntax are dropped.
    q: one(params.q).replace(/[,()%*\\]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80),
    department: dept in DEPARTMENTS ? (dept as Department) : "",
    governorate: (GOVERNORATES as readonly string[]).includes(gov) ? (gov as Governorate) : "",
    jobType: type in JOB_TYPES ? (type as JobType) : "",
    page: Math.max(1, Math.floor(Number(one(params.page))) || 1),
  };
}

/**
 * Open jobs whose deadline (if any) hasn't passed, newest first. `today`
 * (YYYY-MM-DD, Baghdad) is an argument so the cache entry is per day.
 */
export async function getOpenJobs(filters: JobFilters, today: string): Promise<{ jobs: JobListItem[]; total: number }> {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAGS.jobs);

  let query = createPublicClient()
    .from("jobs_public")
    .select(LIST_COLUMNS, { count: "exact" })
    .eq("status", "open")
    .or(`deadline.is.null,deadline.gte.${today}`)
    .order("published_at", { ascending: false, nullsFirst: false });

  // Matches the Arabic or the English title, whatever the page language.
  if (filters.q) query = query.or(`title.ilike.%${filters.q}%,title_en.ilike.%${filters.q}%`);
  if (filters.department) query = query.eq("department", filters.department);
  if (filters.governorate) query = query.eq("governorate", filters.governorate);
  if (filters.jobType) query = query.eq("job_type", filters.jobType);

  const from = (filters.page - 1) * JOBS_PAGE_SIZE;
  const { data, count, error } = await query.range(from, from + JOBS_PAGE_SIZE - 1);
  // PGRST103: the page number is past the last page (e.g. an old link). Show "no results", not an error.
  if (error?.code === "PGRST103") return { jobs: [], total: 0 };
  if (error) throw new Error(`Could not load jobs: ${error.message}`);
  return { jobs: (data ?? []) as JobListItem[], total: count ?? 0 };
}

/** Active contracted companies, in the admin's order. Empty list = hide every partners section. */
export async function getPartners(): Promise<Pick<Company, "id" | "name" | "name_en" | "logo_path" | "website">[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.companies);

  const { data } = await createPublicClient()
    .from("companies")
    .select("id, name, name_en, logo_path, website")
    .eq("is_active", true)
    .order("sort_order")
    .order("created_at");
  return data ?? [];
}

export async function getFounders(): Promise<Founder[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.founders);

  const { data } = await createPublicClient().from("founders").select("*").order("sort_order");
  return (data ?? []) as Founder[];
}

export async function getServices(): Promise<Service[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.services);

  const { data } = await createPublicClient().from("services").select("*").order("sort_order");
  return (data ?? []) as Service[];
}

/** Every open job, for sitemap.xml. */
export async function getSitemapJobs(): Promise<{ slug: string; updated_at: string; title_en: string | null }[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.jobs);

  const { data } = await createPublicClient().from("jobs_public").select("slug, updated_at, title_en").eq("status", "open");
  return data ?? [];
}
