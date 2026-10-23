import type { ApplicationStatus, Department, Gender, Governorate, JobStatus, JobType } from "@/lib/constants";

/** Row shapes of the tables in supabase/migrations/ (0001 + later files). Keep the two in sync. */

export interface Company {
  id: string;
  name: string;
  name_en: string | null;
  logo_path: string | null;
  website: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  slug: string;
  title: string;
  company_name: string;
  company_id: string | null;
  department: Department;
  governorate: Governorate;
  area: string | null;
  job_type: JobType;
  work_hours: string | null;
  salary: string | null;
  gender: Gender | null;
  deadline: string | null;
  hide_company: boolean;
  company_blurb: string | null;
  intro: string | null;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  response_days: number | null;
  hiring_stages: string[];
  offer_days: number | null;
  /*
   * Optional English copy of the ad (0007/0008). The job "has English" when
   * title_en is filled in; English pages fall back to the Arabic text otherwise.
   */
  company_name_en: string | null;
  title_en: string | null;
  intro_en: string | null;
  company_blurb_en: string | null;
  description_en: string;
  responsibilities_en: string[];
  requirements_en: string[];
  benefits_en: string[];
  salary_en: string | null;
  work_hours_en: string | null;
  area_en: string | null;
  hiring_stages_en: string[];
  cover_path: string | null;
  status: JobStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  department: Department;
  full_name: string;
  phone: string;
  email: string;
  governorate: Governorate;
  years_experience: number;
  cv_path: string | null;
  about: string | null;
  status: ApplicationStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Founder {
  id: string;
  name: string;
  name_en: string | null;
  role: string;
  role_en: string | null;
  bio: string;
  bio_en: string;
  photo_path: string | null;
  /** The same photo in the brand colours (0009); shown first, fades to photo_path on hover. */
  photo_duotone_path: string | null;
  linkedin_url: string | null;
  sort_order: number;
}

export interface Service {
  id: string;
  title: string;
  title_en: string | null;
  description: string;
  description_en: string | null;
  sort_order: number;
}

export interface Settings {
  id: 1;
  phone_primary: string | null;
  phone_secondary: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  address_en: string | null;
  map_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  telegram_url: string | null;
  updated_at: string;
}
