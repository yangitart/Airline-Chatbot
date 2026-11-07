"use client";

import Image from "next/image";
import Link from "next/link";
import { Armchair, ChevronDown, Plane, Sparkles } from "lucide-react";
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
      eyebrow={t("travelPages.eyebrow")}
      title={t("travelPages.experienceTitle")}
      description={t("travelPages.experienceDescription")}
      embedded={embedded}
      sectionId={embedded ? "experience" : undefined}
    >
      <section aria-labelledby="experience-heading">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-airline-garnet">
          {t("travelPages.experienceEyebrow")}
        </p>
        <h2
          id="experience-heading"
          className="mb-5 mt-2 font-serif text-3xl leading-tight text-airline-night sm:text-4xl"
        >
          {t("travelPages.experienceAreasHeading")}
        </h2>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <Link
            href="/#prepare-to-travel"
            className="group relative isolate flex min-h-[330px] flex-col justify-end overflow-hidden rounded-[28px] bg-airline-night p-6 text-white no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-airline-forest sm:p-8"
          >
            <Image
              src="/images/airport-terminal-hero.webp"
              alt=""
              fill
              unoptimized
              loading="lazy"
              className="-z-20 object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
            />
            <div
              className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0b2229] via-[#0b2229]/65 to-transparent"
              aria-hidden="true"
            />
            <p
              className="text-xs font-bold tracking-[.18em] text-airline-gold"
              aria-hidden="true"
            >
              01
            </p>
            <h3 className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">
              {t("travelPages.experienceAreas.airport.title")}
            </h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/90">
              {t("travelPages.experienceAreas.airport.description")}
            </p>
            <span className="mt-4 text-sm font-semibold text-white underline decoration-airline-gold underline-offset-4">
              {t("travelPages.prepareTitle")}
            </span>
          </Link>
          <ol
            start={2}
            className="divide-y divide-airline-line overflow-hidden rounded-[28px] border border-airline-line bg-airline-paper"
          >
            {experienceAreas.map(({ key, icon: Icon, href }, index) => (
              <li key={key}>
                <details className="group text-airline-ink">
                  <summary className="grid cursor-pointer list-none grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 px-4 py-5 hover:bg-airline-forest-soft focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-airline-forest sm:gap-4 sm:px-6 [&::-webkit-details-marker]:hidden">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-airline-forest-soft text-airline-forest">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span
                        className="block text-[10px] font-bold tracking-[.18em] text-airline-garnet"
                        aria-hidden="true"
                      >
                        {String(index + 2).padStart(2, "0")}
                      </span>
                      <span className="mt-1 block font-serif text-xl font-semibold leading-tight">
                        {t("travelPages.experienceAreas." + key + ".title")}
                      </span>
                      <span className="mt-2 block text-sm leading-6 text-airline-muted">
                        {t(
                          "travelPages.experienceAreas." + key + ".description",
                        )}
                      </span>
                    </span>
                    <ChevronDown
                      size={18}
                      aria-hidden="true"
                      className="mt-1 text-airline-forest transition-transform group-open:rotate-180 motion-reduce:transition-none"
                    />
                  </summary>
                  <div className="space-y-3 px-4 pb-5 pl-[4.25rem] text-sm leading-6 sm:pl-20 sm:pr-6">
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
          </ol>
        </div>
      </section>
    </TravelSectionLayout>
  );
}
