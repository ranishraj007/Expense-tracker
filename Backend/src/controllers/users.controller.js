import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { sendError, sendSuccess } from "../utils/responses.js";
import { toPublicUser } from "../utils/users.js";

const rounds = () => Number(process.env.BCRYPT_ROUNDS || 12);

export async function listUsers(req, res) {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return sendSuccess(res, users.map(toPublicUser));
}

export async function getUser(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.validated.params.id } });
  if (!user) return sendError(res, 404, "User not found.");
  return sendSuccess(res, toPublicUser(user));
}

export async function createUser(req, res) {
  const payload = req.validated.body;
  const password = await bcrypt.hash(payload.password, rounds());

  const user = await prisma.user.create({
    data: {
      username: payload.username,
      password,
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      profileImage: payload.profileImage || payload.avatarUrl || null,
      role: "USER",
    },
  });

  return sendSuccess(res.status(201), toPublicUser(user), "User created.");
}

export async function updateUser(req, res) {
  const targetId = req.validated.params.id;
  const isSelf = req.user.id === targetId;
  const isAdmin = req.user.role === "ADMIN";

  if (!isSelf && !isAdmin) {
    return sendError(res, 403, "You can only update your own profile.");
  }

  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) return sendError(res, 404, "User not found.");

  const payload = req.validated.body;
  const data = {};

  for (const field of ["username", "name", "phone", "email"]) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) data[field] = payload[field];
  }

  if (Object.prototype.hasOwnProperty.call(payload, "profileImage") || Object.prototype.hasOwnProperty.call(payload, "avatarUrl")) {
    data.profileImage = payload.profileImage || payload.avatarUrl || null;
  }

  const nextPassword = payload.newPassword || payload.password;
  if (nextPassword) {
    if (!isSelf) return sendError(res, 403, "Only users can change their own password.");

    const oldPasswordMatches = await bcrypt.compare(payload.oldPassword, target.password);
    if (!oldPasswordMatches) return sendError(res, 400, "Old password is incorrect.");

    data.password = await bcrypt.hash(nextPassword, rounds());
  }

  const updated = await prisma.user.update({ where: { id: targetId }, data });
  return sendSuccess(res, toPublicUser(updated), "Profile updated.");
}

export async function deleteUser(req, res) {
  const targetId = req.validated.params.id;
  if (req.user.id === targetId) return sendError(res, 400, "Admins cannot delete their own account.");

  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) return sendError(res, 404, "User not found.");
  if (user.role === "ADMIN") return sendError(res, 400, "The admin account cannot be deleted.");

  await prisma.user.delete({ where: { id: targetId } });
  return sendSuccess(res, { id: targetId }, "User deleted.");
}
