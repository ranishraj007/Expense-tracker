import { sendError } from "../utils/responses.js";

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body ?? {},
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return sendError(res, 400, "Validation failed.", result.error.flatten());
    }

    req.validated = result.data;
    next();
  };
}
