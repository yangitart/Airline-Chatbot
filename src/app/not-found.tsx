"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="w-[min(100%,640px)] rounded-[20px] border border-[#e8e2d8] bg-white p-[clamp(28px,7vw,64px)] shadow-[0_18px_60px_rgb(50_35_20_/_8%)]">
        <span className="text-xs font-bold tracking-[.12em] text-[#b32025]">AIR INDIA · TRAVEL ASSISTANT</span>
        <h1 className="mb-3 mt-5 text-[clamp(2rem,6vw,3.25rem)] leading-[1.08] text-[#252525]">{t("flightSearch.notFound.title")}</h1>
        <p className="max-w-[48ch] text-[1.05rem] leading-[1.65] text-[#666]">{t("flightSearch.notFound.description")}</p>
        <Link className="mt-3 inline-block font-bold text-[#b32025]" href="/">{t("flightSearch.notFound.home")}</Link>
      </section>
    </main>
  );
}
