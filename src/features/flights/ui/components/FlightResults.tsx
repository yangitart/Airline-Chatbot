import { FlightSearchResult } from "../../domain/models/FlightSearch";
import { useTranslation } from "react-i18next";

export function FlightResults({ result }: { result: FlightSearchResult }) {
  const { t, i18n } = useTranslation();
  const cabinKey = result.cabin_class === "premium-economy" ? "premiumEconomy" : result.cabin_class;
  const cabinLabel = t(`flightSearch.fields.${cabinKey}`);
  return (
    <section className="mx-auto my-9 w-[min(96%,1500px)]" aria-live="polite" aria-labelledby="results-title">
      <div className="flex items-center justify-between gap-5 max-[650px]:items-start">
        <div>
          <span className="text-xs font-bold tracking-[.12em] text-[#b32025]">{t("flightSearch.results.eyebrow")}</span>
          <h2 className="my-[5px] text-[27px] text-[#242a33]" id="results-title">{result.origin} <span className="text-[#c8102e]" aria-hidden="true">→</span> {result.destination}</h2>
          <p className="my-1 text-[#68717c]">{new Date(`${result.departure_date}T12:00:00`).toLocaleDateString(i18n.resolvedLanguage)}</p>
          {result.return_date && <p className="my-1 text-[#68717c]">{t("flightSearch.fields.return")}: {new Date(`${result.return_date}T12:00:00`).toLocaleDateString(i18n.resolvedLanguage)}</p>}
          <p className="!mt-1 font-semibold !text-[#444]">{t("flightSearch.results.searchSummary", { passengers: result.passengers, cabinClass: cabinLabel })}</p>
        </div>
        <span className="max-w-[120px] rounded-full bg-[#f2ead6] px-[11px] py-2 text-center text-[11px] font-extrabold tracking-[.05em] text-[#6c5428]">{t("flightSearch.results.demoBadge")}</span>
      </div>
      <p className="border-l-[3px] border-[#c4a466] bg-[#faf6ec] px-[13px] py-[10px] text-[13px] text-[#5f5238]">{result.is_mock ? t("flightSearch.results.mockNotice") : result.notice}</p>
      <div className="overflow-hidden rounded-[14px] border border-[#e6e8eb] bg-white">
        {result.flights.map((flight) => (
          <article className="grid grid-cols-[1fr_.7fr_1fr_.7fr_.8fr] items-center gap-3 border-b border-[#edf0f2] p-5 last:border-0 max-[650px]:grid-cols-2 max-[650px]:p-[14px]" key={flight.flight_number}>
            <div><strong className="block text-[17px]">{flight.flight_number}</strong><small className="mt-1 block text-xs text-[#7a828c]">{t("flightSearch.results.notice")}</small></div>
            <div><strong className="block text-[17px]">{flight.departure}</strong><small className="mt-1 block text-xs text-[#7a828c]">{result.origin}</small></div>
            <div className="text-center text-xs text-[#65707c] max-[650px]:hidden"><span className="block tracking-[.08em] text-[#b8bec5]">{t("flightSearch.results.duration")}</span>{flight.duration}<span className="block tracking-[.08em] text-[#b8bec5]" aria-hidden="true">────────</span></div>
            <div><strong className="block text-[17px]">{flight.arrival}</strong><small className="mt-1 block text-xs text-[#7a828c]">{result.destination}</small></div>
            <div className="text-right max-[650px]:text-left"><strong className="block text-[17px]">₹{flight.price.toLocaleString("en-IN")}</strong><small className="mt-1 block text-xs text-[#7a828c]">{t("flightSearch.results.perAdult")}</small></div>
          </article>
        ))}
      </div>
    </section>
  );
}
