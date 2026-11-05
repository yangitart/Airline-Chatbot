"use client";
import Link from "next/link";
import { useState } from "react";
import { FormikProvider, useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { LoaderCircle } from "lucide-react";
import { FormikDateInput } from "@/src/components/forms/FormikDateInput";
import { FormikTextInput } from "@/src/components/forms/FormikTextInput";
import { TravelSectionLayout } from "@/src/components/layout/TravelSectionLayout";

type Result = { flight_number: string; flight_date: string; status: string; source: string; is_demo: boolean; updated_at: string; schedule: { origin_code: string; destination_code: string; departure_at: string; arrival_at: string }; payload: { departure?: { delay?: number | null; gate?: string | null; terminal?: string | null; timezone?: string }; arrival?: { delay?: number | null; gate?: string | null; terminal?: string | null; timezone?: string } } };
export default function FlightStatusView() {
  const { t, i18n } = useTranslation();
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const formik = useFormik({
    initialValues: { flight: "AI 101", date: new Date().toISOString().slice(0, 10) },
    onSubmit: async ({ flight, date }) => {
      setError(""); setResult(null);
      try {
        const params = new URLSearchParams({ flight_number: flight, date });
      const response = await fetch(`/api/v1/flights/status?${params}`); const body = await response.json();
      if (!response.ok) throw new Error(body.error_code ? t(`tripOperations.errors.${body.error_code}`) : t("tripOperations.genericError"));
      setResult(body);
      } catch (cause) { setError(cause instanceof Error ? cause.message : t("tripOperations.genericError")); }
    },
  });
  return <FormikProvider value={formik}><TravelSectionLayout eyebrow={t("travelPages.eyebrow")} title={t("tripOperations.flightStatus")} description={t("tripOperations.statusDescription")}>
    <div className="mx-auto w-[min(100%,900px)]">
    <Link href="/#search" className="mb-4 inline-flex text-sm font-semibold text-airline-garnet underline decoration-transparent underline-offset-4 transition hover:decoration-current">← {t("tripOperations.backSearch")}</Link>
    <form onSubmit={formik.handleSubmit} className="grid gap-4 rounded-[24px] border border-airline-line bg-airline-paper p-4 shadow-[0_10px_28px_rgb(23_40_59_/_6%)] sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-5">
      <FormikTextInput name="flight" label={t("tripOperations.flightNumber")} required placeholder="AI 101" autoComplete="off" />
      <FormikDateInput name="date" label={t("tripOperations.date")} required />
      <button disabled={formik.isSubmitting} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-airline-forest px-6 py-3 font-semibold text-white shadow-[0_6px_16px_rgb(24_61_55_/_15%)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#24564d] hover:shadow-[0_10px_20px_rgb(24_61_55_/_22%)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-gold disabled:opacity-50 motion-reduce:transform-none">{formik.isSubmitting ? <LoaderCircle size={17} aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : null}{formik.isSubmitting ? t("tripOperations.working") : t("tripOperations.searchStatus")}</button>
    </form>
    {error && <p role="alert" className="mt-5 animate-soft-rise rounded-2xl border border-[#f1d4cd] bg-[#fff8f6] p-4 text-sm text-red-700 motion-reduce:animate-none">{error}</p>}
    {result && <article className="mt-6 animate-soft-rise overflow-hidden rounded-[24px] border border-airline-line bg-airline-paper shadow-[0_12px_32px_rgb(23_40_59_/_6%)] motion-reduce:animate-none">
      <div className="flex animate-soft-rise flex-wrap items-center justify-between gap-3 border-b border-airline-line p-5 motion-reduce:animate-none"><div><p className="text-xs font-semibold uppercase tracking-wider text-airline-garnet">{result.flight_number}</p><h2 className="mt-1 text-2xl font-semibold capitalize text-airline-ink">{t(`tripOperations.flightStates.${result.status}`, { defaultValue: result.status })}</h2></div><span className="rounded-full border border-airline-gold/30 bg-airline-gold/10 px-3 py-1.5 text-xs font-bold text-[#6c5428]">{t("tripOperations.demoData")}</span></div>
      <div className="grid gap-3 bg-airline-canvas/60 p-4 sm:grid-cols-2 sm:p-5">
        {[{ label: t("tripOperations.departure"), code: result.schedule.origin_code, time: result.schedule.departure_at, detail: result.payload.departure }, { label: t("tripOperations.arrival"), code: result.schedule.destination_code, time: result.schedule.arrival_at, detail: result.payload.arrival }].map((stop, index) => <section key={stop.label} style={{ animationDelay: `${index * 90}ms` }} className="animate-soft-rise rounded-2xl border border-airline-line bg-airline-paper p-4 shadow-[0_6px_20px_rgb(23_40_59_/_4%)] motion-reduce:animate-none sm:p-5"><p className="text-xs font-semibold uppercase tracking-wider text-airline-muted">{stop.label}</p><p className="mt-1 text-2xl font-semibold text-airline-night">{stop.code}</p><p className="mt-1 text-sm text-airline-muted">{new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: "medium", timeStyle: "short", ...(stop.detail?.timezone ? { timeZone: stop.detail.timezone } : {}) }).format(new Date(stop.time))}</p><p className="mt-3 text-xs text-airline-muted">{t("tripOperations.terminal")}: {stop.detail?.terminal ?? "—"} · {t("tripOperations.gate")}: {stop.detail?.gate ?? "—"}</p><p className="mt-1 text-xs text-airline-muted">{t("tripOperations.delayMinutes")}: {stop.detail?.delay ?? 0}</p></section>)}
      </div>
      <div className="px-5 pb-5"><p className="text-xs text-airline-muted">{t("tripOperations.date")}: {new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: "long" }).format(new Date(`${result.flight_date}T12:00:00`))}</p><p className="mt-1 text-xs text-airline-muted">{t("tripOperations.lastUpdated")}: {new Date(result.updated_at).toLocaleString(i18n.resolvedLanguage)}</p></div>
    </article>}
    </div>
  </TravelSectionLayout></FormikProvider>;
}
