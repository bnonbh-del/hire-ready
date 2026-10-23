/**
 * Fixed lists shared by the site and /admin. The keys must match the enums in
 * supabase/migrations/0001_init.sql; the values are what visitors see.
 */

export const DEPARTMENTS = {
  sales: "مبيعات",
  accounting: "محاسبة",
  engineering: "هندسة",
  hr: "موارد بشرية",
  tech: "تقنية",
  marketing: "تسويق",
  management: "إدارة",
  other: "أخرى",
} as const;

export const JOB_TYPES = {
  full_time: "دوام كامل",
  part_time: "دوام جزئي",
  contract: "عقد",
  internship: "تدريب",
} as const;

/** Admin choices. "any" means either is welcome. */
export const GENDERS = {
  male: "ذكر",
  female: "أنثى",
  any: "الاثنين",
} as const;

/** How the gender requirement reads on the job page. */
export const GENDER_DISPLAY: Record<keyof typeof GENDERS, string> = {
  male: "ذكر",
  female: "أنثى",
  any: "ذكر أو أنثى",
};

export const JOB_STATUSES = {
  draft: "مسودة",
  open: "مفتوحة",
  closed: "مغلقة",
} as const;

export const APPLICATION_STATUSES = {
  new: "جديد",
  contacted: "تم التواصل",
  interview: "مقابلة",
  accepted: "مقبول",
  rejected: "مرفوض",
} as const;

/** Same list and spelling as the `governorate` domain in the database. */
export const GOVERNORATES = [
  "بغداد",
  "البصرة",
  "نينوى",
  "أربيل",
  "النجف",
  "كربلاء",
  "كركوك",
  "الأنبار",
  "ديالى",
  "صلاح الدين",
  "بابل",
  "واسط",
  "ذي قار",
  "ميسان",
  "المثنى",
  "القادسية",
  "دهوك",
  "السليمانية",
  "حلبجة",
] as const;

export const CV_MAX_BYTES = 5 * 1024 * 1024;

/**
 * Years-of-experience choices on the apply form. The database keeps a number
 * (0-60); ranges are stored as their lowest value: "6-10" -> 6, "أكثر من 10" -> 11.
 */
export const EXPERIENCE_OPTIONS = [
  { value: 0, label: "أقل من سنة" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6-10" },
  { value: 11, label: "أكثر من 10" },
] as const;

/** How a stored number reads in /admin and the Excel export (older free-typed values too). */
export function experienceLabel(years: number): string {
  if (years < 1) return "أقل من سنة";
  if (years === 1) return "سنة واحدة";
  if (years === 2) return "سنتين";
  if (years <= 5) return `${years} سنوات`;
  if (years <= 10) return "6-10 سنوات";
  return "أكثر من 10 سنوات";
}

/** Shown instead of the company's name when the job hides it. */
export const HIDDEN_COMPANY_LABEL = "لأحد عملاء Hire Ready";

export type Department = keyof typeof DEPARTMENTS;
export type JobType = keyof typeof JOB_TYPES;
export type Gender = keyof typeof GENDERS;
export type JobStatus = keyof typeof JOB_STATUSES;
export type ApplicationStatus = keyof typeof APPLICATION_STATUSES;
export type Governorate = (typeof GOVERNORATES)[number];
