import { z } from "zod";

const optionalUrl = z.string().url().optional().nullable();

export const idParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  query: z.object({}).passthrough(),
  body: z.object({}).passthrough(),
});

export const createUserSchema = z.object({
  body: z.object({
    username: z.string().min(3),
    password: z.string().min(6),
    name: z.string().min(2),
    phone: z.string().min(6).optional(),
    email: z.string().email().optional(),
    profileImage: optionalUrl,
    avatarUrl: optionalUrl,
    role: z.enum(["USER", "member"]).optional(),
  }),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
});

export const updateUserSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    username: z.string().min(3).optional(),
    password: z.string().min(6).optional(),
    oldPassword: z.string().min(6).optional(),
    newPassword: z.string().min(6).optional(),
    name: z.string().min(2).optional(),
    phone: z.string().min(6).optional().nullable(),
    email: z.string().email().optional().nullable(),
    profileImage: optionalUrl,
    avatarUrl: optionalUrl,
  }),
  query: z.object({}).passthrough(),
});
