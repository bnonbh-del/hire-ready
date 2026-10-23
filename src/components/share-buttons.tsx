import { CopyLinkButton } from "@/components/copy-link-button";
import { TelegramIcon, WhatsAppIcon } from "@/components/icons";
import { buttonSmallSecondary } from "@/components/ui";
import { t, type Locale } from "@/lib/i18n";

export function telegramShareUrl(url: string, text?: string) {
  // encodeURIComponent (spaces as %20), not URLSearchParams ("+"), so no "+" can show up in the post.
  const query = `url=${encodeURIComponent(url)}${text ? `&text=${encodeURIComponent(text)}` : ""}`;
  return `https://t.me/share/url?${query}`;
}

export function whatsappShareUrl(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/** Copy link + share on Telegram + share on WhatsApp. */
export function ShareButtons({ url, title, locale, className = "" }: { url: string; title: string; locale: Locale; className?: string }) {
  const d = t(locale).job.share;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <CopyLinkButton url={url} label={d.copy} copiedLabel={d.copied} />
      <a href={telegramShareUrl(url, title)} target="_blank" rel="noopener noreferrer" className={`${buttonSmallSecondary} btn-lift rounded-full`}>
        <TelegramIcon size={16} />
        {d.telegram}
      </a>
      <a href={whatsappShareUrl(`${title}\n${url}`)} target="_blank" rel="noopener noreferrer" className={`${buttonSmallSecondary} btn-lift rounded-full`}>
        <WhatsAppIcon size={16} />
        {d.whatsapp}
      </a>
    </div>
  );
}
