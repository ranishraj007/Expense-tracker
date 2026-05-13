import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { sendError } from "../utils/responses.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return sendError(res, 401, "Authentication token is required.");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return sendError(res, 401, "User no longer exists.");

    req.user = user;
    next();
  } catch {
    return sendError(res, 401, "Invalid or expired token.");
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "ADMIN") return sendError(res, 403, "Admin access is required.");
  next();
}
