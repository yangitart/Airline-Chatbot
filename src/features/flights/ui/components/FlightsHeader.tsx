import { Globe2, UserRound } from "lucide-react";
import { GoogleUser } from "@/src/features/authentication/domain/models/GoogleUser";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

export function FlightsHeader({
  user,
  authLoading,
  onSignIn,
  onSignOut,
}: {
  user: GoogleUser | null;
  authLoading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}) {
  const { t, i18n } = useTranslation();
  const openUpcoming = () => {
    if (!user) onSignIn();
    else toast(t("flightSearch.booking.comingSoon"));
  };
  return (
    <>
      <div className="flex min-h-[42px] items-center justify-center gap-3 border-b border-[#25394e] bg-[#17283b] px-5 py-2 text-[13px] text-[#f4f1ea] max-[650px]:justify-start max-[650px]:text-[11px]">
        <span aria-hidden="true">ⓘ</span>
        <span>{t("flightSearch.alert.text")}</span>
        <a className="font-semibold text-[#e5c98f]" href="https://www.airindia.com/" target="_blank" rel="noreferrer">{t("flightSearch.alert.viewAll")}</a>
      </div>
      <header className="flex h-[82px] items-center gap-9 border-b border-[#e7e8ea] bg-white px-[clamp(20px,4vw,72px)] shadow-[0_3px_14px_rgb(15_31_47_/_5%)] max-[1050px]:justify-between max-[650px]:h-[66px] max-[650px]:gap-2 max-[650px]:px-4">
        <a className="flex items-center gap-1 whitespace-nowrap text-[25px] font-extrabold tracking-[.02em] text-[#c8102e] no-underline max-[650px]:text-xl" href="/" aria-label="Air India home">
          <span className="text-[31px] text-[#c4a466]" aria-hidden="true">✦</span><span>AIR INDIA</span>
        </a>
        <nav className="flex flex-1 items-center justify-center gap-[clamp(12px,2vw,32px)] max-[1050px]:hidden" aria-label="Main navigation">
          <a className="whitespace-nowrap text-xs font-semibold uppercase text-[#202329] no-underline" href="#search">{t("flightSearch.nav.bookManage")}</a>
          <button className="whitespace-nowrap text-xs font-semibold uppercase text-[#202329] disabled:opacity-50" type="button" disabled={authLoading} onClick={openUpcoming}>{t("flightSearch.nav.whereFly")}</button>
          <button className="whitespace-nowrap text-xs font-semibold uppercase text-[#202329] disabled:opacity-50" type="button" disabled={authLoading} onClick={openUpcoming}>{t("flightSearch.nav.prepareTravel")}</button>
          <button className="whitespace-nowrap text-xs font-semibold uppercase text-[#202329] disabled:opacity-50" type="button" disabled={authLoading} onClick={openUpcoming}>{t("flightSearch.nav.experience")}</button>
        </nav>
        <div className="flex min-w-0 items-center gap-3 max-[650px]:gap-1.5">
          <label className="inline-flex items-center gap-1.5 text-[#202329]" aria-label={t("flightSearch.nav.language")}>
            <Globe2 size={18} />
            <select
              className="cursor-pointer border-0 bg-transparent text-xs font-semibold text-inherit outline-offset-2"
              value={i18n.resolvedLanguage?.startsWith("es") ? "es" : "en"}
              onChange={(event) => {
                window.localStorage.setItem("airline-language", event.target.value);
                void i18n.changeLanguage(event.target.value);
              }}
              aria-label={t("flightSearch.nav.language")}
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>
          </label>
          {authLoading ? (
            <span className="px-[14px] py-[10px] text-[13px] text-[#707780]" role="status">{t("flightSearch.nav.checkingSession")}</span>
          ) : user ? (
            <div className="flex items-center gap-2">
              <a href="/my-trips" className="whitespace-nowrap text-xs font-semibold text-[#86233d] underline underline-offset-4">{t("flightSearch.booking.myTrips")}</a>
              <button type="button" className="inline-flex max-w-[170px] cursor-pointer items-center gap-2 rounded-full border border-[#e0e1e4] bg-transparent px-[14px] py-[10px] font-semibold text-[#202329] max-[650px]:max-w-[105px] max-[650px]:px-2 max-[650px]:text-xs" onClick={onSignOut} title={t("flightSearch.nav.signOut")}>
                <UserRound size={17} className="shrink-0" /> <span className="truncate">{user.name || user.email.split("@")[0]}</span>
              </button>
            </div>
          ) : (
            <button type="button" className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border border-[#e0e1e4] bg-transparent px-[14px] py-[10px] font-semibold text-[#202329] max-[650px]:px-2 max-[650px]:text-xs" onClick={onSignIn}>
              <UserRound size={17} /> {t("flightSearch.nav.signIn")}
            </button>
          )}
        </div>
      </header>
    </>
  );
}
