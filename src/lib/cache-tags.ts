/**
 * Names for cached public data. Public pages tag their "use cache" reads with
 * these; /admin calls updateTag(...) after a change so visitors see it at once.
 */
export const TAGS = {
  jobs: "jobs",
  companies: "companies",
  founders: "founders",
  services: "services",
  settings: "settings",
} as const;

export function jobTag(slug: string) {
  return `job:${slug}`;
}
