import "server-only";
import path from "node:path";
import { createCanvas, GlobalFonts, loadImage, type SKRSContext2D } from "@napi-rs/canvas";
import { cacheLife, cacheTag } from "next/cache";
import { BRAND } from "@/lib/brand";
import { COMPANY } from "@/lib/content";
import { TAGS, jobTag } from "@/lib/cache-tags";
import type { Locale } from "@/lib/i18n";
import { isolateNumbers, jobText } from "@/lib/job-display";
import { getPublishedJob } from "@/lib/jobs";

/*
 * Draws the 1200x630 job cover (also the og:image for link previews).
 *
 * Why canvas and not next/og: next/og (Satori) joins Arabic letters but gets
 * word order wrong when a line mixes Arabic with numbers or symbols, and it
 * spaces Arabic words unevenly. Skia (@napi-rs/canvas) shapes Arabic the way
 * browsers do.
 */

export const COVER_WIDTH = 1200;
export const COVER_HEIGHT = 630;

const ROOT = process.cwd();
GlobalFonts.registerFromPath(path.join(ROOT, "src/assets/fonts/IBMPlexSansArabic-Bold.ttf"), "Plex Bold");
GlobalFonts.registerFromPath(path.join(ROOT, "src/assets/fonts/IBMPlexSansArabic-Medium.ttf"), "Plex Medium");
const logoImage = loadImage(path.join(ROOT, "public/logo/logo-mark.png"));

const PAD = 80;
const TEXT_WIDTH = COVER_WIDTH - PAD * 2;

/** Splits text into lines that fit `maxWidth` at the current font. */
function wrapLines(ctx: SKRSContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.trim().split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Largest title size that fits in 3 lines; at the smallest size, cuts with "…". */
function fitTitle(ctx: SKRSContext2D, title: string): { size: number; lines: string[] } {
  for (const size of [76, 66, 58]) {
    ctx.font = `${size}px "Plex Bold"`;
    const lines = wrapLines(ctx, title, TEXT_WIDTH);
    if (lines.length <= 3) return { size, lines };
  }
  const size = 58;
  ctx.font = `${size}px "Plex Bold"`;
  const lines = wrapLines(ctx, title, TEXT_WIDTH).slice(0, 3);
  while (lines[2].length > 1 && ctx.measureText(`${lines[2]}…`).width > TEXT_WIDTH) {
    lines[2] = lines[2].slice(0, -1).trimEnd();
  }
  lines[2] = `${lines[2]}…`;
  return { size, lines };
}

/** `rtl`: Arabic, laid out from the right edge; otherwise English from the left. */
async function drawCover(title: string, subtitle: string, rtl: boolean): Promise<Uint8Array> {
  const canvas = createCanvas(COVER_WIDTH, COVER_HEIGHT);
  const ctx = canvas.getContext("2d");
  ctx.direction = rtl ? "rtl" : "ltr";
  ctx.textAlign = rtl ? "right" : "left";
  // Where lines start (the right edge for Arabic, the left for English).
  const start = rtl ? COVER_WIDTH - PAD : PAD;
  const inward = rtl ? -1 : 1;

  ctx.fillStyle = BRAND.brand500;
  ctx.fillRect(0, 0, COVER_WIDTH, COVER_HEIGHT);

  // Logo tile (the logo has a white background) + name, top corner on the start side.
  const tile = 96;
  const tileX = rtl ? start - tile : start;
  ctx.fillStyle = BRAND.white;
  ctx.beginPath();
  ctx.roundRect(tileX, 64, tile, tile, 18);
  ctx.fill();
  ctx.drawImage(await logoImage, tileX + 10, 74, tile - 20, tile - 20);

  const nameX = start + inward * (tile + 24);
  ctx.fillStyle = BRAND.white;
  ctx.font = `34px "Plex Bold"`;
  ctx.fillText(COMPANY.name, nameX, 106);
  ctx.globalAlpha = 0.85;
  ctx.font = `24px "Plex Medium"`;
  ctx.fillText(COMPANY.descriptor, nameX, 142);
  ctx.globalAlpha = 1;

  // Title, vertically centred in the middle band.
  const { size, lines } = fitTitle(ctx, title);
  const lineHeight = size * 1.35;
  const bandTop = 200;
  const bandBottom = 500;
  let y = bandTop + (bandBottom - bandTop - lineHeight * lines.length) / 2 + size;
  ctx.font = `${size}px "Plex Bold"`;
  for (const line of lines) {
    // Isolates per line (after wrapping) keep ranges like "8:00 - 4:00" in order.
    ctx.fillText(rtl ? isolateNumbers(line) : line, start, y);
    y += lineHeight;
  }

  // Divider + company · governorate.
  ctx.globalAlpha = 0.35;
  ctx.fillRect(PAD, 520, TEXT_WIDTH, 2);
  ctx.globalAlpha = 1;
  ctx.font = `34px "Plex Medium"`;
  ctx.fillText(rtl ? isolateNumbers(subtitle) : subtitle, start, 578);

  return new Uint8Array(await canvas.encode("png"));
}

/**
 * PNG bytes for a published job's cover in a page language, or null if
 * there's no such job. English uses the job's English copy when it has one
 * (otherwise the Arabic). Cached per job and language.
 */
export async function renderJobCover(slug: string, locale: Locale): Promise<Uint8Array | null> {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.jobs, jobTag(slug));

  const job = await getPublishedJob(slug);
  if (!job) return null;
  // jobText() never returns a hidden company's name.
  const view = jobText(job, locale);
  return drawCover(view.title, `${view.company} · ${view.location}`, view.lang === "ar");
}
