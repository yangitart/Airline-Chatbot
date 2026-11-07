import { type NextRequest } from "next/server";
import { updateSupabaseSession } from "@/src/core/api/supabase/updateSession";

export async function middleware(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    // Public flight lookups and chat handlers manage their own request session.
    "/((?!api/v1/chat/|api/v1/flights/search|api/v1/flights/featured|api/v1/flights/status|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
