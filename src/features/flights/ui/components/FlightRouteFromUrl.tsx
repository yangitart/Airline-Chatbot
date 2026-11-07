"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  DEMO_AIRPORT_CODES,
  type DemoAirportCode,
} from "../../domain/models/DemoRoutes";

export type RoutePrefill = {
  origin: DemoAirportCode;
  destination: DemoAirportCode;
  date?: string;
};

function isAirportCode(code: string | null): code is DemoAirportCode {
  return DEMO_AIRPORT_CODES.some((airport) => airport === code);
}

export function FlightRouteFromUrl({
  onSelect,
}: {
  onSelect: (route: RoutePrefill) => void;
}) {
  const params = useSearchParams();
  const origin = params.get("origin");
  const destination = params.get("destination");

  useEffect(() => {
    if (
      isAirportCode(origin) &&
      isAirportCode(destination) &&
      origin !== destination
    ) {
      onSelect({ origin, destination });
    }
  }, [origin, destination, onSelect]);

  return null;
}
