"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { FormikProvider, useFormik } from "formik";
import { useTranslation } from "react-i18next";
import {
  Clock3,
  ArrowLeft,
  CircleAlert,
  LoaderCircle,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Radar,
  Search,
} from "lucide-react";
import { FormikDateInput } from "@/src/components/forms/FormikDateInput";
import { FormikTextInput } from "@/src/components/forms/FormikTextInput";
import { TravelSectionLayout } from "@/src/components/layout/TravelSectionLayout";
import { SkeletonBlock } from "@/src/components/feedback/SkeletonBlock";
import { localDate } from "@/src/core/common/dates/localDate";
import { getDemoAirportTimeZone } from "../../domain/models/DemoRoutes";
import type { FlightStatusViewResult } from "../models/FlightStatusViewResult";
import {
  parseFlightStatusQuery,
  type FlightStatusLookupQuery,
} from "../../domain/models/FlightStatusLookup";

const statusColors: Record<string, string> = {
  scheduled: "bg-airline-forest-soft text-airline-forest",
  active: "bg-sky-100 text-sky-900",
  landed: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-rose-100 text-rose-900",
  incident: "bg-rose-100 text-rose-900",
  diverted: "bg-amber-100 text-amber-900",
};

export default function FlightStatusView({
  initialQuery,
}: {
  initialQuery: FlightStatusLookupQuery | null;
}) {
  const { t, i18n } = useTranslation();
  const [result, setResult] = useState<FlightStatusViewResult | null>(null);
  const [error, setError] = useState("");
  const [loadingInitial, setLoadingInitial] = useState(Boolean(initialQuery));
  const lookup = useCallback(
    async (query: FlightStatusLookupQuery, signal?: AbortSignal) => {
      try {
        const params = new URLSearchParams({
          flight_number: query.flightNumber,
          date: query.flightDate,
        });
        const response = await fetch(`/api/v1/flights/status?${params}`, {
          signal,
        });
        const body = await response.json();
        if (signal?.aborted) return;
        if (!response.ok) {
          setError(
            body.error_code
              ? `tripOperations.errors.${body.error_code}`
              : "tripOperations.genericError",
          );
          return;
        }
        setResult(body);
      } catch {
        if (!signal?.aborted) setError("tripOperations.genericError");
      }
    },
    [],
  );
  useEffect(() => {
    if (!initialQuery) return;
    const controller = new AbortController();
    void lookup(initialQuery, controller.signal).finally(() => {
      if (!controller.signal.aborted) setLoadingInitial(false);
    });
    return () => controller.abort();
  }, [initialQuery, lookup]);
  const formik = useFormik({
    initialValues: {
      flight: initialQuery?.flightNumber ?? "",
      date: initialQuery?.flightDate ?? localDate(),
    },
    onSubmit: async ({ flight, date }) => {
      if (loadingInitial) return;
      setResult(null);
      const query = parseFlightStatusQuery(flight, date);
      if (!query) {
        setError("tripOperations.errors.invalid_status_query");
        return;
      }
      setError("");
      await lookup(query);
    },
  });
  const loading = loadingInitial || formik.isSubmitting;
  return (
    <FormikProvider value={formik}>
      <TravelSectionLayout
        eyebrow={t("travelPages.eyebrow")}
        title={t("tripOperations.flightStatus")}
        description={t("tripOperations.statusDescription")}
        headingIcon={<Radar size={45} strokeWidth={1.35} />}
      >
        <div className="space-y-5">
          <Link
            href="/#search"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-airline-forest underline decoration-transparent underline-offset-4 hover:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {t("tripOperations.backSearch")}
          </Link>
          <form
            onSubmit={formik.handleSubmit}
            className="grid gap-3 rounded-[24px] border border-airline-line bg-airline-paper p-4 shadow-sm sm:grid-cols-[1fr_1fr_auto] sm:items-stretch sm:p-5"
          >
            <FormikTextInput
              name="flight"
              label={t("tripOperations.flightNumber")}
              required
              placeholder="AI 101"
              autoComplete="off"
            />
            <FormikDateInput
              name="date"
              label={t("tripOperations.date")}
              required
            />
            <button
              disabled={loading}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-airline-forest px-6 py-3 font-semibold text-white shadow-[0_6px_16px_rgb(24_61_55_/_15%)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#24564d] hover:shadow-[0_10px_20px_rgb(24_61_55_/_22%)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-gold disabled:opacity-50 motion-reduce:transform-none"
            >
              {loading ? (
                <LoaderCircle
                  size={17}
                  aria-hidden="true"
                  className="animate-spin motion-reduce:animate-none"
                />
              ) : (
                <Search size={17} aria-hidden="true" />
              )}
              {loading
                ? t("tripOperations.working")
                : t("tripOperations.searchStatus")}
            </button>
          </form>
          {error && (
            <p
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-[#f1d4cd] bg-[#fff8f6] p-4 text-sm text-red-800"
            >
              <CircleAlert size={18} className="shrink-0" aria-hidden="true" />
              {t(error, { defaultValue: t("tripOperations.genericError") })}
            </p>
          )}
          {loading && (
            <div
              role="status"
              aria-label={t("tripOperations.working")}
              className="grid gap-4 rounded-[24px] border border-airline-line bg-airline-paper p-5"
            >
              <SkeletonBlock className="h-8 w-40" />
              <div className="grid gap-3 sm:grid-cols-2">
                <SkeletonBlock className="h-32" />
                <SkeletonBlock className="h-32" />
              </div>
            </div>
          )}
          {result && (
            <article
              aria-live="polite"
              className="overflow-hidden rounded-[28px] border border-airline-line bg-airline-paper shadow-[0_12px_32px_rgb(23_40_59_/_8%)]"
            >
              <header className="border-b border-airline-line bg-airline-forest-soft px-5 py-5 sm:px-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-airline-muted">
                      {t("tripOperations.flightNumber")}
                    </p>
                    <h2 className="mt-1 font-serif text-3xl text-airline-night">
                      {result.flight_number}
                    </h2>
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-current/15 ${statusColors[result.status] ?? "bg-white text-airline-ink"}`}
                  >
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full bg-current"
                    />
                    {t(`tripOperations.flightStates.${result.status}`, {
                      defaultValue: result.status,
                    })}
                  </span>
                </div>
              </header>
              <div className="grid items-stretch gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:p-6">
                {[
                  {
                    label: t("tripOperations.departure"),
                    code: result.schedule.origin_code,
                    time: result.schedule.departure_at,
                    detail: result.payload.departure,
                    Icon: PlaneTakeoff,
                  },
                  {
                    label: t("tripOperations.arrival"),
                    code: result.schedule.destination_code,
                    time: result.schedule.arrival_at,
                    detail: result.payload.arrival,
                    Icon: PlaneLanding,
                  },
                ].map((stop, index) => (
                  <div key={stop.code + index} className="contents">
                    {index === 1 && (
                      <div
                        aria-hidden="true"
                        className="hidden items-center sm:flex"
                      >
                        <span className="grid size-10 place-items-center rounded-full border border-airline-line bg-airline-canvas text-airline-forest">
                          <Plane size={18} />
                        </span>
                      </div>
                    )}
                    <section className="min-w-0 rounded-2xl border border-airline-line bg-airline-canvas/60 p-4 sm:p-5">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-airline-muted">
                        <stop.Icon
                          size={17}
                          className="text-airline-forest"
                          aria-hidden="true"
                        />
                        {stop.label}
                      </p>
                      <h3 className="mt-3 font-serif text-4xl tracking-tight text-airline-night">
                        {stop.code}
                      </h3>
                      <time
                        dateTime={stop.time}
                        className="mt-1 block text-sm font-medium text-airline-ink"
                      >
                        {new Intl.DateTimeFormat(i18n.resolvedLanguage, {
                          dateStyle: "medium",
                          timeStyle: "short",
                          timeZone:
                            stop.detail?.timezone ??
                            getDemoAirportTimeZone(stop.code),
                        }).format(new Date(stop.time))}
                      </time>
                      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-airline-line pt-3">
                        {[
                          [t("tripOperations.terminal"), stop.detail?.terminal],
                          [t("tripOperations.gate"), stop.detail?.gate],
                          [
                            t("tripOperations.delayMinutes"),
                            stop.detail?.delay,
                          ],
                        ].map(([label, value]) => (
                          <div key={label} className="min-w-0 break-words">
                            <dt className="text-xs text-airline-muted">
                              {label}
                            </dt>
                            <dd className="mt-1 text-sm font-semibold text-airline-night">
                              {value ?? "—"}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  </div>
                ))}
              </div>
              <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-airline-line px-5 py-4 sm:px-7">
                <p className="flex items-center gap-2 text-xs text-airline-muted">
                  <Clock3 size={15} className="shrink-0" aria-hidden="true" />
                  {t("tripOperations.lastUpdated")}:{" "}
                  {new Date(result.updated_at).toLocaleString(
                    i18n.resolvedLanguage,
                  )}
                </p>
                {result.is_demo && (
                  <span className="rounded-full bg-airline-gold/15 px-3 py-1 text-xs font-medium text-[#6c5428]">
                    {t("tripOperations.demoFlightStatus")}
                  </span>
                )}
              </footer>
            </article>
          )}
        </div>
      </TravelSectionLayout>
    </FormikProvider>
  );
}
