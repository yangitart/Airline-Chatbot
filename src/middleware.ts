import { type NextRequest } from "next/server";
import { updateSupabaseSession } from "@/src/core/api/supabase/updateSession";

export async function middleware(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    // API handlers manage their own authentication (or verify a webhook signature).
    "/((?!api/v1/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
