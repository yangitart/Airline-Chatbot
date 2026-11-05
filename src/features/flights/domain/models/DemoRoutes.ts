export const DEMO_AIRPORT_CODES = ["DEL", "BOM", "BLR", "MAA", "HYD"] as const;
export type DemoAirportCode = (typeof DEMO_AIRPORT_CODES)[number];

/** Only route pairs present in the seeded demo inventory. */
export const DEMO_ROUTE_PAIRS: ReadonlyArray<{ origin: DemoAirportCode; destination: DemoAirportCode }> = [
  { origin: "DEL", destination: "BOM" },
  { origin: "DEL", destination: "BLR" },
  { origin: "DEL", destination: "MAA" },
  { origin: "DEL", destination: "HYD" },
  { origin: "BOM", destination: "DEL" },
  { origin: "BLR", destination: "DEL" },
];
