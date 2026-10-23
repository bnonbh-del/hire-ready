import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { textLink } from "@/components/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { JobForm, type JobFormValues } from "../job-form";

export const metadata: Metadata = { title: "إضافة وظيفة" };

const EMPTY: JobFormValues = {
  title: "",
  company_name: "",
  company_id: "",
  hide_company: false,
  company_blurb: "",
  department: "",
  governorate: "",
  area: "",
  job_type: "full_time",
  work_hours: "",
  salary: "",
  gender: "",
  deadline: "",
  intro: "",
  description: "",
  responsibilities: "",
  requirements: "",
  benefits: "",
  response_days: "",
  hiring_stages: "",
  offer_days: "",
  slug: "",
  cover_path: null,
  status: "draft",
  title_en: "",
  company_name_en: "",
  company_blurb_en: "",
  area_en: "",
  work_hours_en: "",
  salary_en: "",
  intro_en: "",
  description_en: "",
  responsibilities_en: "",
  requirements_en: "",
  benefits_en: "",
  hiring_stages_en: "",
};

export default function NewJobPage() {
  return (
    <>
      <Link href="/admin/jobs" className={`text-sm ${textLink}`}>
        كل الوظائف
      </Link>
      <h1 className="mt-2 text-2xl font-bold">إضافة وظيفة</h1>
      <div className="mt-6">
        <Suspense fallback={<div className="h-96 rounded-2xl bg-card" />}>
          <NewJobForm />
        </Suspense>
      </div>
    </>
  );
}

async function NewJobForm() {
  const { supabase } = await requireAdmin();
  const { data: companies } = await supabase.from("companies").select("id, name, name_en").order("sort_order").order("name");
  return <JobForm initial={EMPTY} companies={companies ?? []} />;
}
