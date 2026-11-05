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
  const item = "group inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-airline-muted transition-all duration-300 hover:-translate-y-0.5 hover:bg-airline-forest-soft hover:text-airline-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-forest disabled:opacity-50 sm:px-4";

  return (
    <nav className="flex min-w-0 flex-wrap items-center gap-1 rounded-2xl bg-airline-canvas p-2" aria-label={t("flightSearch.booking.servicesLabel")}>
      <a className="inline-flex items-center gap-2 rounded-xl bg-airline-forest px-3 py-2.5 text-xs font-semibold text-white shadow-[0_6px_14px_rgb(24_61_55_/_16%)] no-underline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_18px_rgb(24_61_55_/_20%)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-gold sm:px-4" href="#search" aria-current="page"><Search size={16} aria-hidden="true" />{t("flightSearch.booking.searchFlights")}</a>
      <button className={item} type="button" disabled={authLoading} onClick={() => select("manage")}><BriefcaseBusiness size={16} aria-hidden="true" />{t("flightSearch.booking.manageBooking")}</button>
      <button className={item} type="button" disabled={authLoading} onClick={() => select("checkin")}><ClipboardCheck size={16} aria-hidden="true" />{t("flightSearch.booking.checkIn")}</button>
      <button className={item} type="button" onClick={() => router.push("/flight-status")}><Radar size={16} aria-hidden="true" />{t("flightSearch.booking.flightStatus")}</button>
    </nav>
  );
}
