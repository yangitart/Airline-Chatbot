import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/core/api/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next") ?? "/";
  let next = new URL("/", requestUrl.origin);
  if (requestedNext.startsWith("/")) {
    try {
      const destination = new URL(requestedNext, requestUrl.origin);
      if (destination.origin === requestUrl.origin) next = destination;
    } catch { /* Keep the home page as the fallback. */ }
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?authError=missing_code", requestUrl.origin));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/?authError=oauth_exchange_failed", requestUrl.origin));
  }

  return NextResponse.redirect(next);
}
