import { BrowserSupabaseClientFactory } from "@/src/core/api/supabase/client";
import type { User } from "@supabase/supabase-js";
import { APP_ROUTES } from "@/src/core/routes/routes";
import { GoogleUserModel } from "../models/GoogleUserModel";

export interface GoogleAuthenticationDataSource {
  signIn(): Promise<string>;
  currentUser(): Promise<GoogleUserModel | null>;
  onAuthStateChange(listener: (user: GoogleUserModel | null) => void): () => void;
  signOut(): Promise<void>;
}

function mapSupabaseUser(user: User): GoogleUserModel {
  const fullName = user.user_metadata.full_name;
  const displayName = user.user_metadata.name;
  const avatarUrl = user.user_metadata.avatar_url;
  const picture = user.user_metadata.picture;
  return {
    id: user.id,
    email: user.email ?? "",
    name: typeof fullName === "string" ? fullName : typeof displayName === "string" ? displayName : "",
    picture: typeof avatarUrl === "string" ? avatarUrl : typeof picture === "string" ? picture : "",
  };
}

export const GoogleAuthenticationDataSourceImpl = (
  createSupabaseClient: BrowserSupabaseClientFactory,
): GoogleAuthenticationDataSource => ({
  signIn: async () => {
    const supabase = createSupabaseClient();
    const callbackUrl = new URL(APP_ROUTES.GOOGLE_AUTH_CALLBACK, window.location.origin);
    callbackUrl.searchParams.set("next", APP_ROUTES.HOME + "?signedIn=1");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl.toString(), skipBrowserRedirect: true },
    });
    if (error) throw error;
    if (!data.url) throw new Error("Supabase did not return a Google OAuth URL.");
    return data.url;
  },
  currentUser: async () => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user ? mapSupabaseUser(data.user) : null;
  },
  onAuthStateChange: (listener) => {
    const supabase = createSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      listener(session?.user ? mapSupabaseUser(session.user) : null);
    });
    return () => subscription.unsubscribe();
  },
  signOut: async () => {
    const { error } = await createSupabaseClient().auth.signOut();
    if (error) throw error;
  },
});
