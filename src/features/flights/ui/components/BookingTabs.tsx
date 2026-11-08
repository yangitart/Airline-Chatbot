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
    if (!isAuthenticated) {
      onSignIn();
      return;
    }
    if (action === "manage") router.push("/my-trips");
    else router.push("/my-trips?check-in=1");
  };
  const item =
    "group inline-flex min-h-11 min-w-0 items-center gap-2 rounded-xl px-2 py-2 text-left text-xs font-semibold text-airline-muted transition-colors hover:bg-airline-forest-soft hover:text-airline-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-forest disabled:opacity-50 sm:px-4";

  return (
    <nav
      className="grid min-w-0 grid-cols-2 gap-1 rounded-2xl bg-airline-canvas p-1.5 sm:flex sm:flex-wrap sm:items-center sm:p-2"
      aria-label={t("flightSearch.booking.servicesLabel")}
    >
      <a
        className="inline-flex min-h-11 min-w-0 items-center gap-2 rounded-xl bg-airline-forest px-2 py-2 text-xs font-semibold text-white no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-gold sm:px-4"
        href="#search"
        aria-current="page"
      >
        <Search size={16} className="shrink-0" aria-hidden="true" />
        {t("flightSearch.booking.searchFlights")}
      </a>
      <button
        className={item}
        type="button"
        disabled={authLoading}
        onClick={() => select("manage")}
      >
        <BriefcaseBusiness size={16} className="shrink-0" aria-hidden="true" />
        {t("flightSearch.booking.manageBooking")}
      </button>
      <button
        className={item}
        type="button"
        disabled={authLoading}
        onClick={() => select("checkin")}
      >
        <ClipboardCheck size={16} className="shrink-0" aria-hidden="true" />
        {t("flightSearch.booking.checkIn")}
      </button>
      <button
        className={item}
        type="button"
        onClick={() => router.push("/flight-status")}
      >
        <Radar size={16} className="shrink-0" aria-hidden="true" />
        {t("flightSearch.booking.flightStatus")}
      </button>
    </nav>
  );
}
