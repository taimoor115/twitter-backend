import Joi from "joi";

export const userValidatorSchema = Joi.object({
  username: Joi.string().required().trim(),
  fullName: Joi.string().required().trim(),
  email: Joi.string().email().required().trim().lowercase(),
  password: Joi.string().min(6).required(),
});

export const loginValidatorSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string",
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
  }),

  password: Joi.string().min(6).required().messages({
    "string.base": "Password must be a string",
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
});
