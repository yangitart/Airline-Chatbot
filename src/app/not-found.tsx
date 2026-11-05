"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <main className="grid min-h-screen place-items-center bg-airline-canvas p-6 text-airline-ink">
      <section className="w-[min(100%,640px)] animate-soft-rise rounded-[28px] border border-airline-line bg-airline-paper p-[clamp(28px,7vw,64px)] shadow-[0_22px_70px_rgb(23_40_59_/_9%)] motion-reduce:animate-none">
        <span className="text-xs font-bold tracking-[.16em] text-airline-garnet">VEYRA</span>
        <h1 className="mb-3 mt-5 text-[clamp(2rem,6vw,3.25rem)] font-semibold leading-[1.08] tracking-tight text-airline-night">{t("flightSearch.notFound.title")}</h1>
        <p className="max-w-[48ch] text-[1.05rem] leading-[1.65] text-airline-muted">{t("flightSearch.notFound.description")}</p>
        <Link className="group mt-4 inline-flex items-center gap-2 font-bold text-airline-garnet transition-all duration-300 hover:gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-airline-garnet" href="/">{t("flightSearch.notFound.home")}<span aria-hidden="true">→</span></Link>
      </section>
    </main>
  );
}
