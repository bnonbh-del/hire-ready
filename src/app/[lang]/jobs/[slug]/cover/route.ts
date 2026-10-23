import { renderJobCover } from "@/lib/cover-image";
import { isLocale } from "@/lib/i18n";

/** GET /jobs/[slug]/cover (Arabic) or /en/jobs/[slug]/cover (English): the generated cover image (PNG, 1200x630). */
export async function GET(_request: Request, ctx: RouteContext<"/[lang]/jobs/[slug]/cover">) {
  const { lang, slug } = await ctx.params;
  const png = await renderJobCover(slug, isLocale(lang) ? lang : "ar");
  if (!png) return new Response("Not found", { status: 404 });

  return new Response(Buffer.from(png), {
    headers: {
      "Content-Type": "image/png",
      // The URL carries ?v=<last edit>, so a changed job gets a new URL.
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
}
