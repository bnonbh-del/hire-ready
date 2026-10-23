import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { localePath } from "@/lib/i18n";
import { hasEnglish } from "@/lib/job-display";
import { getPartners, getSitemapJobs } from "@/lib/public-data";

/**
 * Every public page in both languages, with hreflang links between them, plus
 * every open job (its English URL only when the job has an English copy).
 * /partners only when there are partners to show.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = env.siteUrl.replace(/\/$/, "");
  const [jobs, partners] = await Promise.all([getSitemapJobs(), getPartners()]);
  const url = (path: string) => `${site}${path}`;
  const both = (path: string) => ({ languages: { ar: url(localePath("ar", path)), en: url(localePath("en", path)) } });

  const pages = ["/", "/jobs", "/services", "/about", ...(partners.length > 0 ? ["/partners"] : []), "/contact"];

  return [
    ...pages.flatMap((path) => [
      { url: url(localePath("ar", path)), alternates: both(path) },
      { url: url(localePath("en", path)), alternates: both(path) },
    ]),
    ...jobs.flatMap((job) => {
      const path = `/jobs/${job.slug}`;
      const lastModified = new Date(job.updated_at);
      if (!hasEnglish(job)) return [{ url: url(path), lastModified }];
      return [
        { url: url(localePath("ar", path)), lastModified, alternates: both(path) },
        { url: url(localePath("en", path)), lastModified, alternates: both(path) },
      ];
    }),
  ];
}
