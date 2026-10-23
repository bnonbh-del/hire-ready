import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CircleCheck, ExternalLink } from "lucide-react";
import { CopyLinkButton } from "@/components/copy-link-button";
import { buttonSmallSecondary, textLink } from "@/components/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { JOB_STATUSES, type JobStatus } from "@/lib/constants";
import { env } from "@/lib/env";
import { hasEnglish, jobPostText } from "@/lib/job-display";
import { jobUrl } from "@/lib/jobs";
import type { Job } from "@/lib/types";
import { DeleteJobButton, ToggleJobStatus } from "../job-buttons";
import { JobForm } from "../job-form";
import { JobPostBox } from "../job-post-box";

export const metadata: Metadata = { title: "تعديل وظيفة" };

export default function EditJobPage(props: PageProps<"/admin/jobs/[id]">) {
  return (
    <>
      <Link href="/admin/jobs" className={`text-sm ${textLink}`}>
        كل الوظائف
      </Link>
      <Suspense fallback={<div className="mt-6 h-96 rounded-2xl bg-card" />}>
        <EditJob {...props} />
      </Suspense>
    </>
  );
}

async function EditJob({ params, searchParams }: PageProps<"/admin/jobs/[id]">) {
  const { id } = await params;
  const { saved } = await searchParams;
  const { supabase } = await requireAdmin();

  const [{ data: job }, { data: companies }, { count: applicants }] = await Promise.all([
    supabase.from("jobs").select("*").eq("id", id).maybeSingle<Job>(),
    supabase.from("companies").select("id, name, name_en").order("sort_order").order("name"),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("job_id", id),
  ]);
  if (!job) notFound();

  const status = job.status as JobStatus;
  const link = jobUrl(env.siteUrl, job.slug);
  const linkEn = jobUrl(env.siteUrl, job.slug, "en");
  // The channel post in Arabic, and in English too when the job has an English copy.
  const posts = [
    { lang: "ar" as const, text: jobPostText(job, link, "ar"), link },
    ...(hasEnglish(job) ? [{ lang: "en" as const, text: jobPostText(job, linkEn, "en"), link: linkEn }] : []),
  ];

  return (
    <>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{job.title}</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">الحالة: {JOB_STATUSES[status]}</span>
          <ToggleJobStatus id={job.id} status={status} />
        </div>
      </div>

      {saved && (
        <div className="mt-6 rounded-lg border border-brand-100 bg-brand-50 p-4" role="status">
          <p className="flex items-center gap-2 font-medium text-brand-800">
            <CircleCheck size={18} aria-hidden="true" />
            {status === "draft" ? "انحفظت المسودة. ما تظهر للزوار لحد ما تنشرها." : "انحفظت الوظيفة. هذا رابطها:"}
          </p>
          {status !== "draft" && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <code className="rounded border border-line bg-card px-2 py-1.5 text-sm" dir="ltr">
                {link}
              </code>
              <CopyLinkButton url={link} label="انسخ الرابط" copiedLabel="تم النسخ" />
              <a href={`/jobs/${job.slug}`} target="_blank" rel="noopener" className={buttonSmallSecondary}>
                <ExternalLink size={16} aria-hidden="true" />
                افتح الصفحة
              </a>
            </div>
          )}
        </div>
      )}

      {status !== "draft" && <JobPostBox posts={posts} />}

      <div className="mt-6">
        <JobForm
          key={job.updated_at}
          companies={companies ?? []}
          initial={{
            id: job.id,
            title: job.title,
            company_name: job.company_name,
            company_id: job.company_id ?? "",
            hide_company: job.hide_company,
            company_blurb: job.company_blurb ?? "",
            department: job.department,
            governorate: job.governorate,
            area: job.area ?? "",
            job_type: job.job_type,
            work_hours: job.work_hours ?? "",
            salary: job.salary ?? "",
            gender: job.gender ?? "",
            deadline: job.deadline ?? "",
            intro: job.intro ?? "",
            description: job.description,
            responsibilities: job.responsibilities.join("\n"),
            requirements: job.requirements.join("\n"),
            benefits: job.benefits.join("\n"),
            response_days: job.response_days?.toString() ?? "",
            hiring_stages: job.hiring_stages.join("\n"),
            offer_days: job.offer_days?.toString() ?? "",
            slug: job.slug,
            cover_path: job.cover_path,
            status,
            title_en: job.title_en ?? "",
            company_name_en: job.company_name_en ?? "",
            company_blurb_en: job.company_blurb_en ?? "",
            area_en: job.area_en ?? "",
            work_hours_en: job.work_hours_en ?? "",
            salary_en: job.salary_en ?? "",
            intro_en: job.intro_en ?? "",
            description_en: job.description_en,
            responsibilities_en: job.responsibilities_en.join("\n"),
            requirements_en: job.requirements_en.join("\n"),
            benefits_en: job.benefits_en.join("\n"),
            hiring_stages_en: job.hiring_stages_en.join("\n"),
          }}
        />
      </div>

      {(applicants ?? 0) === 0 && (
        <div className="mt-10 border-t border-line pt-6">
          <p className="mb-3 text-sm text-muted">ماكو متقدمين على هذي الوظيفة، فتكدر تحذفها نهائياً.</p>
          <DeleteJobButton id={job.id} />
        </div>
      )}
    </>
  );
}
