"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FormikProvider, useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { LoaderCircle } from "lucide-react";
import { FormikSelect } from "@/src/components/forms/FormikSelect";
import { FormikTextInput } from "@/src/components/forms/FormikTextInput";
import { SkeletonBlock } from "@/src/components/feedback/SkeletonBlock";
import { TravelSectionLayout } from "@/src/components/layout/TravelSectionLayout";
import {
  supportedLanguages,
  type SupportedLanguage,
} from "@/src/core/locales/supportedLanguages";

type Profile = {
  display_name: string;
  phone: string;
  preferred_language: SupportedLanguage;
};
export default function TravelProfileView() {
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState<Profile>({
    display_name: "",
    phone: "",
    preferred_language: "en",
  });
  const [busy, setBusy] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [message, setMessage] = useState("");
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: profile,
    onSubmit: async (values) => {
      setBusy(true);
      setMessage("");
      try {
        const response = await fetch("/api/v1/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            display_name: values.display_name,
            phone: values.phone,
            preferred_language: values.preferred_language,
          }),
        });
        const body = await response.json();
        if (!response.ok)
          throw new Error(
            body.error_code
              ? t(`tripOperations.errors.${body.error_code}`)
              : t("tripOperations.genericError"),
          );
        setProfile(body);
        await i18n.changeLanguage(body.preferred_language);
        setMessage(t("tripOperations.profileSaved"));
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : t("tripOperations.genericError"),
        );
      } finally {
        setBusy(false);
      }
    },
  });
  useEffect(() => {
    let live = true;
    fetch("/api/v1/profile")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok)
          throw new Error(
            body.error_code
              ? t(`tripOperations.errors.${body.error_code}`)
              : t("tripOperations.genericError"),
          );
        if (live) setProfile(body);
      })
      .catch((error: unknown) => {
        if (live)
          setMessage(
            error instanceof Error
              ? error.message
              : t("tripOperations.genericError"),
          );
      })
      .finally(() => {
        if (live) {
          setBusy(false);
          setProfileLoading(false);
        }
      });
    return () => {
      live = false;
    };
  }, [t]);
  return (
    <FormikProvider value={formik}>
      <TravelSectionLayout
        eyebrow={t("travelPages.eyebrow")}
        title={t("tripOperations.profile")}
        description={t("tripOperations.profileDescription")}
      >
        <section className="mx-auto w-[min(100%,700px)] animate-soft-rise rounded-[28px] border border-airline-line bg-airline-paper p-6 shadow-[0_16px_44px_rgb(23_40_59_/_7%)] motion-reduce:animate-none sm:p-9">
          <Link
            href="/my-trips"
            className="text-sm font-semibold text-airline-garnet underline decoration-transparent underline-offset-4 transition hover:decoration-current"
          >
            ← {t("tripOperations.backTrips")}
          </Link>
          {message && (
            <p
              className="mt-5 animate-soft-rise rounded-2xl border border-airline-line bg-[#f7f6f1] p-4 text-sm motion-reduce:animate-none"
              role="status"
            >
              {message}
            </p>
          )}
          {profileLoading ? (
            <div
              className="mt-6 grid gap-4 sm:grid-cols-2"
              role="status"
              aria-label={t("tripOperations.working")}
            >
              <SkeletonBlock className="h-16" />
              <SkeletonBlock className="h-16" />
              <SkeletonBlock className="h-16 sm:col-span-2" />
              <SkeletonBlock className="h-12 sm:col-span-2" />
              <span className="sr-only">{t("tripOperations.working")}</span>
            </div>
          ) : (
            <form
              className="mt-6 grid gap-4 sm:grid-cols-2"
              onSubmit={formik.handleSubmit}
            >
              <FormikTextInput
                name="display_name"
                label={t("tripOperations.displayName")}
                maxLength={100}
                autoComplete="name"
              />
              <FormikTextInput
                name="phone"
                label={t("tripOperations.phone")}
                type="tel"
                maxLength={40}
                autoComplete="tel"
              />
              <FormikSelect
                name="preferred_language"
                label={t("tripOperations.preferredLanguage")}
                className="sm:col-span-2"
                options={supportedLanguages.map(({ code, label }) => ({
                  value: code,
                  label,
                }))}
              />
              <button
                disabled={busy || formik.isSubmitting}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-airline-forest px-5 py-3 font-semibold text-white shadow-[0_8px_18px_rgb(24_61_55_/_15%)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#24564d] hover:shadow-[0_12px_22px_rgb(24_61_55_/_22%)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-gold disabled:opacity-50 motion-reduce:transform-none sm:col-span-2"
              >
                {busy || formik.isSubmitting ? (
                  <LoaderCircle
                    size={17}
                    aria-hidden="true"
                    className="animate-spin motion-reduce:animate-none"
                  />
                ) : null}
                {busy || formik.isSubmitting
                  ? t("tripOperations.working")
                  : t("tripOperations.saveProfile")}
              </button>
            </form>
          )}
        </section>
      </TravelSectionLayout>
    </FormikProvider>
  );
}
