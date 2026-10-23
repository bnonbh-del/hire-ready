import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin/auth";

/**
 * GET /admin/cv/[id]: opens an applicant's CV (?download=1 to save it).
 * CVs sit in a private bucket; this checks the admin, then redirects to a
 * signed link that stops working after 60 seconds.
 */
export async function GET(request: Request, ctx: RouteContext<"/admin/cv/[id]">) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.redirect(new URL("/admin/login", request.url));

  const { id } = await ctx.params;
  const { data: application } = await admin.supabase
    .from("applications")
    .select("full_name, cv_path")
    .eq("id", id)
    .maybeSingle();
  if (!application) return new Response("Not found", { status: 404 });
  if (!application.cv_path) return new Response("هذا المتقدم ما رفع سيرة ذاتية، كتب نبذة بدلها.", { status: 404 });

  const download = new URL(request.url).searchParams.has("download");
  const { data, error } = await admin.supabase.storage
    .from("cvs")
    .createSignedUrl(application.cv_path, 60, download ? { download: `CV - ${application.full_name}.pdf` } : undefined);
  if (error || !data) return new Response("Could not open the file", { status: 500 });

  return NextResponse.redirect(data.signedUrl);
}
