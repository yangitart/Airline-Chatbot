"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DEMO_AIRPORT_CODES, DEMO_ROUTE_PAIRS } from "../../domain/models/DemoRoutes";
import { TravelSectionLayout } from "@/src/components/layout/TravelSectionLayout";

export default function WhereWeFlyView() {
  const { t } = useTranslation();
  return (
    <TravelSectionLayout eyebrow={t("travelPages.eyebrow")} title={t("travelPages.whereTitle")} description={t("travelPages.whereDescription")}>
      <section aria-labelledby="routes-heading" className="overflow-hidden rounded-[28px] border border-airline-line bg-airline-paper shadow-[0_16px_45px_rgb(23_40_59_/_8%)] lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="relative isolate flex min-h-[245px] flex-col justify-end overflow-hidden bg-airline-night p-6 text-white sm:p-8">
          <Image src="/images/airport-terminal-hero.png" alt="" fill sizes="(min-width: 1024px) 450px, 100vw" className="-z-20 object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0b2229] via-[#0b2229]/75 to-transparent" aria-hidden="true" />
          <p className="text-xs font-bold uppercase tracking-[.16em] text-airline-gold">{t("travelPages.routeEyebrow")}</p>
          <h2 id="routes-heading" className="mt-2 max-w-[15ch] font-serif text-3xl leading-tight sm:text-4xl">{t("travelPages.featuredRoutes")}</h2>
          <p className="mt-3 text-sm font-semibold text-white/85">{t("travelPages.airportCount", { count: DEMO_AIRPORT_CODES.length })}</p>
        </div>
        <div className="min-w-0">
          <ul className="divide-y divide-airline-line">
            {DEMO_ROUTE_PAIRS.map(({ origin, destination }) => (
              <li key={origin + destination}>
                <Link href={"/?origin=" + origin + "&destination=" + destination + "#search"}
                  className="group grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 text-airline-ink no-underline transition-colors hover:bg-airline-forest-soft focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-airline-forest sm:gap-5 sm:px-6">
                  <span className="min-w-0"><strong className="block text-lg tracking-wide text-airline-forest">{origin}</strong><span className="block text-xs leading-5 text-airline-muted">{t("flightSearch.airports." + origin)}</span></span>
                  <ArrowRight size={15} className="text-airline-garnet" aria-hidden="true" />
                  <span className="min-w-0"><strong className="block text-lg tracking-wide text-airline-forest">{destination}</strong><span className="block text-xs leading-5 text-airline-muted">{t("flightSearch.airports." + destination)}</span></span>
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-airline-line text-airline-forest group-hover:border-airline-forest"><ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only">{t("travelPages.searchRoute")}</span></span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-airline-line px-5 py-4 text-xs leading-5 text-airline-muted sm:px-6">{t("travelPages.routeNote")}</div>
        </div>
      </section>
      <a href="https://www.airindia.com/in/en/destinations/route-map.html" target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full border border-airline-forest bg-airline-paper px-4 py-2.5 text-sm font-semibold text-airline-forest no-underline hover:bg-airline-forest-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-forest">
        {t("travelPages.officialRouteMap")}<ArrowUpRight size={15} aria-hidden="true" />
      </a>
    </TravelSectionLayout>
  );
}
