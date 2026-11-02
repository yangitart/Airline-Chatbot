import * as Yup from "yup";
import { numberRegex } from "./regexs";
import { ValidationErrorMessages } from "./errorMessages";

export const numberValidation = Yup.string()
  .required(ValidationErrorMessages.required)
  .matches(numberRegex, ValidationErrorMessages.formatIncorrect);

export const defaultValidation = Yup.string().required(ValidationErrorMessages.required);
