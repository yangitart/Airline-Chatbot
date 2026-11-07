import { NextRequest } from "next/server";
import { createAuthenticatedSupabaseContext } from "@/src/core/api/supabase/authenticatedRequest";
import { jsonError, jsonResponse } from "@/src/core/api/http/jsonResponse";
import { isLeft } from "fp-ts/Either";
import { createServerTravelProfile } from "@/src/features/users/ioc/serverTravelProfile";
import {
  isSupportedLanguage,
  type SupportedLanguage,
} from "@/src/core/locales/supportedLanguages";

function serializeProfile(profile: {
  displayName: string;
  phone: string;
  preferredLanguage: SupportedLanguage;
  updatedAt: string;
}) {
  return {
    display_name: profile.displayName,
    phone: profile.phone,
    preferred_language: profile.preferredLanguage,
    updated_at: profile.updatedAt,
  };
}

export async function GET() {
  const { supabase, user } = await createAuthenticatedSupabaseContext();
  if (!user)
    return jsonError("Sign in to view your profile.", 401, "auth_required");
  const result = await createServerTravelProfile(supabase).get.execute(user.id);
  if (isLeft(result))
    return jsonError(
      "Profile could not be loaded.",
      500,
      "profile_load_failed",
    );
  return jsonResponse(serializeProfile(result.right));
}

export async function PATCH(request: NextRequest) {
  const { supabase, user } = await createAuthenticatedSupabaseContext();
  if (!user)
    return jsonError("Sign in to update your profile.", 401, "auth_required");
  let body: Record<string, unknown> | null;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request.", 400, "profile_invalid");
  }
  const displayName = body?.display_name;
  const phone = body?.phone;
  const preferredLanguage = body?.preferred_language;
  if (
    typeof displayName !== "string" ||
    displayName.length > 100 ||
    typeof phone !== "string" ||
    phone.length > 40 ||
    !isSupportedLanguage(preferredLanguage)
  ) {
    return jsonError(
      "Enter a valid name, phone, and language.",
      422,
      "profile_invalid",
    );
  }
  try {
    const result = await createServerTravelProfile(supabase).update.execute({
      userId: user.id,
      profile: {
        displayName: displayName.trim(),
        phone: phone.trim(),
        preferredLanguage,
      },
    });
    if (isLeft(result))
      return jsonError(
        "Profile could not be saved.",
        500,
        "profile_save_failed",
      );
    return jsonResponse(serializeProfile(result.right));
  } catch {
    return jsonError("Profile could not be saved.", 500, "profile_save_failed");
  }
}
