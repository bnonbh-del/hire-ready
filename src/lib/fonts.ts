import { IBM_Plex_Sans_Arabic } from "next/font/google";

/*
 * One font for the whole site and /admin, Arabic and English: IBM Plex Sans
 * Arabic (it has Latin letters too). Weights:
 *   700 main headings (h1, section titles) · 600 subheadings (h3, card titles)
 *   500 menus, buttons, labels · 400 body text.
 * Only these four are downloaded (as one font family, self-hosted by Next).
 */
const plex = IBM_Plex_Sans_Arabic({
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-plex",
});

export const fontVariables = plex.variable;
