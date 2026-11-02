"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isLeft } from "fp-ts/Either";
import { useTranslation } from "react-i18next";
import { IUseCase } from "@/src/core/interfaces/IUseCase";
import { injector } from "@/src/ioc/utils/injector";
import { GoogleUser } from "@/src/features/authentication/domain/models/GoogleUser";
import { GoogleAuthenticationSymbols } from "@/src/features/authentication/ioc/GoogleAuthenticationSymbols";
import { GoogleAuthModal } from "@/src/features/authentication/ui/components/GoogleAuthModal";
import { FlightSearchQuery, FlightSearchResult } from "../../domain/models/FlightSearch";
import { FlightSearchSymbols } from "../../ioc/FlightSearchSymbols";
import { FlightSearchForm } from "../components/FlightSearchForm";
import { FlightsHeader } from "../components/FlightsHeader";
import { BookingTabs } from "../components/BookingTabs";
import { FlightResults } from "../components/FlightResults";

type SearchUseCase = IUseCase<FlightSearchQuery, Promise<import("fp-ts/Either").Either<string, FlightSearchResult>>>;
type CurrentUserUseCase = IUseCase<void, Promise<import("fp-ts/Either").Either<string, GoogleUser | null>>>;
type SignOutUseCase = IUseCase<void, Promise<import("fp-ts/Either").Either<string, void>>>;

export default function FlightSearchView() {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [results, setResults] = useState<FlightSearchResult | null>(null);
  const [error, setError] = useState("");
  const searchUseCase = useMemo(() => injector<SearchUseCase>(FlightSearchSymbols.searchUseCase), []);
  const currentUserUseCase = useMemo(() => injector<CurrentUserUseCase>(GoogleAuthenticationSymbols.currentUserUseCase), []);
  const signOutUseCase = useMemo(() => injector<SignOutUseCase>(GoogleAuthenticationSymbols.signOutUseCase), []);

  useEffect(() => {
    let active = true;
    void currentUserUseCase.execute()
      .then((result) => { if (active && !isLeft(result)) setUser(result.right); })
      .catch(() => undefined)
      .finally(() => { if (active) setAuthLoading(false); });
    return () => { active = false; };
  }, [currentUserUseCase]);

  useEffect(() => {
    const authError = new URLSearchParams(window.location.search).get("authError");
    if (authError) {
      setError(t("flightSearch.errors.signInFailed"));
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [t]);

  const searchFlights = useCallback(async (query: FlightSearchQuery) => {
    setError("");
    setResults(null);
    const result = await searchUseCase.execute(query);
    if (isLeft(result)) {
      setError(t("flightSearch.errors.searchFailed"));
      return;
    }
    setResults(result.right);
  }, [searchUseCase, t]);

  const signOut = useCallback(async () => {
    const result = await signOutUseCase.execute();
    if (isLeft(result)) {
      setError(t("flightSearch.errors.signOutFailed"));
      return;
    }
    setUser(null);
  }, [signOutUseCase, t]);

  return (
    <main className="min-h-screen bg-[#f4f2ee] text-[#162536]">
      <FlightsHeader user={user} authLoading={authLoading} onSignIn={() => setModalOpen(true)} onSignOut={() => void signOut()} />
      <section className="mx-auto mt-6 w-[min(96%,1500px)] rounded-[20px] border border-[#e8e0d3] bg-[#fffefa] px-[26px] pb-[18px] pt-[22px] shadow-[0_12px_34px_rgb(24_39_54_/_7%)] max-[650px]:mt-3 max-[650px]:w-[calc(100%-22px)] max-[650px]:rounded-[14px] max-[650px]:p-[14px]" id="search" aria-labelledby="booking-title">
        <BookingTabs />
        <h1 className="sr-only" id="booking-title">{t("flightSearch.booking.title")}</h1>
        <FlightSearchForm onSearch={searchFlights} />
      </section>
      {error && <p className="mx-auto my-[14px] w-[min(96%,1500px)] text-[#b42318]" role="alert">{error}</p>}
      {results && <FlightResults result={results} />}
      <footer className="flex justify-between gap-4 bg-white px-[3%] py-[22px] text-xs text-[#707780] max-[650px]:flex-col">
        <span>{t("flightSearch.footer.demo")}</span>
        <span>{t("flightSearch.footer.mock")}</span>
      </footer>
      {modalOpen && <GoogleAuthModal onClose={() => setModalOpen(false)} />}
    </main>
  );
}
