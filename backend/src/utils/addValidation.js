import ApiError from "./ApiError.js";

export function addValidation(req, _, next, schema) {
  const { error } = schema.validate(req.body);

  if (error) {
    const errorMessage = error?.details
      ?.map((error) => error.message)
      .join(", ");

    return next(new ApiError(400, errorMessage));
  }

  next();
}
