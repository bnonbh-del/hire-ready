"use server";

import { CV_MAX_BYTES } from "@/lib/constants";
import {
  normalizeIraqiMobile,
  validateApplication,
  type ApplicationInput,
  type FieldErrors,
} from "@/lib/application-form";
import { isLocale, t, type Locale } from "@/lib/i18n";
import { getPublishedJob, isAcceptingApplications, todayInBaghdad } from "@/lib/jobs";
import { createAdminClient } from "@/lib/supabase/admin";

/*
 * Applying happens in two calls so the CV never passes through our server
 * (Vercel rejects request bodies over 4.5 MB, and CVs can be 5 MB):
 *   1. startCvUpload: checks the job is open and returns a one-time upload
 *      ticket for a random path in the private "cvs" bucket.
 *   2. The browser uploads the PDF straight to Supabase with that ticket.
 *   3. submitApplication: re-validates everything, checks the uploaded file
 *      really is a PDF under 5 MB, then saves the application.
 * Applicants without a CV skip 1-2 and write an "about me" instead; one of the
 * two is required (the database enforces it too).
 */

/** Messages in the page language (the locale comes from the browser, so it's checked). */
function messages(locale: string) {
  return t(isLocale(locale) ? locale : "ar").form.errors;
}

/** Same phone already applied to this job? (phones are stored normalized) */
async function hasApplied(jobId: string, phone: string): Promise<boolean> {
  const { count } = await createAdminClient()
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("job_id", jobId)
    .eq("phone", phone);
  return (count ?? 0) > 0;
}

export type StartUploadResult =
  | { ok: true; path: string; token: string }
  | { ok: false; message?: string; errors?: FieldErrors };

export async function startCvUpload(slug: string, phoneInput: string, locale: Locale): Promise<StartUploadResult> {
  const m = messages(locale);
  const job = await getPublishedJob(slug);
  if (!job || !isAcceptingApplications(job, todayInBaghdad())) return { ok: false, message: m.closed };

  // Checked before the upload so a repeat applicant doesn't wait for the file first.
  const phone = normalizeIraqiMobile(phoneInput);
  if (phone && (await hasApplied(job.id, phone))) return { ok: false, errors: { phone: m.alreadyApplied } };

  const path = `${job.id}/${crypto.randomUUID()}.pdf`;
  const { data, error } = await createAdminClient().storage.from("cvs").createSignedUploadUrl(path);
  if (error || !data) {
    console.error("createSignedUploadUrl failed", error);
    return { ok: false, message: m.generic };
  }
  return { ok: true, path: data.path, token: data.token };
}

export type SubmitResult = { ok: true } | { ok: false; message?: string; errors?: FieldErrors };

export async function submitApplication(
  slug: string,
  input: ApplicationInput,
  /** null when the applicant wrote an "about me" instead of uploading a CV. */
  cvPath: string | null,
  /** Hidden field real people never fill; bots usually do. */
  website: string,
  locale: Locale
): Promise<SubmitResult> {
  if (website) return { ok: true };
  const m = messages(locale);

  const { data, errors } = validateApplication(input, isLocale(locale) ? locale : "ar");
  if (!data) return { ok: false, errors };
  if (!cvPath && !data.about) return { ok: false, errors: { cv: m.cvOrAbout, about: m.cvOrAbout } };

  const job = await getPublishedJob(slug);
  if (!job || !isAcceptingApplications(job, todayInBaghdad())) return { ok: false, message: m.closed };

  const admin = createAdminClient();
  const cvsBucket = admin.storage.from("cvs");

  if (cvPath) {
    // Only accept a path we could have issued for this job.
    const uuid = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
    if (!new RegExp(`^${job.id}/${uuid}\\.pdf$`).test(cvPath)) {
      return { ok: false, errors: { cv: m.cvAgain } };
    }

    const { data: file, error: downloadError } = await cvsBucket.download(cvPath);
    if (downloadError || !file) return { ok: false, errors: { cv: m.cvMissing } };

    const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    const isPdf = String.fromCharCode(...head) === "%PDF-";
    if (!isPdf || file.size > CV_MAX_BYTES) {
      await cvsBucket.remove([cvPath]);
      return { ok: false, errors: { cv: isPdf ? m.cvTooBig : m.cvInvalid } };
    }
  } else if (await hasApplied(job.id, data.phone)) {
    return { ok: false, errors: { phone: m.alreadyApplied } };
  }

  // `department` is filled by a database trigger from the job.
  const { error } = await admin.from("applications").insert({
    job_id: job.id,
    ...data,
    cv_path: cvPath,
  });

  if (error) {
    // 23505 = unique violation: same phone already applied (two submits at
    // once), or this file was already used for an application.
    if (error.code === "23505") {
      if (error.message.includes("applications_job_phone_key")) {
        if (cvPath) await cvsBucket.remove([cvPath]);
        return { ok: false, errors: { phone: m.alreadyApplied } };
      }
      return { ok: false, errors: { cv: m.cvAgain } };
    }
    console.error("insert application failed", error);
    return { ok: false, message: m.generic };
  }

  return { ok: true };
}
