import { useTranslation } from "react-i18next";

export function BookingTabs() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-12 items-center gap-[clamp(10px,2.4vw,44px)] overflow-x-auto border-b border-[#eff0f2] px-1.5 pb-4 max-[650px]:gap-1" role="navigation" aria-label={t("flightSearch.booking.servicesLabel")}>
      <a className="shrink-0 rounded-[7px] border border-[#e5d8c0] bg-[#f8f3e9] px-[13px] py-[10px] text-[13px] font-semibold uppercase text-[#86233d] no-underline shadow-[0_2px_6px_rgb(0_0_0_/_6%)] max-[650px]:px-2 max-[650px]:py-[9px] max-[650px]:text-[10px]" href="#search" aria-current="page">{t("flightSearch.booking.searchFlights")}</a>
      <button className="shrink-0 cursor-pointer rounded-[7px] border-0 bg-transparent px-[13px] py-[10px] text-[13px] font-semibold uppercase text-[#252a30] disabled:cursor-not-allowed disabled:opacity-50 max-[650px]:px-2 max-[650px]:py-[9px] max-[650px]:text-[10px]" type="button" disabled title={t("flightSearch.booking.comingSoon")}>{t("flightSearch.booking.manageBooking")}</button>
      <button className="shrink-0 cursor-pointer rounded-[7px] border-0 bg-transparent px-[13px] py-[10px] text-[13px] font-semibold uppercase text-[#252a30] disabled:cursor-not-allowed disabled:opacity-50 max-[650px]:px-2 max-[650px]:py-[9px] max-[650px]:text-[10px]" type="button" disabled title={t("flightSearch.booking.comingSoon")}>{t("flightSearch.booking.checkIn")}</button>
      <button className="shrink-0 cursor-pointer rounded-[7px] border-0 bg-transparent px-[13px] py-[10px] text-[13px] font-semibold uppercase text-[#252a30] disabled:cursor-not-allowed disabled:opacity-50 max-[650px]:px-2 max-[650px]:py-[9px] max-[650px]:text-[10px]" type="button" disabled title={t("flightSearch.booking.comingSoon")}>{t("flightSearch.booking.flightStatus")}</button>
      <span className="ml-auto rounded-lg bg-[#f5efdf] px-[13px] py-2 text-[13px] font-semibold text-[#755f34] max-[650px]:hidden">{t("flightSearch.booking.studentOffer")}</span>
    </div>
  );
}
