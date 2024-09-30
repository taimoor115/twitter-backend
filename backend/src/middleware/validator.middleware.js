import { addValidation } from "../utils/addValidation.js";
import {
  loginValidatorSchema,
  userValidatorSchema,
} from "../validator/auth.validator.js";
export const userValidation = (req, _, next) =>
  addValidation(req, _, next, userValidatorSchema);

export const loginValidation = (req, _, next) =>
  addValidation(req, _, next, loginValidatorSchema);
