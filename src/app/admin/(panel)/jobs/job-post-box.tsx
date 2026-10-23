"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { TelegramIcon, WhatsAppIcon } from "@/components/icons";
import { telegramShareUrl, whatsappShareUrl } from "@/components/share-buttons";
import { buttonSmallSecondary } from "@/components/ui";

export interface JobPost {
  lang: "ar" | "en";
  text: string;
  /** The job link in that language (/jobs/... or /en/jobs/...). */
  link: string;
}

/**
 * The ready-to-paste channel post for a job, with copy / share buttons: the
 * Arabic one, plus an English tab when the job has an English copy (each with
 * its own link). Telegram's share page puts the link above the text itself,
 * so the text sent there leaves out the link block to avoid showing it twice.
 */
export function JobPostBox({ posts }: { posts: JobPost[] }) {
  const [active, setActive] = useState<"ar" | "en">("ar");
  const post = posts.find((p) => p.lang === active) ?? posts[0];

  return (
    <section aria-labelledby="job-post-title" className="mt-6 rounded-2xl border border-line bg-card p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="job-post-title" className="font-display text-lg font-semibold">
          نص المنشور
        </h2>
        {posts.length > 1 && (
          <div role="tablist" aria-label="لغة المنشور" className="inline-flex rounded-full border border-line p-1">
            {posts.map((p) => (
              <button
                key={p.lang}
                type="button"
                role="tab"
                aria-selected={active === p.lang}
                onClick={() => setActive(p.lang)}
                className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${
                  active === p.lang ? "bg-primary text-on-primary" : "text-ink-soft hover:text-ink"
                }`}
              >
                {p.lang === "ar" ? "عربي" : "English"}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="mt-1 text-sm text-ink-soft">
        للنشر بقنوات تلكرام وواتساب. الرابط بآخره{posts.length === 1 ? ". (ما بيها نسخة إنكليزية: اكتب النص الإنكليزي بتبويب English تحت حتى تطلع.)" : "."}
      </p>
      <PostText key={post.lang} post={post} />
    </section>
  );
}

function PostText({ post }: { post: JobPost }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(post.text);
    } catch {
      const area = document.getElementById(`job-post-text-${post.lang}`) as HTMLTextAreaElement | null;
      area?.select();
      document.execCommand("copy");
    }
    setCopied(true);
  }

  // Drop the last block (the "للتقديم:" / "Apply here:" link) for Telegram.
  const telegramText = post.text.replace(/\n\n[^\n]+:\n[^\n]*$/, "");

  return (
    <>
      <textarea
        id={`job-post-text-${post.lang}`}
        readOnly
        value={post.text}
        dir={post.lang === "en" ? "ltr" : "rtl"}
        lang={post.lang}
        rows={Math.min(22, post.text.split("\n").length + 1)}
        className="mt-4 block w-full resize-y rounded-md border border-line bg-surface p-3 leading-7"
        onFocus={(e) => e.currentTarget.select()}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={copy} className={buttonSmallSecondary}>
          {copied ? <Check size={16} aria-hidden="true" className="check-pop" /> : <Copy size={16} aria-hidden="true" />}
          <span aria-live="polite">{copied ? "تم النسخ" : "انسخ النص"}</span>
        </button>
        <a href={telegramShareUrl(post.link, telegramText)} target="_blank" rel="noopener noreferrer" className={buttonSmallSecondary}>
          <TelegramIcon size={16} />
          شارك بتلكرام
        </a>
        <a href={whatsappShareUrl(post.text)} target="_blank" rel="noopener noreferrer" className={buttonSmallSecondary}>
          <WhatsAppIcon size={16} />
          شارك بواتساب
        </a>
      </div>
    </>
  );
}
