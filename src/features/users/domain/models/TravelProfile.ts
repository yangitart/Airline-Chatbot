export type TravelProfile = {
  displayName: string;
  phone: string;
  preferredLanguage: "en" | "es";
  updatedAt: string;
};

export type UpdateTravelProfileCommand = Pick<TravelProfile, "displayName" | "phone" | "preferredLanguage">;
