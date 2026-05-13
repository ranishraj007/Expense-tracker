import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { sendError, sendSuccess } from "../utils/responses.js";
import { toPublicUser } from "../utils/users.js";

export async function login(req, res) {
  const { username, identifier, password } = req.validated.body;
  const loginName = username || identifier;

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: loginName }, { email: loginName }],
    },
  });

  if (!user) return sendError(res, 401, "Username/email or password is incorrect.");

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return sendError(res, 401, "Username/email or password is incorrect.");

  const token = jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );

  return sendSuccess(res, { token, user: toPublicUser(user) }, "Login successful.");
}
