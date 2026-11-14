import type { TravelProfile } from "../../domain/models/TravelProfile";

export const serializeTravelProfile = (profile: TravelProfile) => ({
  display_name: profile.displayName,
  phone: profile.phone,
  preferred_language: profile.preferredLanguage,
  updated_at: profile.updatedAt,
});
