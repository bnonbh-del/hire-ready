"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { toLatinDigits } from "@/lib/application-form";
import { TAGS, jobTag } from "@/lib/cache-tags";
import { DEPARTMENTS, GENDERS, GOVERNORATES, JOB_STATUSES, JOB_TYPES, type JobStatus } from "@/lib/constants";

export interface JobInput {
  id?: string;
  title: string;
  company_name: string;
  company_id: string;
  hide_company: boolean;
  company_blurb: string;
  department: string;
  governorate: string;
  area: string;
  job_type: string;
  work_hours: string;
  salary: string;
  /** "" = not specified. */
  gender: string;
  deadline: string;
  intro: string;
  description: string;
  /** One item per line. */
  responsibilities: string;
  requirements: string;
  benefits: string;
  /** Number of days, as typed; "" = not shown. */
  response_days: string;
  /** One stage per line. */
  hiring_stages: string;
  offer_days: string;
  slug: string;
  cover_path: string | null;
  status: JobStatus;
  /*
   * The optional English copy of the text fields (lists one item per line).
   * Filled in = the job has an English version (title_en is then required).
   */
  title_en: string;
  company_name_en: string;
  company_blurb_en: string;
  area_en: string;
  work_hours_en: string;
  salary_en: string;
  intro_en: string;
  description_en: string;
  responsibilities_en: string;
  requirements_en: string;
  benefits_en: string;
  hiring_stages_en: string;
}

/** The English text fields, for "is anything English filled in?". */
const ENGLISH_FIELDS = [
  "title_en",
  "company_name_en",
  "company_blurb_en",
  "area_en",
  "work_hours_en",
  "salary_en",
  "intro_en",
  "description_en",
  "responsibilities_en",
  "requirements_en",
  "benefits_en",
  "hiring_stages_en",
] as const satisfies readonly (keyof JobInput)[];

export type JobField = keyof JobInput;
export type SaveJobResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; errors?: Partial<Record<JobField, string>>; message?: string };

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function randomSuffix() {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => chars[b % chars.length]).join("");
}

function lines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.replace(/^[-•*\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 30);
}

/** Clears the cached public copies of a job (and the lists that include it). */
function refreshJob(...slugs: (string | null | undefined)[]) {
  updateTag(TAGS.jobs);
  for (const slug of new Set(slugs)) if (slug) updateTag(jobTag(slug));
}

