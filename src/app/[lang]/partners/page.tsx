import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageHero, wide } from "@/components/page-hero";
import { RevealGroup } from "@/components/reveal";
import { alternatesFor, localeOf, t } from "@/lib/i18n";
import { getPartners } from "@/lib/public-data";
import { publicImageUrl } from "@/lib/storage";

export async function generateMetadata({ params }: PageProps<"/[lang]/partners">): Promise<Metadata> {
  const locale = localeOf((await params).lang);
  const d = t(locale).partners;
  return { title: d.metaTitle, description: d.text, alternates: alternatesFor(locale, "/partners") };
}

export default async function PartnersPage({ params }: PageProps<"/[lang]/partners">) {
  const locale = localeOf((await params).lang);
  const d = t(locale).partners;
  const partners = await getPartners();
  // No contracted companies yet: the page (and its nav link) doesn't exist.
  if (partners.length === 0) notFound();

  return (
    <main>
      <PageHero title={d.heading} intro={<p>{d.text}</p>} />
      <RevealGroup className={`${wide} grid grid-cols-2 gap-5 py-16 sm:grid-cols-3 md:py-24 lg:grid-cols-4`}>
        {partners.map((p) => {
          const name = (locale === "en" && p.name_en) || p.name;
          const card = (
            <>
              <div className="flex h-28 items-center justify-center border-b border-line p-5">
                {p.logo_path ? (
                  <Image src={publicImageUrl(p.logo_path)} alt="" width={200} height={80} unoptimized className="max-h-16 w-auto object-contain" />
                ) : (
                  <span className="text-sm text-muted">{d.noLogo}</span>
                )}
              </div>
              <p className="px-4 py-3 text-center font-medium">{name}</p>
            </>
          );
          return p.website ? (
            <a key={p.id} href={p.website} target="_blank" rel="noopener noreferrer" className="reveal card-lift overflow-hidden rounded-2xl">
              {card}
            </a>
          ) : (
            <div key={p.id} className="reveal card-lift overflow-hidden rounded-2xl">
              {card}
            </div>
          );
        })}
      </RevealGroup>
    </main>
  );
}
