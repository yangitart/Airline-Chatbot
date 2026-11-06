"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DemoAirportCode } from "../../domain/models/DemoRoutes";
import { destinationPhotos, getDestinationPhoto } from "../../data/destinationPhotos";
import { DestinationCountry, DestinationPhotoCredit } from "./DestinationPhotoDetails";

export type FeaturedFlight = {
  origin: DemoAirportCode;
  destination: DemoAirportCode;
  date: string;
  number: string;
};

export function FlightHero({ flights, selectedDestination, onSelectRoute }: {
  flights: FeaturedFlight[];
  selectedDestination?: string;
  onSelectRoute: (flight: FeaturedFlight) => void;
}) {
  const { t, i18n } = useTranslation();
  const [viewport, carousel] = useEmblaCarousel({ loop: true, breakpoints: { "(prefers-reduced-motion: reduce)": { duration: 0 } } });
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [index, setIndex] = useState(0);
  const destination = flights[index]?.destination ?? flights[0]?.destination;
  const destinationPhoto = (destination ? destinationPhotos[destination] : getDestinationPhoto(selectedDestination ?? "")) ?? destinationPhotos.BOM;

  useEffect(() => {
    setPlaying(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (!carousel) return;
    const sync = () => setIndex(carousel.selectedScrollSnap());
    sync();
    carousel.on("select", sync).on("reInit", sync);
    return () => { carousel.off("select", sync).off("reInit", sync); };
  }, [carousel]);

  useEffect(() => {
    const selectedIndex = flights.findIndex((flight) => flight.destination === selectedDestination);
    if (selectedIndex >= 0) {
      setPlaying(false);
      carousel?.scrollTo(selectedIndex);
    }
  }, [carousel, flights, selectedDestination]);

  useEffect(() => {
    if (flights.length < 2) return;
    const next = flights[(index + 1) % flights.length];
    const previous = flights[(index + flights.length - 1) % flights.length];
    for (const airport of new Set([next.destination, previous.destination])) {
      const preload = new window.Image();
      preload.fetchPriority = "low";
      preload.src = destinationPhotos[airport].image;
    }
  }, [flights, index]);

  useEffect(() => {
    if (!carousel || !playing || hovered || flights.length < 2) return;
    const timer = window.setInterval(() => carousel.scrollNext(), 6500);
    return () => window.clearInterval(timer);
  }, [carousel, flights.length, hovered, playing]);

  const control = "grid h-11 w-11 place-items-center rounded-full border border-white/35 text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-gold";

  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-w-0 flex-col justify-end overflow-hidden rounded-[28px] bg-airline-night text-white"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={(event) => { if (event.target.matches(":focus-visible")) setPlaying(false); }}>
      <Image key={destinationPhoto.image} src={destinationPhoto.image} alt="" fill unoptimized priority={destinationPhoto === destinationPhotos.BOM} loading="eager" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#101d2b] via-[#101d2b]/60 to-[#101d2b]/15" aria-hidden="true" />
      <div className="flex min-h-[310px] flex-col justify-end p-4 sm:p-8 lg:min-h-[530px]">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
          <DestinationCountry photo={destinationPhoto} locale={i18n.resolvedLanguage ?? "en"} />
        </div>
        <h1 id="hero-title" className="mb-4 font-serif text-2xl sm:text-3xl">{t("travelPages.featuredRoutes")}</h1>
        {flights.length === 0 ? <p className="text-sm text-white/90">{t("travelPages.routeNote")}</p> : (
          <>
            <div ref={viewport} className="overflow-hidden rounded-2xl" aria-live={playing ? "off" : "polite"}>
              <div className="flex touch-pan-y">
                {flights.map((flight, position) => (
                  <article key={flight.origin + flight.destination + flight.number} aria-hidden={position !== index} className="min-w-0 flex-[0_0_100%] rounded-2xl border border-white/25 bg-airline-night/80 p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div><p className="font-serif text-3xl text-airline-gold">{flight.origin}</p><p className="text-xs text-white/90 sm:text-sm">{t("flightSearch.airports." + flight.origin)}</p></div>
                      <span className="flex-1 border-t border-dashed border-white/40" aria-hidden="true" />
                      <div className="text-right"><p className="font-serif text-3xl text-airline-gold">{flight.destination}</p><p className="text-xs text-white/90 sm:text-sm">{t("flightSearch.airports." + flight.destination)}</p></div>
                    </div>
                    <button type="button" tabIndex={position === index ? 0 : -1} onClick={() => onSelectRoute(flight)} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-airline-night focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-gold">{t("travelPages.searchRoute")}</button>
                  </article>
                ))}
              </div>
            </div>
            {flights.length > 1 && <div className="mt-3 flex items-center justify-end gap-2">
              <button type="button" className={control} aria-label={t("travelPages.carouselPrevious")} onClick={() => { setPlaying(false); carousel?.scrollPrev(); }}><ChevronLeft size={18} aria-hidden="true" /></button>
              <span className="px-1 text-xs tabular-nums">{index + 1} / {flights.length}</span>
              <button type="button" className={control} aria-label={t("travelPages.carouselNext")} onClick={() => { setPlaying(false); carousel?.scrollNext(); }}><ChevronRight size={18} aria-hidden="true" /></button>
              <button type="button" className={control} aria-label={t(playing ? "travelPages.carouselPause" : "travelPages.carouselPlay")} onClick={() => setPlaying(!playing)}>{playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}</button>
            </div>}

          </>
        )}
        <DestinationPhotoCredit photo={destinationPhoto} className="mt-3" />
      </div>
    </section>
  );
}
