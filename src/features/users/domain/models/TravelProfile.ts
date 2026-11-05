import type { SupportedLanguage } from "@/src/core/locales/supportedLanguages";

export type TravelProfile = {
  displayName: string;
  phone: string;
  preferredLanguage: SupportedLanguage;
  updatedAt: string;
};

export type UpdateTravelProfileCommand = Pick<TravelProfile, "displayName" | "phone" | "preferredLanguage">;
