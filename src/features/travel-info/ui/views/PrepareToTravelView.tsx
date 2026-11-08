"use client";

import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CircleDot,
  Clipboard,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { TravelSectionLayout } from "@/src/components/layout/TravelSectionLayout";

const steps = [
  {
    key: "baggage",
    href: "/faqs/baggage-guidelines",
    icon: (
      <BriefcaseBusiness
        size={20}
        className="motion-safe:group-hover:animate-travel-bag-lift motion-safe:group-focus-visible:animate-travel-bag-lift motion-safe:group-active:animate-travel-bag-lift"
      />
    ),
  },
  {
    key: "checkin",
    href: "/faqs/online-checkin-info",
    icon: (
      <Clipboard size={20}>
        <path
          d="m9 14 2 2 4-4"
          pathLength={1}
          strokeDasharray={1}
          className="motion-safe:group-hover:animate-travel-check-mark motion-safe:group-focus-visible:animate-travel-check-mark motion-safe:group-active:animate-travel-check-mark"
        />
      </Clipboard>
    ),
  },
  {
    key: "flightStatus",
    href: "/flight-status",
    icon: (
      <CircleDot size={20}>
        <circle cx="12" cy="12" r="5.5" strokeOpacity={0.45} />
        <path
          d="M13 11l6-6"
          className="origin-center motion-safe:group-hover:animate-travel-radar-sweep motion-safe:group-focus-visible:animate-travel-radar-sweep motion-safe:group-active:animate-travel-radar-sweep"
        />
      </CircleDot>
    ),
  },
];

export default function PrepareToTravelView({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const stepNumber = new Intl.NumberFormat(i18n.resolvedLanguage, {
    minimumIntegerDigits: 2,
  });
  const resourceText = (key: string, field: string) =>
    t(`travelPages.resources.${key}.${field}`);

  return (
    <TravelSectionLayout
      eyebrow={t("travelPages.resourcesEyebrow")}
      title={t("travelPages.prepareTitle")}
      description={t("travelPages.prepareDescription")}
      embedded={embedded}
      sectionId={embedded ? "prepare-to-travel" : undefined}
    >
      <ol className="grid gap-3 md:grid-cols-3">
        {steps.map(({ key, icon, href }, index) => (
          <li key={key} className="min-w-0">
            <Link
              href={href}
              aria-labelledby={`prepare-${key}-action`}
              aria-describedby={`prepare-${key}-description`}
              className="group flex h-full flex-col rounded-[1.5rem] border border-airline-line bg-airline-paper p-5 no-underline hover:border-airline-forest/30 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-forest motion-safe:transition-[transform,border-color,box-shadow] motion-safe:duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:focus-visible:-translate-y-0.5 motion-safe:active:translate-y-0 sm:p-6"
            >
              <div className="mb-4 flex items-center gap-3" aria-hidden="true">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-airline-forest-soft text-airline-forest">
                  {icon}
                </span>
                <span className="grow border-t border-dashed border-airline-gold" />
                <span className="font-serif text-2xl tabular-nums text-airline-garnet">
                  {stepNumber.format(index + 1)}
                </span>
              </div>
              <h3 className="font-serif text-2xl text-airline-night">
                {resourceText(key, "title")}
              </h3>
              <p
                id={`prepare-${key}-description`}
                className="mb-4 mt-2 text-sm leading-6 text-airline-muted"
              >
                {resourceText(key, "description")}
              </p>
              <span
                id={`prepare-${key}-action`}
                className="mt-auto inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-airline-forest-soft px-3.5 py-2 text-sm font-semibold text-airline-forest group-hover:bg-airline-forest group-hover:text-white group-focus-visible:bg-airline-forest group-focus-visible:text-white motion-safe:transition-colors"
              >
                {resourceText(key, "action")}
                <ArrowRight
                  size={16}
                  className="shrink-0 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-focus-visible:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </TravelSectionLayout>
  );
}
