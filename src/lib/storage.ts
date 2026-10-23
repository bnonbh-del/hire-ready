/**
 * Turns a stored image path into a URL.
 * - Paths starting with "/" are files in web/public (e.g. "/founders/x.jpg").
 * - Anything else is a path inside the public Supabase bucket "public".
 */
export function publicImageUrl(path: string): string {
  if (path.startsWith("/") || path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public/${path}`;
}
