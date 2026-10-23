import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { barePath } from "@/lib/i18n";

/**
 * Runs before every page request (not static files).
 *
 * Languages: Arabic pages keep clean URLs (/jobs) and are served from
 * app/[lang] with lang=ar; English pages are /en/… (served as they are).
 * /ar/… redirects to the clean URL.
 *
 * /admin: refreshes the Supabase session cookie so the admin stays signed in,
 * and sends signed-out visitors to the login page. This is not the security
 * check; each admin page also verifies the user on the server.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) return adminSession(request);

  // The admin panel has one address (Arabic only): /en/admin… and /ar/admin… go to /admin….
  if (/^\/(en|ar)\/admin(\/|$)/.test(pathname)) return redirectTo(request, pathname.slice(3));

  if (pathname === "/ar" || pathname.startsWith("/ar/")) {
    return redirectTo(request, barePath(pathname));
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/ar" : `/ar${pathname}`;
  return NextResponse.rewrite(url);
}

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

async function adminSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  // Not configured yet (no .env.local): let the page render and report it.
  if (!supabaseUrl || !supabaseKey) return response;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        // Responses that set auth cookies must never be cached.
        for (const [key, value] of Object.entries(headers ?? {})) response.headers.set(key, value);
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!data?.claims && !isLoginPage) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  // Everything except Next's own files and files with an extension
  // (images, /robots.txt, /sitemap.xml, /icon.png...).
  matcher: ["/((?!_next/|.*\\.[^/]+$).*)"],
};
