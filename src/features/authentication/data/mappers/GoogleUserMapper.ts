import { GoogleUser } from "../../domain/models/GoogleUser";
import { GoogleUserModel } from "../models/GoogleUserModel";

export const mapGoogleUser = (model: GoogleUserModel): GoogleUser => ({
  id: model.id,
  email: model.email,
  name: model.name,
  picture: model.picture,
});
