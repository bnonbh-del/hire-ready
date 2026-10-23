import { InstagramIcon, LinkedInIcon, TelegramIcon, WhatsAppIcon } from "@/components/icons";
import type { SocialLink } from "@/lib/site";

const ICONS = {
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
  whatsapp: WhatsAppIcon,
  telegram: TelegramIcon,
};

/**
 * Outline icons in the brand color; only the links that are filled in.
 * `labeled` adds the names (contact page); `onNavy` is for the dark footer.
 */
export function SocialIcons({ links, labeled = false, onNavy = false }: { links: SocialLink[]; labeled?: boolean; onNavy?: boolean }) {
  if (links.length === 0) return null;
  if (labeled) {
    return (
      <ul className="space-y-3">
        {links.map((link) => {
          const Icon = ICONS[link.key];
          return (
            <li key={link.key}>
              <a href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 font-medium hover:text-brand-700">
                <span className="flex size-10 items-center justify-center rounded-full border border-line text-brand-700">
                  <Icon size={20} />
                </span>
                {link.label}
              </a>
            </li>
          );
        })}
      </ul>
    );
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {links.map((link) => {
        const Icon = ICONS[link.key];
        return (
          <li key={link.key}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              title={link.label}
              className={`btn-lift flex size-10 items-center justify-center rounded-full border ${
                onNavy
                  ? "border-on-navy/25 text-on-navy hover:border-accent-500"
                  : "border-line text-brand-700 hover:border-brand-500 hover:bg-brand-50"
              }`}
            >
              <Icon size={20} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
