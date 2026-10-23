import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { applicantsQuery, parseFilters, type ApplicantRow } from "@/lib/admin/applicants";
import { getAdmin } from "@/lib/admin/auth";
import { APPLICATION_STATUSES, DEPARTMENTS, experienceLabel, type ApplicationStatus } from "@/lib/constants";
import { todayInBaghdad } from "@/lib/jobs";

/** GET /admin/applicants/export?dept=sales[&q=][&job=]: the current tab as an .xlsx file. */
export async function GET(request: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.redirect(new URL("/admin/login", request.url));

  const filters = parseFilters(Object.fromEntries(new URL(request.url).searchParams));
  const { data, error } = await applicantsQuery(admin.supabase, filters).range(0, 9999);
  if (error) return new Response(`Export failed: ${error.message}`, { status: 500 });
  const rows = (data ?? []) as unknown as ApplicantRow[];

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(DEPARTMENTS[filters.department], {
    views: [{ rightToLeft: true, state: "frozen", ySplit: 1 }],
  });
  sheet.columns = [
    { header: "الاسم", key: "name", width: 28 },
    { header: "رقم الهاتف", key: "phone", width: 16 },
    { header: "البريد الإلكتروني", key: "email", width: 30 },
    { header: "المحافظة", key: "governorate", width: 14 },
    { header: "سنوات الخبرة", key: "years", width: 16 },
    { header: "الوظيفة", key: "job", width: 30 },
    { header: "تاريخ التقديم", key: "date", width: 14 },
    { header: "الحالة", key: "status", width: 14 },
    { header: "سيرة ذاتية", key: "hasCv", width: 11 },
    { header: "النبذة", key: "about", width: 60 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.getColumn("about").alignment = { wrapText: true, vertical: "top" };

  for (const a of rows) {
    sheet.addRow({
      name: a.full_name,
      phone: a.phone, // kept as text so the leading 0 stays
      email: a.email,
      governorate: a.governorate,
      years: experienceLabel(a.years_experience),
      job: a.job?.title ?? "",
      date: todayInBaghdad(new Date(a.created_at)),
      status: APPLICATION_STATUSES[a.status as ApplicationStatus] ?? a.status,
      hasCv: a.cv_path ? "نعم" : "لا",
      about: a.about ?? "",
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `applicants-${filters.department}-${todayInBaghdad()}.xlsx`;
  return new Response(new Uint8Array(buffer as ArrayBuffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
