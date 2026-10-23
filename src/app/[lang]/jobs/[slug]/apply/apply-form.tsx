"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { CircleAlert, FileText, LoaderCircle, Upload, X } from "lucide-react";
import { buttonPrimary, textLink } from "@/components/ui";
import {
  ABOUT_MAX,
  validateApplication,
  validateCvFile,
  type ApplicationField,
  type ApplicationInput,
  type FieldErrors,
} from "@/lib/application-form";
import { EXPERIENCE_OPTIONS, GOVERNORATES } from "@/lib/constants";
import { experienceOptionLabel, governorateLabel, localePath, t, type Locale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { startCvUpload, submitApplication } from "./actions";

type Stage = "idle" | "uploading" | "saving" | "done";

const FIELD_ORDER: ApplicationField[] = ["full_name", "phone", "email", "governorate", "years_experience", "cv", "about"];

/* Fields with the label inside that floats up when focused or filled (CSS `peer`). */
const fieldBase =
  "peer block w-full rounded-xl border bg-card px-4 pb-2 pt-6 text-base text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 aria-[invalid=true]:border-danger";
const floatingLabel =
  "pointer-events-none absolute start-4 font-medium text-muted transition-all duration-200 ease-out";
const floatOnInput =
  "top-[1.6rem] -translate-y-1/2 peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs";

export function ApplyForm({ slug, jobTitle, locale }: { slug: string; jobTitle: string; locale: Locale }) {
  const d = t(locale).form;
  const formRef = useRef<HTMLFormElement>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [toast, setToast] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const busy = stage === "uploading" || stage === "saving";

  // Error toasts go away by themselves after a few seconds.
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  function showErrors(next: FieldErrors) {
    setErrors(next);
    setToast(d.errors.fixFields);
    const first = FIELD_ORDER.find((f) => next[f]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setToast(null);

    const form = new FormData(event.currentTarget);
    const input: ApplicationInput = {
      full_name: String(form.get("full_name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      governorate: String(form.get("governorate") ?? ""),
      years_experience: String(form.get("years_experience") ?? ""),
      about: String(form.get("about") ?? ""),
    };
    const chosen = form.get("cv") as File | null;
    const file = chosen && chosen.size > 0 ? chosen : null;

    // Instant check in the browser; the server checks everything again.
    const { errors: fieldErrors } = validateApplication(input, locale);
    const cvError = validateCvFile(file, locale);
    if (cvError) fieldErrors.cv = cvError;
    if (!file && !input.about.trim()) {
      fieldErrors.cv = d.errors.cvOrAbout;
      fieldErrors.about = d.errors.cvOrAbout;
    }
    if (Object.keys(fieldErrors).length > 0) return showErrors(fieldErrors);
    setErrors({});

    try {
      let cvPath: string | null = null;
      if (file) {
        setStage("uploading");
        const ticket = await startCvUpload(slug, input.phone, locale);
        if (!ticket.ok) {
          setStage("idle");
          if (ticket.errors) showErrors(ticket.errors);
          if (ticket.message) setToast(ticket.message);
          return;
        }

        const { error: uploadError } = await createClient()
          .storage.from("cvs")
          .uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: "application/pdf" });
        if (uploadError) {
          setStage("idle");
          return showErrors({ cv: d.errors.uploadFailed });
        }
        cvPath = ticket.path;
      }

      setStage("saving");
      const result = await submitApplication(slug, input, cvPath, String(form.get("website") ?? ""), locale);
      if (!result.ok) {
        setStage("idle");
        if (result.errors) showErrors(result.errors);
        if (result.message) setToast(result.message);
        return;
      }

      setStage("done");
      window.scrollTo({ top: 0 });
    } catch {
      setStage("idle");
      setToast(d.errors.network);
    }
  }

  if (stage === "done") {
    return (
      <div className="card-box rounded-2xl p-6 md:p-8" role="status">
        {/* The tick draws itself (globals.css .check-draw). */}
        <svg viewBox="0 0 56 56" className="check-draw size-14 text-brand-700" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
          <circle cx="28" cy="28" r="25" />
          <path d="m17 29 7 7 15-16" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2 className="mt-4 text-2xl font-bold">{d.doneTitle}</h2>
        <p className="mt-2 leading-8 text-ink-soft">{d.doneText(jobTitle)}</p>
        <Link href={localePath(locale, `/jobs/${slug}`)} className={`mt-5 inline-block ${textLink}`}>
          {d.backToJob}
        </Link>
      </div>
    );
  }

  return (
    <>
      <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-5">
        <p className="text-sm text-muted">
          {d.requiredNote[0]} <span className="text-danger">*</span> {d.requiredNote[1]}
        </p>

        <Field id="full_name" error={errors.full_name}>
          <input
            id="full_name"
            name="full_name"
            autoComplete="name"
            aria-required="true"
            placeholder=" "
            className={`${fieldBase} border-field`}
            {...invalid(errors.full_name, "full_name")}
          />
          <Label htmlFor="full_name" text={d.fullName} required requiredSr={d.requiredSr} floatClass={floatOnInput} />
        </Field>

        <Field id="phone" hint={d.phoneHint} error={errors.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-required="true"
            dir="ltr"
            placeholder=" "
            className={`${fieldBase} border-field text-start`}
            {...invalid(errors.phone, "phone")}
          />
          <Label htmlFor="phone" text={d.phone} required requiredSr={d.requiredSr} floatClass={floatOnInput} />
        </Field>

        <Field id="email" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-required="true"
            dir="ltr"
            placeholder=" "
            className={`${fieldBase} border-field text-start`}
            {...invalid(errors.email, "email")}
          />
          <Label htmlFor="email" text={d.email} required requiredSr={d.requiredSr} floatClass={floatOnInput} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="governorate" error={errors.governorate}>
            <select
              id="governorate"
              name="governorate"
              defaultValue=""
              aria-required="true"
              className={`${fieldBase} appearance-none border-field pe-10`}
              {...invalid(errors.governorate, "governorate")}
            >
              <option value="" disabled>
                {d.chooseGovernorate}
              </option>
              {GOVERNORATES.map((g) => (
                <option key={g} value={g}>
                  {governorateLabel(g, locale)}
                </option>
              ))}
            </select>
            <Label htmlFor="governorate" text={d.governorate} required requiredSr={d.requiredSr} floatClass="top-2 text-xs" />
            <Chevron />
          </Field>

          <Field id="years_experience" error={errors.years_experience}>
            <select
              id="years_experience"
              name="years_experience"
              defaultValue=""
              aria-required="true"
              className={`${fieldBase} appearance-none border-field pe-10`}
              {...invalid(errors.years_experience, "years_experience")}
            >
              <option value="" disabled>
                {d.choose}
              </option>
              {EXPERIENCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {experienceOptionLabel(o.value, locale)}
                </option>
              ))}
            </select>
            <Label htmlFor="years_experience" text={d.experience} required requiredSr={d.requiredSr} floatClass="top-2 text-xs" />
            <Chevron />
          </Field>
        </div>

        <div>
          <p className="mb-1.5 font-medium" id="cv-label">
            {d.cv} <span className="ms-1 text-sm font-normal text-muted">{d.cvMark}</span>
          </p>
          <input
            id="cv"
            name="cv"
            type="file"
            accept="application/pdf,.pdf"
            className="peer sr-only"
            aria-labelledby="cv-label"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            {...invalid(errors.cv, "cv")}
          />
          <label
            htmlFor="cv"
            className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed bg-surface px-4 py-4 transition-colors hover:border-brand-500 peer-focus-visible:outline-2 peer-focus-visible:outline-accent-600 ${
              errors.cv ? "border-danger" : fileName ? "border-brand-500" : "border-field"
            }`}
          >
            <span className="flex shrink-0 pt-0.5 text-brand-700">
              {fileName ? <FileText size={20} aria-hidden="true" /> : <Upload size={20} aria-hidden="true" />}
            </span>
            <span className="min-w-0 truncate" dir={fileName ? "auto" : undefined}>
              {fileName ?? d.chooseFile}
            </span>
          </label>
          {!errors.cv && <p className="mt-1.5 text-sm text-muted">{d.cvHint}</p>}
          {errors.cv && (
            <p id="cv-error" className="mt-1.5 text-sm text-danger">
              {errors.cv}
            </p>
          )}
        </div>

        <Field id="about" hint={d.aboutHint} error={errors.about} keepHint>
          <textarea
            id="about"
            name="about"
            rows={5}
            maxLength={ABOUT_MAX}
            dir="auto"
            placeholder=" "
            className={`${fieldBase} border-field`}
            {...invalid(errors.about, "about")}
          />
          <label htmlFor="about" className={`${floatingLabel} ${floatOnInput}`}>
            {d.about} <span className="text-sm font-normal">{d.aboutMark}</span>
          </label>
        </Field>

        {/* Hidden from people; bots that fill every field reveal themselves. */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <button type="submit" disabled={busy} className={`${buttonPrimary} w-full sm:w-auto sm:px-10`}>
          {busy && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}
          {stage === "uploading" ? d.uploading : stage === "saving" ? d.saving : d.submit}
        </button>
        <p className="max-w-xl text-sm leading-7 text-muted">{d.consent}</p>
      </form>

      {/* Toast for errors, at the bottom of the screen. */}
      <div aria-live="assertive" className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
        {toast && (
          <div className="toast-in pointer-events-auto flex max-w-md items-start gap-3 rounded-2xl border border-danger/30 bg-card px-4 py-3 text-ink shadow-lg" role="alert">
            <CircleAlert size={20} className="mt-0.5 shrink-0 text-danger" aria-hidden="true" />
            <p className="flex-1">{toast}</p>
            <button type="button" onClick={() => setToast(null)} className="shrink-0 text-muted hover:text-ink" aria-label={d.close}>
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function invalid(error: string | undefined, id: string) {
  return error ? { "aria-invalid": true as const, "aria-describedby": `${id}-error` } : {};
}

function Label({
  htmlFor,
  text,
  required,
  requiredSr,
  floatClass,
}: {
  htmlFor: string;
  text: string;
  required?: boolean;
  requiredSr: string;
  floatClass: string;
}) {
  return (
    <label htmlFor={htmlFor} className={`${floatingLabel} ${floatClass}`}>
      {text}
      {required && (
        <>
          <span className="ms-1 text-danger" aria-hidden="true">
            *
          </span>
          <span className="sr-only">{requiredSr}</span>
        </>
      )}
    </label>
  );
}

function Chevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="pointer-events-none absolute end-4 top-[1.6rem] size-4 -translate-y-1/2 text-muted"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m5 8 5 5 5-5" />
    </svg>
  );
}

function Field({
  id,
  hint,
  error,
  keepHint,
  children,
}: {
  id: string;
  hint?: string;
  error?: string;
  /** Keep showing the hint when there's an error (for hints that explain how to fix it). */
  keepHint?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="relative">{children}</div>
      {hint && (!error || keepHint) && <p className="mt-1.5 text-sm text-muted">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
