import { BrowserSupabaseClientFactory } from "@/src/core/api/supabase/client";
import { APP_ROUTES } from "@/src/core/routes/routes";
import { GoogleUserModel } from "../models/GoogleUserModel";
import { mapSupabaseUser } from "../mappers/GoogleUserMapper";

export interface GoogleAuthenticationDataSource {
  signIn(): Promise<string>;
  signInWithPassword(email: string, password: string): Promise<void>;
  signUpWithPassword(email: string, password: string): Promise<boolean>;
  requestPasswordReset(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  currentUser(): Promise<GoogleUserModel | null>;
  onAuthStateChange(
    listener: (user: GoogleUserModel | null) => void,
  ): () => void;
  signOut(): Promise<void>;
}

export const GoogleAuthenticationDataSourceImpl = (
  createSupabaseClient: BrowserSupabaseClientFactory,
): GoogleAuthenticationDataSource => ({
  signIn: async () => {
    const supabase = createSupabaseClient();
    const callbackUrl = new URL(
      APP_ROUTES.GOOGLE_AUTH_CALLBACK,
      window.location.origin,
    );
    callbackUrl.searchParams.set("next", APP_ROUTES.HOME + "?signedIn=1");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
        skipBrowserRedirect: true,
      },
    });
    if (error) throw error;
    if (!data.url)
      throw new Error("Supabase did not return a Google OAuth URL.");
    return data.url;
  },
  signInWithPassword: async (email, password) => {
    const { error } = await createSupabaseClient().auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  },
  signUpWithPassword: async (email, password) => {
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", "/?signedIn=1");
    const { data, error } = await createSupabaseClient().auth.signUp({
      email,
      password,
      options: { emailRedirectTo: callbackUrl.toString() },
    });
    if (error) throw error;
    return Boolean(data.session);
  },
  requestPasswordReset: async (email) => {
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", "/auth/reset-password");
    const { error } = await createSupabaseClient().auth.resetPasswordForEmail(
      email,
      { redirectTo: callbackUrl.toString() },
    );
    if (error) throw error;
  },
  updatePassword: async (password) => {
    const { error } = await createSupabaseClient().auth.updateUser({ password });
    if (error) throw error;
  },
  currentUser: async () => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user ? mapSupabaseUser(data.user) : null;
  },
  onAuthStateChange: (listener) => {
    const supabase = createSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      listener(session?.user ? mapSupabaseUser(session.user) : null);
    });
    return () => subscription.unsubscribe();
  },
  signOut: async () => {
    const { error } = await createSupabaseClient().auth.signOut();
    if (error) throw error;
  },
});
