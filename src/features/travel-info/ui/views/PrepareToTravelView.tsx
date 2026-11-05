"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, BriefcaseBusiness, ClipboardCheck, CircleHelp, Radar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TravelSectionLayout } from "@/src/components/layout/TravelSectionLayout";

const resources = [
  { key: "baggage", icon: BriefcaseBusiness, href: "/faqs/baggage-guidelines" },
  { key: "checkin", icon: ClipboardCheck, href: "/faqs/online-checkin-info" },
  { key: "flightStatus", icon: Radar, href: "/flight-status" },
  { key: "faqs", icon: BookOpen, href: "/faqs" },
  { key: "help", icon: CircleHelp, href: "/faqs/customer-support" },
];

export default function PrepareToTravelView() {
  const { t } = useTranslation();
  return (
    <TravelSectionLayout eyebrow={t("travelPages.eyebrow")} title={t("travelPages.prepareTitle")} description={t("travelPages.prepareDescription")}>
      <section aria-labelledby="resources-heading" className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-8">
        <div className="relative overflow-hidden rounded-[28px] bg-airline-forest p-6 text-white sm:p-8">
          <div className="pointer-events-none absolute -right-14 -top-14 h-56 w-56 rounded-full border border-white/15 shadow-[0_0_0_24px_rgb(255_255_255_/_5%),0_0_0_48px_rgb(255_255_255_/_4%)]" aria-hidden="true" />
          <p className="relative text-xs font-bold uppercase tracking-[.16em] text-airline-gold">{t("travelPages.resourcesEyebrow")}</p>
          <h2 id="resources-heading" className="relative mt-2 font-serif text-3xl leading-tight sm:text-4xl">{t("travelPages.resourcesTitle")}</h2>
          <p className="relative mt-4 max-w-sm text-sm leading-6 text-white/80">{t("travelPages.officialInfoNote")}</p>
        </div>
        <ol className="overflow-hidden rounded-[28px] border border-airline-line bg-airline-paper shadow-[0_12px_32px_rgb(23_40_59_/_6%)]">
          {resources.map(({ key, icon: Icon, href }, index) => (
            <li key={key} className="border-b border-airline-line last:border-b-0">
              <Link href={href} className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 px-4 py-5 text-airline-ink no-underline transition-colors hover:bg-airline-forest-soft focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-airline-forest sm:gap-4 sm:px-6">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-airline-forest-soft text-airline-forest group-hover:bg-airline-forest group-hover:text-white"><Icon size={18} aria-hidden="true" /></span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold tracking-[.18em] text-airline-garnet" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span className="mt-1 block text-base font-semibold text-airline-night">{t("travelPages.resources." + key + ".title")}</span>
                  <span className="mt-1 block text-sm leading-6 text-airline-muted">{t("travelPages.resources." + key + ".description")}</span>
                </span>
                <ArrowRight size={18} className="mt-3 text-airline-forest" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </TravelSectionLayout>
  );
}
