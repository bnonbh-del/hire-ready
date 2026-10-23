import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { Faq } from "@/components/faq";
import { WhatsAppIcon } from "@/components/icons";
import { PageHero, wide } from "@/components/page-hero";
import { RevealGroup } from "@/components/reveal";
import { SocialIcons } from "@/components/social-icons";
import { buttonPrimary, buttonSecondary, textLink } from "@/components/ui";
import { alternatesFor, localeOf, t } from "@/lib/i18n";
import { getSettings, socialLinks } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const locale = localeOf((await params).lang);
  const d = t(locale).contact;
  return { title: d.metaTitle, description: d.metaDescription, alternates: alternatesFor(locale, "/contact") };
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const locale = localeOf((await params).lang);
  const d = t(locale).contact;
  const settings = await getSettings();
  const social = socialLinks(settings, locale);
  const address = locale === "en" ? settings?.address_en || settings?.address : settings?.address;
  // WhatsApp is the main way people reach the company; it gets the big card.
  const whatsappNumber = settings?.whatsapp ? `0${settings.whatsapp.replace(/^964/, "")}` : null;

  return (
    <main>
      <PageHero title={d.heading} intro={<p>{d.intro}</p>} />

      <div className={`${wide} grid gap-8 py-16 md:py-24 lg:grid-cols-[1.3fr_1fr]`}>
        <RevealGroup className="space-y-6">
          {settings?.whatsapp && (
            <div className="reveal card-box rounded-2xl p-7 md:p-9">
              <span className="flex text-brand-700">
                <WhatsAppIcon size={28} />
              </span>
              <p className="mt-5 font-display text-2xl font-bold">{d.whatsappTitle}</p>
              <p className="mt-1 text-lg text-ink-soft">
                <span className="sr-only">{d.whatsappNumber}</span>
                <bdi dir="ltr" className="font-display font-bold">
                  {whatsappNumber}
                </bdi>
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${buttonPrimary} w-full sm:w-auto`}
                >
                  <WhatsAppIcon size={20} />
                  {d.openWhatsapp}
                </a>
                {/* For applicants: opens WhatsApp with the start of the message ready. */}
                <a
                  href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(d.applicantMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${buttonSecondary} w-full sm:w-auto`}
                >
                  <WhatsAppIcon size={20} />
                  {d.applicantWhatsapp}
                </a>
              </div>
            </div>
          )}

          <dl className="reveal divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
            {settings?.phone_primary && (
              <Row icon={<Phone size={20} />} label={d.phone}>
                <a href={`tel:${settings.phone_primary}`} dir="ltr" className={textLink}>
                  {settings.phone_primary}
                </a>
                {settings.phone_secondary && (
                  <>
                    {" · "}
                    <a href={`tel:${settings.phone_secondary}`} dir="ltr" className={textLink}>
                      {settings.phone_secondary}
                    </a>
                  </>
                )}
              </Row>
            )}
            {settings?.email && (
              <Row icon={<Mail size={20} />} label={d.email}>
                <a href={`mailto:${settings.email}`} dir="ltr" className={`${textLink} break-all`}>
                  {settings.email}
                </a>
              </Row>
            )}
            {address && (
              <Row icon={<MapPin size={20} />} label={d.address}>
                {address}
                {settings?.map_url && (
                  <>
                    {" · "}
                    <a href={settings.map_url} target="_blank" rel="noopener noreferrer" className={textLink}>
                      {d.openMap}
                    </a>
                  </>
                )}
              </Row>
            )}
          </dl>
        </RevealGroup>

        {social.length > 0 && (
          <RevealGroup className="self-start">
            <div className="reveal rounded-2xl bg-surface p-6 md:p-7">
              <h2 className="text-xl font-semibold">{d.accounts}</h2>
              <div className="mt-6">
                <SocialIcons links={social} labeled />
              </div>
            </div>
          </RevealGroup>
        )}
      </div>

      <section className="bg-surface py-16 md:py-24" aria-labelledby="faq-title">
        <div className={`${wide}`}>
          <div className="mx-auto max-w-3xl">
            <Faq locale={locale} />
          </div>
        </div>
      </section>
    </main>
  );
}

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-4 px-5 py-4">
      <span className="flex shrink-0 pt-0.5 text-brand-700" aria-hidden="true">
        {icon}
      </span>
      <div>
        <dt className="text-sm text-muted">{label}</dt>
        <dd className="mt-0.5 font-medium">{children}</dd>
      </div>
    </div>
  );
}
