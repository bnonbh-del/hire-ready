/**
 * Application form rules, shared by the browser (instant feedback) and the
 * server (the real check; the browser can't be trusted).
 */
import { CV_MAX_BYTES, EXPERIENCE_OPTIONS, GOVERNORATES, type Governorate } from "@/lib/constants";
import { t, type Locale } from "@/lib/i18n";

export type ApplicationField = "full_name" | "phone" | "email" | "governorate" | "years_experience" | "about" | "cv";
export type FieldErrors = Partial<Record<ApplicationField, string>>;

export interface ApplicationInput {
  full_name: string;
  phone: string;
  email: string;
  governorate: string;
  years_experience: string;
  about: string;
}

export const ABOUT_MAX = 3000;

export interface CleanApplication {
  full_name: string;
  phone: string;
  email: string;
  governorate: Governorate;
  years_experience: number;
  about: string | null;
}

/** Arabic-Indic (٠١٢) and Persian (۰۱۲) digits -> 012, so phones typed on an Arabic keyboard work. */
export function toLatinDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/** "+964 773 444 8817", "٠٧٧٣٤٤٤٨٨١٧", "009647734448817" -> "07734448817". Null if not an Iraqi mobile. */
export function normalizeIraqiMobile(value: string): string | null {
  let digits = toLatinDigits(value).replace(/[\s\-().]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("964")) digits = `0${digits.slice(3)}`;
  return /^07\d{9}$/.test(digits) ? digits : null;
}

/** Checks the fields; messages are in the page language. */
export function validateApplication(input: ApplicationInput, locale: Locale = "ar"): { data?: CleanApplication; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const m = t(locale).form.errors;

  const full_name = input.full_name.trim().replace(/\s+/g, " ");
  if (full_name.length < 2) errors.full_name = m.fullName;
  else if (full_name.length > 120) errors.full_name = m.fullNameLong;

  const phone = normalizeIraqiMobile(input.phone);
  if (!input.phone.trim()) errors.phone = m.phone;
  else if (!phone) errors.phone = m.phoneInvalid;

  const email = input.email.trim().toLowerCase();
  if (!email) errors.email = m.email;
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) errors.email = m.emailInvalid;

  const governorate = GOVERNORATES.find((g) => g === input.governorate);
  if (!governorate) errors.governorate = m.governorate;

  const yearsText = input.years_experience.trim();
  const years = Number(yearsText);
  if (!yearsText || !EXPERIENCE_OPTIONS.some((o) => o.value === years)) errors.years_experience = m.experience;

  const about = input.about.trim();
  if (about.length > ABOUT_MAX) errors.about = m.aboutLong(ABOUT_MAX);

  if (Object.keys(errors).length > 0) return { errors };
  return {
    data: { full_name, phone: phone!, email, governorate: governorate!, years_experience: years, about: about || null },
    errors,
  };
}

/** Browser-side check of the chosen file (if any). The server re-checks the uploaded bytes. */
export function validateCvFile(file: File | null | undefined, locale: Locale = "ar"): string | null {
  if (!file || file.size === 0) return null;
  const m = t(locale).form.errors;
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return m.cvNotPdf;
  if (file.size > CV_MAX_BYTES) return m.cvTooBig;
  return null;
}
