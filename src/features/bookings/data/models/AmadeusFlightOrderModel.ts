import type { AmadeusFlightOfferModel } from "@/src/features/flights/data/models/AmadeusFlightOfferModel";

/** Demo Flight Order resource modeled on Amadeus Flight Create Orders. */
export type AmadeusFlightOrderModel = {
  type: "flight-order";
  id: string;
  associatedRecords: Array<{
    reference: string;
    originSystemCode: string;
    flightOfferId: string;
  }>;
  flightOffers: AmadeusFlightOfferModel[];
  travelers: Array<{
    id: string;
    dateOfBirth: string;
    name: { firstName: string; lastName: string };
    travelerType: "ADULT";
    isDemo: true;
  }>;
  demo: true;
};
