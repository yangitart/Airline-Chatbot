import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SupportedLanguage } from "@/src/core/locales/supportedLanguages";

export function createSupabaseTravelProfileDataSource(supabase: SupabaseClient) {
  const fields = "display_name,phone,preferred_language,updated_at";
  return {
    get: async (userId: string) => {
      const { data: existing, error: readError } = await supabase.from("profiles").select(fields).eq("user_id", userId).maybeSingle();
      if (readError) throw readError;
      if (existing) return existing;
      const { data, error } = await supabase.from("profiles").insert({ user_id: userId }).select(fields).single();
      if (error?.code === "23505") {
        const { data: concurrentProfile, error: concurrentReadError } = await supabase.from("profiles").select(fields).eq("user_id", userId).single();
        if (concurrentReadError) throw concurrentReadError;
        return concurrentProfile;
      }
      if (error) throw error;
      return data;
    },
    save: async (userId: string, profile: { display_name: string; phone: string; preferred_language: SupportedLanguage }) => {
      const { data, error } = await supabase.from("profiles").upsert({ user_id: userId, ...profile }, { onConflict: "user_id" }).select(fields).single();
      if (error) throw error;
      return data;
    },
  };
}
