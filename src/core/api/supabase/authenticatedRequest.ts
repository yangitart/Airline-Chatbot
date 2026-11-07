import "server-only";

import { createSupabaseServerClient } from "./server";

export async function createAuthenticatedSupabaseContext() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  return { supabase, user: error ? null : data.user };
}
