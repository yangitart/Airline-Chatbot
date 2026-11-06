import { type NextRequest } from "next/server";
import { updateSupabaseSession } from "@/src/core/api/supabase/updateSession";

export async function middleware(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    // Chat route handlers validate and refresh the session through their own Supabase client.
    "/((?!api/v1/chat/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
