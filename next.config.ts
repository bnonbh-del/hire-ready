import path from "node:path";
import type { NextConfig } from "next";

// Founder photos uploaded from /admin live in Supabase Storage; next/image may resize them.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null;

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    // 90: founder photos (large, people's faces); 75: the default everywhere else.
    qualities: [75, 90],
    remotePatterns: supabaseHost ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }] : [],
  },
  partialPrefetching: true,
  experimental: {
    // Public pages live under app/[lang] and /admin has its own root layout,
    // so unmatched URLs get one shared 404 page (app/global-not-found.tsx).
    globalNotFound: true,
  },
  // Native module (Skia) used to draw job cover images; must not be bundled.
  serverExternalPackages: ["@napi-rs/canvas"],
  // Files read from disk when drawing covers; make sure Vercel ships them.
  outputFileTracingIncludes: {
    "/[lang]/jobs/[slug]/cover": ["./src/assets/fonts/**", "./public/logo/logo-mark.png"],
  },
  turbopack: {
    // The old static site in the parent folder has its own package-lock.json.
    root: path.resolve(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
