import { GoogleUser } from "../../domain/models/GoogleUser";
import { GoogleUserModel } from "../models/GoogleUserModel";
import type { User } from "@supabase/supabase-js";

export const mapGoogleUser = (model: GoogleUserModel): GoogleUser => ({
  id: model.id,
  email: model.email,
  name: model.name,
  picture: model.picture,
});

export function mapSupabaseUser(user: User): GoogleUserModel {
  const fullName = user.user_metadata.full_name;
  const displayName = user.user_metadata.name;
  const avatarUrl = user.user_metadata.avatar_url;
  const picture = user.user_metadata.picture;
  return {
    id: user.id,
    email: user.email ?? "",
    name:
      typeof fullName === "string"
        ? fullName
        : typeof displayName === "string"
          ? displayName
          : "",
    picture:
      typeof avatarUrl === "string"
        ? avatarUrl
        : typeof picture === "string"
          ? picture
          : "",
  };
}
