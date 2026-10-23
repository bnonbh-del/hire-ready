/**
 * How a job's facts read in text, the same everywhere: the job page, the
 * generated cover, link previews and the channel post. Pure functions, safe
 * on the server and in the browser.
 *
 * Each job has Arabic text (required) and an optional English copy (*_en).
 * `jobText(job, locale)` picks the copy for a page language: the English one
 * if it exists, otherwise the Arabic (with `fallback: true`, so the page can
 * say "Available in Arabic only" and set the right direction).
 */
import { HIDDEN_COMPANY_LABEL, type Gender, type JobType } from "@/lib/constants";
import { HIDDEN_COMPANY_LABEL_EN, dirOf, governorateLabel, type Locale } from "@/lib/i18n";

/** The job columns these helpers read (the list view has only some of them; the rest default to empty). */
export interface JobTextSource {
  title: string;
  title_en?: string | null;
  hide_company: boolean;
  /** null for hidden jobs when read from the public view. */
  company_name: string | null;
  company_name_en?: string | null;
  company_blurb?: string | null;
  company_blurb_en?: string | null;
  intro?: string | null;
  intro_en?: string | null;
  description?: string;
  description_en?: string;
  responsibilities?: string[];
  responsibilities_en?: string[];
  requirements?: string[];
  requirements_en?: string[];
  benefits?: string[];
  benefits_en?: string[];
  salary?: string | null;
  salary_en?: string | null;
  work_hours?: string | null;
  work_hours_en?: string | null;
  governorate: string;
  area?: string | null;
  area_en?: string | null;
  hiring_stages?: string[];
  hiring_stages_en?: string[];
  job_type?: JobType;
  gender?: Gender | null;
}

export function hasEnglish(job: Pick<JobTextSource, "title_en">): boolean {
  return Boolean(job.title_en?.trim());
}

const clean = (items: string[] | undefined) => (items ?? []).map((i) => i.trim()).filter(Boolean);
const text = (value: string | null | undefined) => value?.trim() || null;

export interface JobText {
  /** The language this text is in (may differ from the page's when `fallback`). */
  lang: Locale;
  dir: "rtl" | "ltr";
  /** True when the page language has no version and the other one is shown. */
  fallback: boolean;
  title: string;
  company: string;
  /** "Company, blurb" or just the company. */
  companyLine: string;
  location: string;
  intro: string | null;
  description: string | null;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  salary: string | null;
  workHours: string | null;
  hiringStages: string[];
}

export function jobText(job: JobTextSource, locale: Locale): JobText {
  const lang: Locale = locale === "en" && hasEnglish(job) ? "en" : "ar";
  const en = lang === "en";
  const company = companyName(job, lang);
  const blurb = text(en ? job.company_blurb_en : job.company_blurb);

  return {
    lang,
    dir: dirOf(lang),
    fallback: lang !== locale,
    title: (en ? job.title_en! : job.title).trim(),
    company,
    companyLine: blurb ? `${company}${en ? ", " : "، "}${blurb}` : company,
    location: locationLine(job, lang),
    intro: text(en ? job.intro_en : job.intro),
    description: text(en ? job.description_en : job.description),
    responsibilities: clean(en ? job.responsibilities_en : job.responsibilities),
    requirements: clean(en ? job.requirements_en : job.requirements),
    benefits: clean(en ? job.benefits_en : job.benefits),
    salary: text(en ? job.salary_en : job.salary),
    workHours: text(en ? job.work_hours_en : job.work_hours),
    hiringStages: clean(en ? job.hiring_stages_en : job.hiring_stages),
  };
}

/** The name to show, or "لأحد عملاء Hire Ready" for hidden ones. Never leaks a hidden name. */
export function companyName(job: Pick<JobTextSource, "hide_company" | "company_name" | "company_name_en">, locale: Locale = "ar"): string {
  if (job.hide_company || !job.company_name) return locale === "en" ? HIDDEN_COMPANY_LABEL_EN : HIDDEN_COMPANY_LABEL;
  return (locale === "en" && job.company_name_en?.trim()) || job.company_name;
}

/** "بغداد - الكرخ", or just "بغداد" ("Baghdad - Karkh" in English). */
export function locationLine(job: Pick<JobTextSource, "governorate" | "area" | "area_en">, locale: Locale = "ar"): string {
  const governorate = governorateLabel(job.governorate, locale);
  const area = text(locale === "en" ? job.area_en || job.area : job.area);
  return area ? `${governorate} - ${area}` : governorate;
}

/**
 * One number (1,000,000 / 8:00 / 4.5), or a range of two joined by a dash
 * (450,000 - 650,000 / 8:00 - 4:00). Only these get kept left-to-right: a
 * lone "/ 6" must stay outside so the 6 sits next to the word after it
 * ("8:00 - 4:00 / 6 أيام").
 */
const NUMBER = "[0-9\\u0660-\\u0669](?:[0-9\\u0660-\\u0669,.:]*[0-9\\u0660-\\u0669])?";
export const NUMBER_RUN = new RegExp(`(${NUMBER}(?:\\s*[-–]\\s*${NUMBER})?)`);

/**
 * For plain text (channel posts): wraps number runs in Unicode isolates
 * (LRI ... PDI) so Telegram and WhatsApp don't flip "450,000 - 650,000" to
 * "650,000 - 450,000" inside an Arabic line. The marks are invisible.
 */
export function isolateNumbers(text: string): string {
  return text
    .split(NUMBER_RUN)
    .map((part, i) => (i % 2 === 1 ? `⁦${part}⁩` : part))
    .join("");
}

const POST_LABELS = {
  ar: { vacancy: "الشاغر الوظيفي", location: "الموقع", salary: "الراتب", hours: "أوقات العمل", requirements: "المؤهلات", responsibilities: "المهام", apply: "للتقديم" },
  en: { vacancy: "Job vacancy", location: "Location", salary: "Salary", hours: "Working hours", requirements: "Requirements", responsibilities: "Responsibilities", apply: "Apply here" },
};

/**
 * The text the client pastes into Telegram/WhatsApp channels, in one
 * language (call with "en" only for jobs that have English). Any empty field
 * drops its whole block, with no stray blank lines.
 */
export function jobPostText(job: JobTextSource, link: string, locale: Locale = "ar"): string {
  const view = jobText(job, locale);
  const l = POST_LABELS[view.lang];

  const blocks = [
    `${l.vacancy} – ${view.title}`,
    view.companyLine,
    `${l.location}: ${view.location}`,
    view.salary && `${l.salary}: ${view.salary}`,
    view.workHours && `${l.hours}: ${view.workHours}`,
    view.requirements.length > 0 && `${l.requirements}:\n${view.requirements.join("\n")}`,
    view.responsibilities.length > 0 && `${l.responsibilities}:\n${view.responsibilities.join("\n")}`,
    `${l.apply}:\n${link}`,
  ].filter((b): b is string => Boolean(b));

  // Isolating numbers only matters inside right-to-left text.
  return blocks.map((b) => (b.endsWith(link) || view.lang === "en" ? b : isolateNumbers(b))).join("\n\n");
}
