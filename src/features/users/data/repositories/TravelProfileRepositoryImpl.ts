import { left, right } from "fp-ts/Either";
import type { TravelProfileRepository } from "../../domain/repositories/TravelProfileRepository";
import type { TravelProfile } from "../../domain/models/TravelProfile";
import type { SupportedLanguage } from "@/src/core/locales/supportedLanguages";
import type { createSupabaseTravelProfileDataSource } from "../data_sources/SupabaseTravelProfileDataSource";

type DataSource = ReturnType<typeof createSupabaseTravelProfileDataSource>;
type ProfileRow = { display_name: string; phone: string; preferred_language: SupportedLanguage; updated_at: string };
const mapProfile = (row: ProfileRow): TravelProfile => ({ displayName: row.display_name, phone: row.phone, preferredLanguage: row.preferred_language, updatedAt: row.updated_at });
const errorMessage = (error: unknown) => error instanceof Error ? error.message : "profile_operation_failed";

export function TravelProfileRepositoryImpl(dataSource: DataSource): TravelProfileRepository {
  return {
    get: async (userId) => { try { return right(mapProfile(await dataSource.get(userId) as ProfileRow)); } catch (error) { return left(errorMessage(error)); } },
    save: async (userId, profile) => {
      try { return right(mapProfile(await dataSource.save(userId, { display_name: profile.displayName, phone: profile.phone, preferred_language: profile.preferredLanguage }) as ProfileRow)); }
      catch (error) { return left(errorMessage(error)); }
    },
  };
}
