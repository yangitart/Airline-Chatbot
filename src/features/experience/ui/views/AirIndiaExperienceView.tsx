"use client";

import Image from "next/image";
import { ArrowUpRight, Armchair, Plane, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TravelSectionLayout } from "@/src/components/layout/TravelSectionLayout";

const experienceAreas = [
  { key: "inAir", icon: Armchair, href: "https://www.airindia.com/in/en/experience/in-air.html" },
  { key: "fleet", icon: Plane, href: "https://www.airindia.com/in/en/experience/airindia-fleet.html" },
  { key: "transformation", icon: Sparkles, href: "https://www.airindia.com/in/en/experience/transforming-customer-experience.html" },
];

export default function AirIndiaExperienceView() {
  const { t } = useTranslation();
  return (
    <TravelSectionLayout eyebrow={t("travelPages.eyebrow")} title={t("travelPages.experienceTitle")} description={t("travelPages.experienceDescription")}>
      <section aria-labelledby="experience-heading">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-airline-garnet">{t("travelPages.experienceEyebrow")}</p>
        <h2 id="experience-heading" className="mb-5 mt-2 font-serif text-3xl leading-tight text-airline-night sm:text-4xl">{t("travelPages.experienceAreasHeading")}</h2>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <a href="https://www.airindia.com/in/en/experience/airport.html" target="_blank" rel="noreferrer"
            className="group relative isolate flex min-h-[330px] flex-col justify-end overflow-hidden rounded-[28px] bg-airline-night p-6 text-white no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-airline-forest sm:p-8">
            <Image src="/images/airport-terminal-hero.png" alt="" fill sizes="(min-width: 1024px) 675px, 100vw" className="-z-20 object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0b2229] via-[#0b2229]/65 to-transparent" aria-hidden="true" />
            <span className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-white/60 bg-airline-night/65"><ArrowUpRight size={18} aria-hidden="true" /></span>
            <p className="text-xs font-bold tracking-[.18em] text-airline-gold" aria-hidden="true">01</p>
            <h3 className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">{t("travelPages.experienceAreas.airport.title")}</h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/90">{t("travelPages.experienceAreas.airport.description")}</p>
            <span className="mt-4 text-sm font-semibold text-white underline decoration-airline-gold underline-offset-4">{t("travelPages.visitAirIndia")}</span>
          </a>
          <ol start={2} className="divide-y divide-airline-line overflow-hidden rounded-[28px] border border-airline-line bg-airline-paper">
            {experienceAreas.map(({ key, icon: Icon, href }, index) => (
              <li key={key}>
                <a href={href} target="_blank" rel="noreferrer" className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 px-4 py-5 text-airline-ink no-underline transition-colors hover:bg-airline-forest-soft focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-airline-forest sm:gap-4 sm:px-6">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-airline-forest-soft text-airline-forest"><Icon size={18} aria-hidden="true" /></span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-bold tracking-[.18em] text-airline-garnet" aria-hidden="true">{String(index + 2).padStart(2, "0")}</span>
                    <span className="mt-1 block font-serif text-xl font-semibold leading-tight">{t("travelPages.experienceAreas." + key + ".title")}</span>
                    <span className="mt-2 block text-sm leading-6 text-airline-muted">{t("travelPages.experienceAreas." + key + ".description")}</span>
                  </span>
                  <ArrowUpRight size={16} className="mt-3 text-airline-forest" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </TravelSectionLayout>
  );
}
