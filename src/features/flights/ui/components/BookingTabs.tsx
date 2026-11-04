import { BriefcaseBusiness, ClipboardCheck, Radar, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export function BookingTabs({
  isAuthenticated,
  authLoading,
  onSignIn,
}: {
  isAuthenticated: boolean;
  authLoading: boolean;
  onSignIn: () => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const select = (action: "manage" | "checkin") => {
    if (!isAuthenticated) { onSignIn(); return; }
    if (action === "manage") router.push("/my-trips");
    else router.push("/my-trips?check-in=1");
  };
  const item = "inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#66756f] transition hover:bg-[#f0f5f2] hover:text-[#183d37] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173e38] disabled:opacity-50 sm:px-4";

  return (
    <nav className="flex min-w-0 items-center gap-1 overflow-x-auto border-b border-[#e7ede9] pb-3" aria-label={t("flightSearch.booking.servicesLabel")}>
      <a className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#e8f0ec] px-3 py-2.5 text-xs font-semibold text-[#173e38] no-underline sm:px-4" href="#search" aria-current="page"><Search size={16} aria-hidden="true" />{t("flightSearch.booking.searchFlights")}</a>
      <button className={item} type="button" disabled={authLoading} onClick={() => select("manage")}><BriefcaseBusiness size={16} aria-hidden="true" />{t("flightSearch.booking.manageBooking")}</button>
      <button className={item} type="button" disabled={authLoading} onClick={() => select("checkin")}><ClipboardCheck size={16} aria-hidden="true" />{t("flightSearch.booking.checkIn")}</button>
      <button className={item} type="button" onClick={() => router.push("/flight-status")}><Radar size={16} aria-hidden="true" />{t("flightSearch.booking.flightStatus")}</button>
    </nav>
  );
}
