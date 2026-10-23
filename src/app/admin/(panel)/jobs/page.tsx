import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { CopyLinkButton } from "@/components/copy-link-button";
import { buttonPrimary, buttonSmallSecondary, textLink } from "@/components/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { DEPARTMENTS, JOB_STATUSES, type Department, type JobStatus } from "@/lib/constants";
import { env } from "@/lib/env";
import { formatDate, jobUrl } from "@/lib/jobs";
import { ToggleJobStatus } from "./job-buttons";

export const metadata: Metadata = { title: "الوظائف" };

export default function JobsAdminPage() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">الوظائف</h1>
        <Link href="/admin/jobs/new" className={buttonPrimary}>
          <Plus size={18} aria-hidden="true" />
          إضافة وظيفة
        </Link>
      </div>
      <Suspense fallback={<div className="mt-6 h-64 rounded-2xl bg-card" />}>
        <JobsTable />
      </Suspense>
    </>
  );
}

const STATUS_STYLE: Record<JobStatus, string> = {
  open: "bg-brand-50 text-brand-700",
  closed: "bg-surface text-muted",
  draft: "bg-accent-50 text-accent-700",
};

async function JobsTable() {
  const { supabase } = await requireAdmin();
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, slug, title, company_name, department, status, published_at, created_at, applications(count)")
    .order("created_at", { ascending: false });

  if (error) return <p className="mt-6 text-danger">ما انقرت الوظائف: {error.message}</p>;
  if (!jobs?.length) {
    return (
      <p className="mt-6 rounded-2xl border border-line bg-card p-6 text-ink-soft">
        ماكو وظائف بعد. اضغط &quot;إضافة وظيفة&quot; حتى تنشر أول وحدة.
      </p>
    );
  }

  return (
    <div className="relative mt-6 overflow-x-auto rounded-2xl border border-line bg-card">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="border-b border-line bg-surface text-start text-ink-soft">
          <tr>
            <th className="px-4 py-3 text-start font-medium">الوظيفة</th>
            <th className="px-4 py-3 text-start font-medium">القسم</th>
            <th className="px-4 py-3 text-start font-medium">الحالة</th>
            <th className="px-4 py-3 text-start font-medium">المتقدمين</th>
            <th className="px-4 py-3 text-start font-medium">تاريخ النشر</th>
            <th className="px-4 py-3 text-start font-medium">
              <span className="sr-only">إجراءات</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {jobs.map((job) => {
            const status = job.status as JobStatus;
            const applicants = (job.applications as unknown as { count: number }[])[0]?.count ?? 0;
            return (
              <tr key={job.id} className="align-top">
                <td className="px-4 py-3">
                  <Link href={`/admin/jobs/${job.id}`} className="font-medium hover:text-brand-700">
                    {job.title}
                  </Link>
                  <div className="text-muted">{job.company_name}</div>
                </td>
                <td className="px-4 py-3">{DEPARTMENTS[job.department as Department]}</td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[status]}`}>{JOB_STATUSES[status]}</span>
                </td>
                <td className="px-4 py-3">
                  {applicants > 0 ? (
                    <Link href={`/admin/applicants?dept=${job.department}&job=${job.id}`} className={textLink}>
                      {applicants}
                    </Link>
                  ) : (
                    <span className="text-muted">0</span>
                  )}
                </td>
                <td className="px-4 py-3 text-ink-soft">{job.published_at ? formatDate(job.published_at) : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-2">
                    {status !== "draft" && <CopyLinkButton url={jobUrl(env.siteUrl, job.slug)} label="انسخ الرابط" copiedLabel="تم النسخ" />}
                    <ToggleJobStatus id={job.id} status={status} />
                    <Link href={`/admin/jobs/${job.id}`} className={buttonSmallSecondary}>
                      تعديل
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
