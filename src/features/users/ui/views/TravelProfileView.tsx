"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";

type Profile = { display_name: string; phone: string; preferred_language: "en" | "es" };
export default function TravelProfileView() {
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState<Profile>({ display_name: "", phone: "", preferred_language: "en" });
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState("");
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: profile,
    onSubmit: async (values) => {
      setBusy(true); setMessage("");
      try {
        const response = await fetch("/api/v1/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ display_name: values.display_name, phone: values.phone, preferred_language: values.preferred_language }) });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error_code ? t(`tripOperations.errors.${body.error_code}`) : t("tripOperations.genericError"));
        setProfile(body); await i18n.changeLanguage(body.preferred_language); setMessage(t("tripOperations.profileSaved"));
      } catch (error) { setMessage(error instanceof Error ? error.message : t("tripOperations.genericError")); }
      finally { setBusy(false); }
    },
  });
  useEffect(() => {
    let live = true;
    fetch("/api/v1/profile").then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error_code ? t(`tripOperations.errors.${body.error_code}`) : t("tripOperations.genericError"));
      if (live) setProfile(body);
    }).catch((error: unknown) => { if (live) setMessage(error instanceof Error ? error.message : t("tripOperations.genericError")); })
      .finally(() => { if (live) setBusy(false); });
    return () => { live = false; };
  }, [t]);
  return <main className="min-h-screen bg-[#f4f2ee] px-4 py-10 text-[#162536]"><section className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-xl sm:p-9">
    <Link href="/my-trips" className="text-sm font-semibold text-[#86233d]">← {t("tripOperations.backTrips")}</Link>
    <h1 className="mt-6 text-3xl font-semibold">{t("tripOperations.profile")}</h1><p className="mt-2 text-sm text-slate-500">{t("tripOperations.profileDescription")}</p>
    {message && <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm" role="status">{message}</p>}
    <form className="mt-6 grid gap-5" onSubmit={formik.handleSubmit}>
      <label className="grid gap-2 text-sm font-medium">{t("tripOperations.displayName")}<input name="display_name" maxLength={100} value={formik.values.display_name} onChange={formik.handleChange} className="rounded-xl border border-slate-300 px-4 py-3" /></label>
      <label className="grid gap-2 text-sm font-medium">{t("tripOperations.phone")}<input name="phone" maxLength={40} type="tel" value={formik.values.phone} onChange={formik.handleChange} className="rounded-xl border border-slate-300 px-4 py-3" /></label>
      <label className="grid gap-2 text-sm font-medium">{t("tripOperations.preferredLanguage")}<select name="preferred_language" value={formik.values.preferred_language} onChange={formik.handleChange} className="rounded-xl border border-slate-300 bg-white px-4 py-3"><option value="en">English</option><option value="es">Español</option></select></label>
      <button disabled={busy || formik.isSubmitting} className="rounded-full bg-[#183d37] px-5 py-3 font-semibold text-white disabled:opacity-50">{busy || formik.isSubmitting ? t("tripOperations.working") : t("tripOperations.saveProfile")}</button>
    </form>
  </section></main>;
}
