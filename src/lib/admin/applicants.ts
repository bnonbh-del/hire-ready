import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { toLatinDigits } from "@/lib/application-form";
import { DEPARTMENTS, type Department } from "@/lib/constants";

export const PAGE_SIZE = 50;

export interface ApplicantFilters {
  department: Department;
  /** Name or phone; Arabic digits are accepted. */
  q: string;
  jobId: string;
}

/** Reads ?dept=&q=&job= into safe filter values. */
export function parseFilters(params: Record<string, string | string[] | undefined>): ApplicantFilters {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const dept = one(params.dept);
  const jobId = one(params.job);
  return {
    department: (dept in DEPARTMENTS ? dept : "sales") as Department,
    // Characters that have a meaning in the filter syntax are dropped.
    q: toLatinDigits(one(params.q)).replace(/[,()%*\\]/g, " ").trim().slice(0, 80),
    jobId: /^[0-9a-f-]{36}$/.test(jobId) ? jobId : "",
  };
}

const COLUMNS =
  "id, full_name, phone, email, governorate, years_experience, about, cv_path, status, created_at, job_id, job:jobs(title, slug)";

/** The applicants query for one department tab, with search and job filters applied. */
export function applicantsQuery(supabase: SupabaseClient, filters: ApplicantFilters) {
  let query = supabase
    .from("applications")
    .select(COLUMNS, { count: "exact" })
    .eq("department", filters.department)
    .order("created_at", { ascending: false });

  if (filters.jobId) query = query.eq("job_id", filters.jobId);
  if (filters.q) {
    const phoneDigits = filters.q.replace(/\D/g, "").replace(/^964/, "0");
    query = phoneDigits.length >= 3
      ? query.or(`full_name.ilike.%${filters.q}%,phone.ilike.%${phoneDigits}%`)
      : query.ilike("full_name", `%${filters.q}%`);
  }
  return query;
}

export interface ApplicantRow {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  governorate: string;
  years_experience: number;
  about: string | null;
  cv_path: string | null;
  status: string;
  created_at: string;
  job_id: string;
  job: { title: string; slug: string } | null;
}

/** 07XXXXXXXXX -> https://wa.me/9647XXXXXXXXX */
export function whatsappLink(phone: string): string {
  return `https://wa.me/964${phone.replace(/^0/, "")}`;
}