export async function saveJob(input: JobInput): Promise<SaveJobResult> {
  const { supabase } = await requireAdmin();
  const errors: Partial<Record<JobField, string>> = {};

  const title = input.title.trim();
  if (!title) errors.title = "اكتب المسمى الوظيفي.";
  else if (title.length > 150) errors.title = "المسمى طويل.";

  const company_name = input.company_name.trim();
  if (!company_name) errors.company_name = "اكتب اسم الشركة.";

  if (!(input.department in DEPARTMENTS)) errors.department = "اختر القسم.";
  if (!GOVERNORATES.includes(input.governorate as (typeof GOVERNORATES)[number])) errors.governorate = "اختر المحافظة.";
  if (!(input.job_type in JOB_TYPES)) errors.job_type = "اختر نوع الدوام.";
  if (!(input.status in JOB_STATUSES)) errors.status = "حالة غير معروفة.";

  const anyEnglish = ENGLISH_FIELDS.some((f) => input[f].trim());
  const title_en = input.title_en.trim();
  if (anyEnglish && !title_en) errors.title_en = "اكتب المسمى بالإنكليزي، أو امسح الحقول الإنكليزية إذا ما تريد نسخة إنكليزية.";
  else if (title_en.length > 150) errors.title_en = "المسمى طويل.";
  if (input.intro_en.trim().length > 400) errors.intro_en = "المقدمة طويلة (أقل من 400 حرف).";
  if (input.gender && !(input.gender in GENDERS)) errors.gender = "اختيار غير معروف.";
  if (input.intro.trim().length > 400) errors.intro = "المقدمة طويلة، خليها سطرين تقريباً (أقل من 400 حرف).";

  const days = (field: "response_days" | "offer_days") => {
    const text = toLatinDigits(input[field]).trim();
    if (!text) return null;
    const n = Number(text);
    if (!Number.isInteger(n) || n < 1 || n > 60) {
      errors[field] = "اكتب عدد أيام بين 1 و 60.";
      return null;
    }
    return n;
  };
  const response_days = days("response_days");
  const offer_days = days("offer_days");

  const deadline = input.deadline.trim();
  if (deadline && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) errors.deadline = "التاريخ مو صحيح.";

  let slug = input.slug.trim().toLowerCase();
  if (slug && !SLUG_RE.test(slug)) {
    errors.slug = "استخدم حروف إنكليزية صغيرة وأرقام وشَرطة (-) فقط، مثل: sales-rep-baghdad";
  }
  if (!slug) slug = `${input.department in DEPARTMENTS ? input.department : "job"}-${randomSuffix()}`;

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const en = (value: string) => value.trim() || null;
  const row = {
    title,
    company_name,
    company_id: input.company_id || null,
    hide_company: input.hide_company,
    company_blurb: input.company_blurb.trim() || null,
    department: input.department,
    governorate: input.governorate,
    area: input.area.trim() || null,
    job_type: input.job_type,
    work_hours: input.work_hours.trim() || null,
    salary: input.salary.trim() || null,
    gender: input.gender || null,
    deadline: deadline || null,
    intro: input.intro.trim() || null,
    description: input.description.trim(),
    responsibilities: lines(input.responsibilities),
    requirements: lines(input.requirements),
    benefits: lines(input.benefits),
    response_days,
    hiring_stages: lines(input.hiring_stages),
    offer_days,
    slug,
    cover_path: input.cover_path,
    status: input.status,
    title_en: title_en || null,
    company_name_en: en(input.company_name_en),
    company_blurb_en: en(input.company_blurb_en),
    area_en: en(input.area_en),
    work_hours_en: en(input.work_hours_en),
    salary_en: en(input.salary_en),
    intro_en: en(input.intro_en),
    description_en: input.description_en.trim(),
    responsibilities_en: lines(input.responsibilities_en),
    requirements_en: lines(input.requirements_en),
    benefits_en: lines(input.benefits_en),
    hiring_stages_en: lines(input.hiring_stages_en),
  };

  let previous: { slug: string; cover_path: string | null } | null = null;
  if (input.id) {
    const { data } = await supabase.from("jobs").select("slug, cover_path").eq("id", input.id).single();
    previous = data;
  }

  const query = input.id
    ? supabase.from("jobs").update(row).eq("id", input.id).select("id, slug").single()
    : supabase.from("jobs").insert(row).select("id, slug").single();
  const { data, error } = await query;

  if (error || !data) {
    if (error?.code === "23505") return { ok: false, errors: { slug: "هذا الرابط مستخدم لوظيفة ثانية، اختر غيره." } };
    console.error("saveJob failed", error);
    return { ok: false, message: "ما انحفظت الوظيفة. حاول مرة ثانية." };
  }

  // A replaced or removed uploaded cover is no longer used: delete the file.
  if (previous?.cover_path && previous.cover_path !== row.cover_path) {
    await supabase.storage.from("public").remove([previous.cover_path]);
  }

  refreshJob(previous?.slug, data.slug);
  return { ok: true, id: data.id, slug: data.slug };
}

export async function setJobStatus(id: string, status: JobStatus): Promise<{ ok: boolean }> {
  const { supabase } = await requireAdmin();
  if (!(status in JOB_STATUSES)) return { ok: false };
  const { data, error } = await supabase.from("jobs").update({ status }).eq("id", id).select("slug").single();
  if (error || !data) return { ok: false };
  refreshJob(data.slug);
  return { ok: true };
}

/** Only for jobs nobody applied to (e.g. a test job); real jobs get closed instead. */
export async function deleteJob(id: string): Promise<{ ok: boolean; message?: string }> {
  const { supabase } = await requireAdmin();

  const { count } = await supabase.from("applications").select("id", { count: "exact", head: true }).eq("job_id", id);
  if ((count ?? 0) > 0) return { ok: false, message: "ما ينحذف: عليها متقدمين. أغلقها بدل الحذف." };

  const { data, error } = await supabase.from("jobs").delete().eq("id", id).select("slug, cover_path").single();
  if (error || !data) return { ok: false, message: "ما انحذفت الوظيفة." };

  if (data.cover_path) await supabase.storage.from("public").remove([data.cover_path]);
  refreshJob(data.slug);
  return { ok: true };
}
