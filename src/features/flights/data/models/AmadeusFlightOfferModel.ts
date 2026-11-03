/** Amadeus Self-Service FlightOffer response shape used by seeded records.
 * `isDemo` and `sourceLabel` are explicit local extensions, not Amadeus fields.
 */
export type AmadeusFlightOfferModel = {
  type: "flight-offer";
  id: string;
  source: "DEMO" | "GDS" | "LCC" | "NDC";
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: Array<{
    duration: string;
    segments: Array<{
      id: string;
      departure: { iataCode: string; at: string; terminal?: string | null };
      arrival: { iataCode: string; at: string; terminal?: string | null };
      carrierCode: string;
      number: string;
      aircraft?: { code: string };
      duration: string;
      numberOfStops: number;
    }>;
  }>;
  price: { currency: string; total: string; base: string; grandTotal: string };
  pricingOptions: { fareType: string[]; includedCheckedBagsOnly: boolean };
  validatingAirlineCodes: string[];
  travelerPricings: Array<{
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: { currency: string; total: string; base: string };
    fareDetailsBySegment: Array<{
      segmentId: string;
      cabin: string;
      class: string;
      includedCheckedBags: { quantity: number };
    }>;
  }>;
  isDemo: boolean;
  sourceLabel: string;
};
