"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { buttonPrimary, buttonSecondary, hintClass, inputClass, labelClass } from "@/components/ui";
import { uploadPublicImage } from "@/lib/admin/upload-image";
import { DEPARTMENTS, GENDERS, GOVERNORATES, HIDDEN_COMPANY_LABEL, JOB_TYPES, type JobStatus } from "@/lib/constants";
import { HIDDEN_COMPANY_LABEL_EN } from "@/lib/i18n";
import { publicImageUrl } from "@/lib/storage";
import { saveJob, type JobField, type JobInput } from "./actions";

export interface JobFormValues extends Omit<JobInput, "status"> {
  status: JobStatus;
}

type Errors = Partial<Record<JobField, string>>;
type Lang = "ar" | "en";

/** The text fields that have an Arabic and an English copy (the tabs). */
const TEXT_FIELDS = [
  "title",
  "company_name",
  "company_blurb",
  "area",
  "work_hours",
  "salary",
  "intro",
  "description",
  "responsibilities",
  "requirements",
  "benefits",
  "hiring_stages",
] as const;
type TextField = (typeof TEXT_FIELDS)[number];
const key = (field: TextField, lang: Lang) => (lang === "en" ? (`${field}_en` as const) : field);

export function JobForm({
  initial,
  companies,
}: {
  initial: JobFormValues;
  companies: { id: string; name: string; name_en: string | null }[];
}) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [tab, setTab] = useState<Lang>("ar");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    initial.cover_path ? publicImageUrl(initial.cover_path) : null
  );
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState<JobStatus | null>(null);

  const isNew = !initial.id;
  const set = (field: keyof JobFormValues) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [field]: e.target.value }));

  const hasEnglish = TEXT_FIELDS.some((f) => values[key(f, "en")].trim());
  const tabErrors = (lang: Lang) => TEXT_FIELDS.filter((f) => errors[key(f, lang)]).length;

  function pickCompany(id: string) {
    const company = companies.find((c) => c.id === id);
    setValues((v) => ({
      ...v,
      company_id: id,
      company_name: company ? company.name : v.company_name,
      company_name_en: company ? (company.name_en ?? "") : v.company_name_en,
    }));
  }

  function pickCover(file: File | null) {
    setCoverFile(file);
    setCoverPreview(file ? URL.createObjectURL(file) : null);
  }

  function removeCover() {
    setCoverFile(null);
    setCoverPreview(null);
    setValues((v) => ({ ...v, cover_path: null }));
  }

  async function save(status: JobStatus) {
    if (saving) return;
    setSaving(status);
    setMessage(null);

    let cover_path = values.cover_path;
    if (coverFile) {
      const uploaded = await uploadPublicImage(coverFile, "covers");
      if ("error" in uploaded) {
        setSaving(null);
        setErrors({ cover_path: uploaded.error });
        return;
      }
      cover_path = uploaded.path;
    }

    const result = await saveJob({ ...values, cover_path, status });
    setSaving(null);
    if (!result.ok) {
      const next = result.errors ?? {};
      setErrors(next);
      // Show the tab that has the problem.
      if (TEXT_FIELDS.some((f) => next[key(f, "ar")])) setTab("ar");
      else if (TEXT_FIELDS.some((f) => next[key(f, "en")])) setTab("en");
      if (result.message) setMessage(result.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.push(`/admin/jobs/${result.id}?saved=1`);
    router.refresh();
  }

  const primaryStatus: JobStatus = values.status === "closed" ? "closed" : "open";

  return (
    <form
      onSubmit={(e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        save(primaryStatus);
      }}
      noValidate
      className="space-y-8"
    >
      {message && (
        <p className="rounded-md border border-danger/30 bg-danger-50 p-3 text-danger" role="alert">
          {message}
        </p>
      )}

      {Object.keys(errors).length > 0 && !message && (
        <p className="rounded-md border border-danger/30 bg-danger-50 p-3 text-danger" role="alert">
          بعض الخانات تحتاج تصليح، مأشرة بالأحمر.
        </p>
      )}

      <Fieldset title="نص الإعلان">
        <p className="text-sm text-ink-soft">
          العربي إجباري. الإنكليزي اختياري: إذا كتبته، الصفحة الإنكليزية للوظيفة وصورة المعاينة ونص المنشور الإنكليزي تطلع بيه. وإذا ما كتبته، الصفحة الإنكليزية
          تعرض النص العربي ويا ملاحظة «Available in Arabic only».
        </p>

        <div role="tablist" aria-label="لغة النص" className="flex gap-2 border-b border-line">
          {(["ar", "en"] as const).map((lang) => {
            const count = tabErrors(lang);
            return (
              <button
                key={lang}
                type="button"
                role="tab"
                id={`tab-${lang}`}
                aria-selected={tab === lang}
                aria-controls={`panel-${lang}`}
                onClick={() => setTab(lang)}
                className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 font-medium transition-colors ${
                  tab === lang ? "border-brand-500 text-brand-700" : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                {lang === "ar" ? "عربي" : "English"}
                {lang === "en" && (
                  <span className={`rounded-full px-2 py-0.5 text-xs ${hasEnglish ? "bg-brand-50 text-brand-700" : "bg-surface text-muted"}`}>
                    {hasEnglish ? "مكتوب" : "اختياري"}
                  </span>
                )}
                {count > 0 && <span className="rounded-full bg-danger px-1.5 text-xs text-white">{count}</span>}
              </button>
            );
          })}
        </div>

        {(["ar", "en"] as const).map((lang) => (
          <div key={lang} role="tabpanel" id={`panel-${lang}`} aria-labelledby={`tab-${lang}`} hidden={tab !== lang} className="space-y-5">
            <TextPanel lang={lang} values={values} errors={errors} set={set} />
          </div>
        ))}
      </Fieldset>

      <Fieldset title="الشركة والتصنيف">
        {companies.length > 0 && (
          <Field id="company_id" label="من الشركات المتعاقدة" hint="اختياري. يعبّي اسم الشركة (بالعربي والإنكليزي) تلقائياً.">
            <select id="company_id" value={values.company_id} onChange={(e) => pickCompany(e.target.value)} className={inputClass}>
              <option value="">بدون</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        )}

        <label className="flex items-start gap-3 rounded-md border border-line bg-surface p-3">
          <input
            type="checkbox"
            checked={values.hide_company}
            onChange={(e) => setValues((v) => ({ ...v, hide_company: e.target.checked }))}
            className="mt-1 size-4 accent-primary"
          />
          <span>
            <span className="block font-medium">إخفاء اسم الشركة</span>
            <span className="block text-sm text-ink-soft">
              الاسم ما يطلع بأي مكان بالموقع ولا بمعاينة الرابط ولا بنص المنشور، ويطلع بدله &quot;{HIDDEN_COMPANY_LABEL}&quot; (وبالإنكليزي &quot;
              {HIDDEN_COMPANY_LABEL_EN}&quot;). يبقى محفوظ هنا بس حتى تعرف الوظيفة لمنو.
            </span>
          </span>
        </label>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field id="department" label="القسم" error={errors.department}>
            <select id="department" value={values.department} onChange={set("department")} className={inputClass}>
              <option value="" disabled>
                اختر
              </option>
              {Object.entries(DEPARTMENTS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field id="governorate" label="المحافظة" hint="تطلع بالإنكليزي تلقائياً." error={errors.governorate}>
            <select id="governorate" value={values.governorate} onChange={set("governorate")} className={inputClass}>
              <option value="" disabled>
                اختر
              </option>
              {GOVERNORATES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>
          <Field id="job_type" label="نوع الدوام" error={errors.job_type}>
            <select id="job_type" value={values.job_type} onChange={set("job_type")} className={inputClass}>
              {Object.entries(JOB_TYPES).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="gender" label="الجنس المطلوب" hint="اختياري. إذا ما اخترت، ما يطلع." error={errors.gender}>
            <select id="gender" value={values.gender} onChange={set("gender")} className={inputClass}>
              <option value="">بدون تحديد</option>
              {Object.entries(GENDERS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field id="deadline" label="آخر موعد للتقديم" hint="اختياري. بعد هذا اليوم يتسكّر التقديم تلقائياً." error={errors.deadline}>
            <input id="deadline" type="date" value={values.deadline} onChange={set("deadline")} className={inputClass} />
          </Field>
        </div>
      </Fieldset>

      <Fieldset title="التقديم والتوظيف">
        <p className="text-sm text-ink-soft">تطلع للمتقدم بصفحة التقديم. أي خانة فارغة ما تطلع. (مراحل التوظيف بتبويبات «نص الإعلان» فوق.)</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="response_days" label="نرد خلال (أيام)" hint="مثلاً: 2" error={errors.response_days}>
            <input id="response_days" inputMode="numeric" value={values.response_days} onChange={set("response_days")} className={inputClass} />
          </Field>
          <Field id="offer_days" label="العرض خلال (أيام بعد المقابلة)" hint="مثلاً: 4" error={errors.offer_days}>
            <input id="offer_days" inputMode="numeric" value={values.offer_days} onChange={set("offer_days")} className={inputClass} />
          </Field>
        </div>
      </Fieldset>

      <Fieldset title="صورة الغلاف">
        <p className="text-sm text-ink-soft">
          إذا ما رفعت صورة، تنعمل صورة تلقائياً بلون الهوية فيها المسمى واسم الشركة (أو «{HIDDEN_COMPANY_LABEL}» إذا مخفي) والموقع، بلغة الرابط (عربي أو إنكليزي).
          هي نفسها تطلع بمعاينة الرابط بواتساب ولينكدإن. الصورة الخاصة (إذا رفعتها) تطلع بالرابطين. القياس الأنسب: 1200×630.
        </p>
        {coverPreview ? (
          <div className="relative max-w-md">
            <Image
              src={coverPreview}
              alt=""
              width={1200}
              height={630}
              unoptimized
              className="aspect-[1200/630] w-full rounded-md border border-line object-cover"
            />
            <button
              type="button"
              onClick={removeCover}
              className="absolute end-2 top-2 inline-flex items-center gap-1 rounded-md border border-line bg-card px-2 py-1 text-sm"
            >
              <X size={14} aria-hidden="true" />
              شيل الصورة
            </button>
          </div>
        ) : (
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-line bg-card px-4 py-3 hover:border-brand-500">
            <ImagePlus size={18} className="text-brand-700" aria-hidden="true" />
            ارفع صورة خاصة
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => pickCover(e.target.files?.[0] ?? null)}
            />
          </label>
        )}
        {errors.cover_path && <p className="text-sm text-danger">{errors.cover_path}</p>}
      </Fieldset>

      <Fieldset title="رابط الوظيفة">
        <Field
          id="slug"
          label="آخر جزء من الرابط"
          hint={`حروف إنكليزية صغيرة وأرقام وشَرطة. إذا تركته فارغ ينعمل تلقائياً. الرابط: /jobs/${values.slug || "..."} (والإنكليزي: /en/jobs/${values.slug || "..."})`}
          error={errors.slug}
        >
          <input
            id="slug"
            dir="ltr"
            value={values.slug}
            onChange={set("slug")}
            placeholder="sales-rep-baghdad"
            className={`${inputClass} text-right`}
            aria-invalid={!!errors.slug}
          />
        </Field>
        {!isNew && values.status !== "draft" && (
          <p className="text-sm text-muted">انتبه: إذا غيّرت الرابط، الروابط اللي انرسلت قبل ما تشتغل.</p>
        )}
      </Fieldset>

      <div className="flex flex-wrap gap-3 border-t border-line pt-6">
        <button type="submit" disabled={!!saving} className={buttonPrimary}>
          {saving === primaryStatus && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}
          {isNew || values.status === "draft" ? "نشر الوظيفة" : "حفظ التعديلات"}
        </button>
        {(isNew || values.status === "draft") && (
          <button type="button" disabled={!!saving} onClick={() => save("draft")} className={buttonSecondary}>
            {saving === "draft" && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}
            حفظ كمسودة
          </button>
        )}
      </div>
    </form>
  );
}

/** One language's copy of the text fields. English inputs are left-to-right. */
function TextPanel({
  lang,
  values,
  errors,
  set,
}: {
  lang: Lang;
  values: JobFormValues;
  errors: Errors;
  set: (field: keyof JobFormValues) => (e: { target: { value: string } }) => void;
}) {
  const en = lang === "en";
  const k = (field: TextField) => key(field, lang);
  const dir = en ? "ltr" : "auto";
  const input = (field: TextField, extra: { inputMode?: "text" } = {}) => (
    <input
      id={k(field)}
      value={values[k(field)]}
      onChange={set(k(field))}
      dir={dir}
      className={inputClass}
      aria-invalid={!!errors[k(field)]}
      {...extra}
    />
  );
  const area = (field: TextField, rows: number) => (
    <textarea id={k(field)} rows={rows} value={values[k(field)]} onChange={set(k(field))} dir={dir} className={inputClass} aria-invalid={!!errors[k(field)]} />
  );

  return (
    <>
      <Field id={k("title")} label={en ? "المسمى الوظيفي بالإنكليزي" : "المسمى الوظيفي"} hint={en ? "مثلاً: Sales Representative. إذا كتبت أي حقل إنكليزي لازم تكتب المسمى." : undefined} error={errors[k("title")]}>
        {input("title")}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id={k("company_name")}
          label={en ? "اسم الشركة بالإنكليزي" : "اسم الشركة"}
          hint={en ? "اختياري. إذا فارغ يطلع الاسم العربي." : undefined}
          error={errors[k("company_name")]}
        >
          {input("company_name")}
        </Field>
        <Field
          id={k("company_blurb")}
          label="وصف مختصر للشركة"
          hint={en ? "Optional, e.g. a leading agency in the consumer food sector" : "اختياري. مثلاً: إحدى الوكالات الرائدة في قطاع المواد الغذائية الاستهلاكية"}
        >
          {input("company_blurb")}
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field id={k("area")} label="المنطقة" hint={en ? "Optional, e.g. Karkh" : "اختياري. مثلاً: الكرخ. تطلع «بغداد - الكرخ»."}>
          {input("area")}
        </Field>
        <Field id={k("work_hours")} label="ساعات وأيام الدوام" hint={en ? "Optional, e.g. 8:00 - 4:00 / 6 days a week" : "اختياري. مثلاً: 8:00 - 4:00 / 6 أيام في الأسبوع"}>
          {input("work_hours")}
        </Field>
        <Field id={k("salary")} label="الراتب" hint={en ? "Optional, e.g. 1,000,000 IQD + commission" : "اختياري. نص حر، مثلاً: 1,000,000 دينار + نسبة"}>
          {input("salary")}
        </Field>
      </div>

      <Field id={k("intro")} label="مقدمة قصيرة" hint="سطرين تطلع تحت عنوان الوظيفة، وبمعاينة الرابط." error={errors[k("intro")]}>
        {area("intro", 2)}
      </Field>
      <Field id={k("description")} label="تفاصيل إضافية" hint="اختياري. تطلع ببطاقة «عن الوظيفة».">
        {area("description", 5)}
      </Field>
      <Field id={k("responsibilities")} label="المهام" hint="كل نقطة بسطر.">
        {area("responsibilities", 5)}
      </Field>
      <Field id={k("requirements")} label="المؤهلات" hint="كل نقطة بسطر.">
        {area("requirements", 5)}
      </Field>
      <Field id={k("benefits")} label="المزايا" hint="كل نقطة بسطر. اختياري.">
        {area("benefits", 4)}
      </Field>
      <Field id={k("hiring_stages")} label="مراحل التوظيف" hint={en ? "One stage per line, e.g. Phone call, then In-person interview." : "كل مرحلة بسطر. مثلاً: مكالمة هاتفية، ثم مقابلة حضورية."}>
        {area("hiring_stages", 3)}
      </Field>
    </>
  );
}

function Fieldset({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-5 rounded-2xl border border-line bg-card p-5 md:p-6">
      <legend className="px-1 font-display text-lg font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
      {error ? <p className="mt-1.5 text-sm text-danger">{error}</p> : hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
}
