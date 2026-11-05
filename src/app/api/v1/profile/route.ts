import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/core/api/supabase/server";
import { isLeft } from "fp-ts/Either";
import { createServerTravelProfile } from "@/src/features/users/ioc/serverTravelProfile";
import { isSupportedLanguage, type SupportedLanguage } from "@/src/core/locales/supportedLanguages";

function serializeProfile(profile: { displayName: string; phone: string; preferredLanguage: SupportedLanguage; updatedAt: string }) {
  return { display_name: profile.displayName, phone: profile.phone, preferred_language: profile.preferredLanguage, updated_at: profile.updatedAt };
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ detail: "Sign in to view your profile.", error_code: "auth_required" }, { status: 401 });
  const result = await createServerTravelProfile(supabase).get.execute(user.id);
  if (isLeft(result)) return NextResponse.json({ detail: "Profile could not be loaded.", error_code: "profile_load_failed" }, { status: 500 });
  return NextResponse.json(serializeProfile(result.right));
}

export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ detail: "Sign in to update your profile.", error_code: "auth_required" }, { status: 401 });
  let body: Record<string, unknown> | null;
  try { body = await request.json(); } catch { return NextResponse.json({ detail: "Invalid request.", error_code: "profile_invalid" }, { status: 400 }); }
  const displayName = body?.display_name;
  const phone = body?.phone;
  const preferredLanguage = body?.preferred_language;
  if (typeof displayName !== "string" || displayName.length > 100 || typeof phone !== "string" || phone.length > 40 || !isSupportedLanguage(preferredLanguage)) {
    return NextResponse.json({ detail: "Enter a valid name, phone, and language.", error_code: "profile_invalid" }, { status: 422 });
  }
  try {
    const result = await createServerTravelProfile(supabase).update.execute({ userId: user.id, profile: { displayName: displayName.trim(), phone: phone.trim(), preferredLanguage } });
    if (isLeft(result)) return NextResponse.json({ detail: "Profile could not be saved.", error_code: "profile_save_failed" }, { status: 500 });
    return NextResponse.json(serializeProfile(result.right));
  } catch { return NextResponse.json({ detail: "Profile could not be saved.", error_code: "profile_save_failed" }, { status: 500 }); }
}
