"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, PlaneTakeoff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TravelSectionLayout } from "@/src/components/layout/TravelSectionLayout";
import {
  DEMO_AIRPORT_CODES,
  DEMO_ROUTE_PAIRS,
} from "../../domain/models/DemoRoutes";
import { destinationPhotos } from "../../data/destinationPhotos";
import {
  DestinationCountry,
  DestinationPhotoCredit,
} from "../components/DestinationPhotoDetails";
import type { RoutePrefill } from "../components/FlightRouteFromUrl";

const departures = DEMO_AIRPORT_CODES.map((airport) => ({
  airport,
  routes: DEMO_ROUTE_PAIRS.filter(({ origin }) => origin === airport),
})).filter(({ routes }) => routes.length > 0);

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-forest";

export default function WhereWeFlyView({
  onSelectRoute,
}: {
  onSelectRoute: (route: RoutePrefill) => void;
}) {
  const { t, i18n } = useTranslation();
  const [route, setRoute] = useState(DEMO_ROUTE_PAIRS[0]);
  const { origin, destination } = route;
  const destinations =
    departures.find(({ airport }) => airport === origin)?.routes ?? [];
  const photo = destinationPhotos[destination];
  const city = (code: string) => t(`flightSearch.airports.${code}`);

  return (
    <TravelSectionLayout
      eyebrow={t("travelPages.routeEyebrow")}
      title={t("travelPages.whereTitle")}
      description={t("travelPages.whereDescription")}
      embedded
      sectionId="where-we-fly"
    >
      <div className="grid gap-3 rounded-[2rem] border border-airline-line bg-airline-paper p-2.5 shadow-[0_16px_44px_rgb(23_40_59_/_8%)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:p-3">
        <div className="min-w-0 px-3 py-4 sm:px-5 sm:py-6">
          <p className="mb-5 inline-flex rounded-full bg-airline-forest-soft px-3 py-1.5 text-xs font-semibold text-airline-forest">
            {t("travelPages.routeNetwork")}
          </p>
          <fieldset>
            <legend className="flex items-center gap-2 text-sm font-bold text-airline-night">
              <PlaneTakeoff
                size={17}
                className="text-airline-forest"
                aria-hidden="true"
              />
              {t("travelPages.chooseOrigin")}
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {departures.map(({ airport, routes }) => (
                <button
                  key={airport}
                  type="button"
                  aria-pressed={airport === origin}
                  onClick={() => {
                    if (airport !== origin) setRoute(routes[0]);
                  }}
                  className={`min-h-10 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors motion-reduce:transition-none ${focus} ${airport === origin ? "border-airline-forest bg-airline-forest text-white" : "border-airline-line bg-airline-paper text-airline-ink hover:border-airline-forest/50"}`}
                >
                  {city(airport)}{" "}
                  <span className="ml-0.5 opacity-80">{airport}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-6 border-t border-airline-line pt-4">
            <legend className="sr-only">
              {t("travelPages.chooseDestination")}
            </legend>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span
                aria-hidden="true"
                className="inline-flex items-center gap-2 text-sm font-bold text-airline-night"
              >
                <MapPin size={17} className="text-airline-forest" />
                {t("travelPages.chooseDestination")}
              </span>
              <p
                role="status"
                className="text-xs font-medium text-airline-muted"
              >
                {t("travelPages.airportCount", { count: destinations.length })}
              </p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {destinations.map((option) => (
                <button
                  key={option.destination}
                  type="button"
                  aria-pressed={option.destination === destination}
                  onClick={() => setRoute(option)}
                  className={`flex min-h-12 min-w-0 flex-wrap items-center justify-between gap-x-2 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-colors motion-reduce:transition-none ${focus} ${option.destination === destination ? "border-airline-forest/45 bg-airline-forest-soft text-airline-forest" : "border-airline-line text-airline-ink hover:bg-airline-canvas"}`}
                >
                  <span>{city(option.destination)}</span>
                  <span className="text-xs tracking-wider">
                    {option.destination}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
          <div className="mt-5 border-t border-airline-line pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p
                id="selected-network-route"
                aria-live="polite"
                className="inline-flex items-center gap-2 text-sm font-bold tracking-wide text-airline-night"
              >
                <span className="sr-only">
                  {t("travelPages.from")} {city(origin)}. {t("travelPages.to")}{" "}
                  {city(destination)}.
                </span>
                <span aria-hidden="true">{origin}</span>
                <ArrowRight
                  size={15}
                  className="text-airline-garnet"
                  aria-hidden="true"
                />
                <span aria-hidden="true">{destination}</span>
              </p>
              <Link
                href={{
                  pathname: "/",
                  query: { origin, destination },
                  hash: "search",
                }}
                scroll={false}
                prefetch={false}
                aria-describedby="selected-network-route"
                onNavigate={(event) => {
                  event.preventDefault();
                  onSelectRoute({ origin, destination });
                }}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-airline-forest px-4 py-2.5 text-sm font-bold text-white no-underline hover:bg-[#24564d] motion-safe:transition-colors ${focus}`}
              >
                {t("travelPages.searchFlights")}
                <ArrowRight size={17} className="shrink-0" aria-hidden="true" />
              </Link>
            </div>
            <p className="mt-2 text-xs leading-5 text-airline-muted">
              {t("travelPages.routeNote")}
            </p>
          </div>
        </div>

        <div className="relative isolate flex min-h-[16rem] flex-col justify-end overflow-hidden rounded-[1.5rem] bg-airline-night p-5 text-white sm:p-7 md:min-h-[21rem]">
          <Image
            key={photo.image}
            src={photo.image}
            alt=""
            fill
            unoptimized
            className="-z-20 object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0b2229] via-[#0b2229]/85 to-transparent"
          />
          <div className="mb-2 inline-flex w-fit rounded-full bg-airline-night/85 px-3 py-1.5">
            <DestinationCountry
              photo={photo}
              locale={i18n.resolvedLanguage ?? "en"}
            />
          </div>
          <h3 className="font-serif text-4xl leading-tight sm:text-5xl">
            {city(destination)}
          </h3>
          <DestinationPhotoCredit photo={photo} className="mt-3" />
        </div>
      </div>
    </TravelSectionLayout>
  );
}
