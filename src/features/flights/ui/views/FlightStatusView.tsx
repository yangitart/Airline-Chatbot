"use client";
import Link from "next/link";
import { useState } from "react";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";

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
  return <main className="min-h-screen bg-[#f4f2ee] px-4 py-10 text-[#162536]"><section className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-xl sm:p-9">
    <Link href="/" className="text-sm font-semibold text-[#86233d]">← {t("tripOperations.backSearch")}</Link><h1 className="mt-6 text-3xl font-semibold">{t("tripOperations.flightStatus")}</h1><p className="mt-2 text-sm text-slate-500">{t("tripOperations.statusDescription")}</p>
    <form onSubmit={formik.handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <label className="grid gap-2 text-sm font-medium">{t("tripOperations.flightNumber")}<input name="flight" required value={formik.values.flight} onChange={formik.handleChange} placeholder="AI 101" className="rounded-xl border border-slate-300 px-4 py-3" /></label>
      <label className="grid gap-2 text-sm font-medium">{t("tripOperations.date")}<input name="date" required type="date" value={formik.values.date} onChange={formik.handleChange} className="rounded-xl border border-slate-300 px-4 py-3" /></label>
      <button disabled={formik.isSubmitting} className="rounded-full bg-[#183d37] px-6 py-3 font-semibold text-white disabled:opacity-50">{formik.isSubmitting ? t("tripOperations.working") : t("tripOperations.searchStatus")}</button>
    </form>
    {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {result && <article className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5"><div><p className="text-xs font-semibold uppercase tracking-wider text-[#86233d]">{result.flight_number}</p><h2 className="mt-1 text-2xl font-semibold capitalize">{t(`tripOperations.flightStates.${result.status}`, { defaultValue: result.status })}</h2></div><span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-900">{t("tripOperations.demoData")}</span></div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
        {[{ label: t("tripOperations.departure"), code: result.schedule.origin_code, time: result.schedule.departure_at, detail: result.payload.departure }, { label: t("tripOperations.arrival"), code: result.schedule.destination_code, time: result.schedule.arrival_at, detail: result.payload.arrival }].map((stop) => <section key={stop.label} className="rounded-xl bg-white p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{stop.label}</p><p className="mt-1 text-2xl font-semibold">{stop.code}</p><p className="mt-1 text-sm text-slate-600">{new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: "medium", timeStyle: "short", ...(stop.detail?.timezone ? { timeZone: stop.detail.timezone } : {}) }).format(new Date(stop.time))}</p><p className="mt-3 text-xs text-slate-500">{t("tripOperations.terminal")}: {stop.detail?.terminal ?? "—"} · {t("tripOperations.gate")}: {stop.detail?.gate ?? "—"}</p><p className="mt-1 text-xs text-slate-500">{t("tripOperations.delayMinutes")}: {stop.detail?.delay ?? 0}</p></section>)}
      </div>
      <div className="px-5 pb-5"><p className="text-xs text-slate-500">{new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: "long" }).format(new Date(`${result.flight_date}T12:00:00`))} · {t("tripOperations.source")}: {result.source}</p><p className="mt-1 text-xs text-slate-500">{t("tripOperations.lastUpdated")}: {new Date(result.updated_at).toLocaleString(i18n.resolvedLanguage)}</p></div>
    </article>}
  </section></main>;
}
