"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Armchair,
  ChevronDown,
  Plane,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { TravelSectionLayout } from "@/src/components/layout/TravelSectionLayout";

const experienceAreas = [
  { key: "inAir", icon: Armchair, href: "/faqs/wifi" },
  { key: "fleet", icon: Plane, href: "/#where-we-fly" },
  { key: "transformation", icon: Sparkles, href: "/faqs/app" },
] as const;

export default function TravelExperienceView({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <TravelSectionLayout
      eyebrow={t("travelPages.experienceEyebrow")}
      title={t("travelPages.experienceTitle")}
      description={t("travelPages.experienceDescription")}
      embedded={embedded}
      sectionId={embedded ? "experience" : undefined}
    >
      <div className="grid gap-3">
        <Link
          href="/#prepare-to-travel"
          className="group relative isolate flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-[2rem] bg-airline-night p-6 text-white no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-airline-forest sm:p-9 md:justify-center"
        >
          <Image
            src="/images/airport-terminal-hero.webp"
            alt=""
            fill
            unoptimized
            loading="lazy"
            className="-z-20 object-cover object-[65%_center]"
          />
          <div
            className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0b2229] via-[#0b2229]/85 to-transparent md:bg-gradient-to-r"
            aria-hidden="true"
          />
          <p className="text-xs font-bold uppercase tracking-[.18em] text-airline-gold">
            {t("travelPages.experienceAreasHeading")}
          </p>
          <h3 className="mt-2 max-w-lg font-serif text-4xl leading-tight sm:text-5xl">
            {t("travelPages.experienceAreas.airport.title")}
          </h3>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/90">
            {t("travelPages.experienceAreas.airport.description")}
          </p>
          <span className="mt-5 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-airline-forest transition-colors group-hover:bg-airline-forest-soft">
            {t("travelPages.prepareTitle")}
            <ArrowUpRight size={16} aria-hidden="true" />
          </span>
        </Link>
        <ul className="grid list-none items-start gap-3 md:grid-cols-3">
          {experienceAreas.map(({ key, icon: Icon, href }) => (
            <li key={key}>
              <details className="group overflow-hidden rounded-[1.5rem] border border-airline-line bg-airline-paper text-airline-ink open:border-airline-forest/35">
                <summary className="grid cursor-pointer list-none gap-3 p-5 hover:bg-airline-forest-soft focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-airline-forest sm:p-6 [&::-webkit-details-marker]:hidden">
                  <span
                    className="flex items-center justify-between gap-3 text-airline-forest"
                    aria-hidden="true"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-airline-forest-soft">
                      <Icon size={20} />
                    </span>
                    <ChevronDown
                      size={19}
                      className="transition-transform group-open:rotate-180 motion-reduce:transition-none"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-serif text-xl font-semibold leading-tight">
                      {t("travelPages.experienceAreas." + key + ".title")}
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-airline-muted">
                      {t("travelPages.experienceAreas." + key + ".description")}
                    </span>
                  </span>
                </summary>
                <div className="space-y-2 border-t border-airline-line px-5 py-4 text-sm leading-6 motion-safe:animate-soft-rise sm:px-6">
                  <p className="text-airline-muted">
                    {t("travelPages.experienceAreas." + key + ".details")}
                  </p>
                  <Link
                    href={href}
                    className="inline-flex min-h-9 items-center rounded-lg font-semibold text-airline-forest underline decoration-airline-gold underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-forest"
                  >
                    {t("travelPages.experienceAreas." + key + ".action")}
                  </Link>
                </div>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </TravelSectionLayout>
  );
}
