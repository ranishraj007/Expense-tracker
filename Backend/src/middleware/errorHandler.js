import { Prisma } from "@prisma/client";
import { sendError } from "../utils/responses.js";

export function notFound(req, res) {
  return sendError(res, 404, "Route not found.");
}

export function errorHandler(error, req, res, next) {
  console.error(error);

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return sendError(res, 409, "A record with that unique field already exists.", error.meta);
  }

  return sendError(res, 500, "Internal server error.");
}
