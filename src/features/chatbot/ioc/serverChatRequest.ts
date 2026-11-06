import "server-only";

import { AuthInvalidJwtError, isAuthSessionMissingError } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/src/core/api/supabase/server";
import { ChatError } from "../domain/models/ChatError";

export async function authenticateChatRequest() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      if (isAuthSessionMissingError(error) || error instanceof AuthInvalidJwtError
        || ["bad_jwt", "session_not_found", "refresh_token_not_found", "refresh_token_already_used", "user_not_found"].includes(error.code ?? "")) {
        throw new ChatError("auth_required");
      }
      throw error;
    }
    if (!data.user) throw new ChatError("auth_required");
    return { supabase, userId: data.user.id };
  } catch (error) {
    if (error instanceof ChatError) throw error;
    throw new ChatError("auth_unavailable", error);
  }
}
