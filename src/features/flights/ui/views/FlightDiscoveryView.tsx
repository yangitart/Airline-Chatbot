"use client";

import { useState } from "react";
import type { RoutePrefill } from "../components/FlightRouteFromUrl";
import FlightSearchView from "./FlightSearchView";
import WhereWeFlyView from "./WhereWeFlyView";

export default function FlightDiscoveryView() {
  const [selectedRoute, setSelectedRoute] = useState<RoutePrefill | null>(null);

  return (
    <>
      <FlightSearchView selectedRoute={selectedRoute} />
      <WhereWeFlyView onSelectRoute={setSelectedRoute} />
    </>
  );
}
