import { useTranslation } from "react-i18next";

export function FlightHero() {
  const { t } = useTranslation();

  return (
    <section className="relative z-10 flex flex-1 items-center text-white" aria-labelledby="hero-title">
      <div className="relative mx-auto w-[min(92%,1440px)] py-8 lg:py-4">
        <div className="relative z-10 max-w-xl">
          <p className="mb-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.24em] text-[#e6c993]"><span className="h-px w-8 bg-[#e6c993]" />{t("flightSearch.hero.eyebrow")}</p>
          <h1 id="hero-title" className="text-[clamp(2.3rem,4vw,4.2rem)] font-medium leading-[1.04] tracking-[-.04em]">{t("flightSearch.hero.title")}</h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/80 md:text-base">{t("flightSearch.hero.description")}</p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[11px] font-medium text-white/85 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e6c993]" />{t("flightSearch.hero.demoStatus")}
          </div>
        </div>
      </div>
    </section>
  );
}
