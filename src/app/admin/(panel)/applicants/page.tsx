import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Download, Eye, FileSpreadsheet, Search } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { buttonSecondary, buttonSmallSecondary, inputClass, textLink } from "@/components/ui";
import {
  PAGE_SIZE,
  applicantsQuery,
  parseFilters,
  whatsappLink,
  type ApplicantFilters,
  type ApplicantRow,
} from "@/lib/admin/applicants";
import { requireAdmin } from "@/lib/admin/auth";
import { DEPARTMENTS, experienceLabel, type ApplicationStatus, type Department } from "@/lib/constants";
import { formatDate, todayInBaghdad } from "@/lib/jobs";
import { AboutButton } from "./about-button";
import { DeleteApplicationButton, StatusSelect } from "./row-controls";

export const metadata: Metadata = { title: "المتقدمين" };

export default function ApplicantsPage(props: PageProps<"/admin/applicants">) {
  return (
    <>
      <h1 className="text-2xl font-bold">المتقدمين</h1>
      <Suspense fallback={<div className="mt-6 h-96 rounded-2xl bg-card" />}>
        <Applicants {...props} />
      </Suspense>
    </>
  );
}

function query(filters: ApplicantFilters, extra: Record<string, string | number> = {}) {
  const params = new URLSearchParams({ dept: filters.department });
  if (filters.q) params.set("q", filters.q);
  if (filters.jobId) params.set("job", filters.jobId);
  for (const [k, v] of Object.entries(extra)) params.set(k, String(v));
  return params.toString();
}

async function Applicants({ searchParams }: PageProps<"/admin/applicants">) {
  const raw = await searchParams;
  const filters = parseFilters(raw);
  const page = Math.max(1, Number(Array.isArray(raw.page) ? raw.page[0] : raw.page) || 1);
  const { supabase } = await requireAdmin();

  const from = (page - 1) * PAGE_SIZE;
  const [{ data: deptRows }, { data, count, error }, { data: filterJob }] = await Promise.all([
    supabase.from("applications").select("department"),
    applicantsQuery(supabase, filters).range(from, from + PAGE_SIZE - 1),
    filters.jobId
      ? supabase.from("jobs").select("title").eq("id", filters.jobId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const counts = new Map<string, number>();
  for (const row of deptRows ?? []) counts.set(row.department, (counts.get(row.department) ?? 0) + 1);

  const rows = (data ?? []) as unknown as ApplicantRow[];
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      {/* Department tabs */}
      <nav aria-label="الأقسام" className="mt-6 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-line">
        {(Object.entries(DEPARTMENTS) as [Department, string][]).map(([key, label]) => {
          const active = key === filters.department;
          return (
            <Link
              key={key}
              href={`/admin/applicants?dept=${key}`}
              aria-current={active ? "page" : undefined}
              className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium ${
                active ? "border-brand-700 text-brand-700" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              {label}
              <span className={`rounded px-1.5 text-xs ${active ? "bg-brand-50" : "bg-card"}`}>{counts.get(key) ?? 0}</span>
            </Link>
          );
        })}
      </nav>

      {/* Search + export */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <form className="flex min-w-0 flex-1 gap-2" role="search">
          <input type="hidden" name="dept" value={filters.department} />
          {filters.jobId && <input type="hidden" name="job" value={filters.jobId} />}
          <label htmlFor="q" className="sr-only">
            بحث بالاسم أو الرقم
          </label>
          <input
            id="q"
            name="q"
            defaultValue={filters.q}
            placeholder="بحث بالاسم أو رقم الهاتف"
            className={`${inputClass} max-w-sm py-2`}
          />
          <button type="submit" className={buttonSmallSecondary}>
            <Search size={16} aria-hidden="true" />
            بحث
          </button>
        </form>
        <a href={`/admin/applicants/export?${query(filters)}`} className={buttonSecondary}>
          <FileSpreadsheet size={18} aria-hidden="true" />
          تصدير Excel ({DEPARTMENTS[filters.department]})
        </a>
      </div>

      {(filters.q || filterJob) && (
        <p className="mt-3 text-sm text-ink-soft">
          {filterJob && <>الوظيفة: {filterJob.title}. </>}
          {filters.q && <>البحث: &quot;{filters.q}&quot;. </>}
          {total} نتيجة.{" "}
          <Link href={`/admin/applicants?dept=${filters.department}`} className={textLink}>
            مسح الفلتر
          </Link>
        </p>
      )}

      {error ? (
        <p className="mt-6 text-danger">ما انقرت البيانات: {error.message}</p>
      ) : rows.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-line bg-card p-6 text-ink-soft">ماكو متقدمين هنا.</p>
      ) : (
        <div className="relative mt-4 overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b border-line bg-surface text-ink-soft">
              <tr>
                <th className="px-3 py-3 text-start font-medium">الاسم</th>
                <th className="px-3 py-3 text-start font-medium">الرقم</th>
                <th className="px-3 py-3 text-start font-medium">الوظيفة</th>
                <th className="px-3 py-3 text-start font-medium">المحافظة</th>
                <th className="px-3 py-3 text-start font-medium">الخبرة</th>
                <th className="px-3 py-3 text-start font-medium">التاريخ</th>
                <th className="px-3 py-3 text-start font-medium">الحالة</th>
                <th className="px-3 py-3 text-start font-medium">السيرة / النبذة</th>
                <th className="px-3 py-3">
                  <span className="sr-only">حذف</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((a) => (
                <tr key={a.id} className="align-middle">
                  <td className="px-3 py-3">
                    <div className="font-medium">{a.full_name}</div>
                    <div className="text-xs text-muted" dir="ltr">
                      {a.email}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <a href={`tel:${a.phone}`} dir="ltr" className="hover:text-brand-700">
                        {a.phone}
                      </a>
                      <a
                        href={whatsappLink(a.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`واتساب ${a.full_name}`}
                        className="text-brand-700 hover:text-brand-800"
                      >
                        <WhatsAppIcon size={16} />
                      </a>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {a.job ? (
                      <Link href={`/admin/applicants?${query({ ...filters, q: "", jobId: a.job_id })}`} className="hover:text-brand-700">
                        {a.job.title}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-3">{a.governorate}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{experienceLabel(a.years_experience)}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-ink-soft">{formatDate(todayInBaghdad(new Date(a.created_at)))}</td>
                  <td className="px-3 py-3">
                    <StatusSelect id={a.id} status={a.status as ApplicationStatus} name={a.full_name} />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {a.cv_path && (
                        <>
                          <a href={`/admin/cv/${a.id}`} target="_blank" rel="noopener" className={buttonSmallSecondary}>
                            <Eye size={15} aria-hidden="true" />
                            عرض
                          </a>
                          <a href={`/admin/cv/${a.id}?download=1`} className={buttonSmallSecondary} aria-label={`تنزيل سيرة ${a.full_name}`}>
                            <Download size={15} aria-hidden="true" />
                          </a>
                        </>
                      )}
                      {a.about && <AboutButton name={a.full_name} about={a.about} label={a.cv_path ? "النبذة" : "عرض النبذة"} />}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <DeleteApplicationButton id={a.id} name={a.full_name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="الصفحات" className="mt-4 flex items-center justify-between text-sm">
          <span className="text-ink-soft">
            صفحة {page} من {pages} ({total} متقدم)
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/admin/applicants?${query(filters, { page: page - 1 })}`} className={buttonSmallSecondary}>
                السابقة
              </Link>
            )}
            {page < pages && (
              <Link href={`/admin/applicants?${query(filters, { page: page + 1 })}`} className={buttonSmallSecondary}>
                التالية
              </Link>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
