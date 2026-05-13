import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(2).optional(),
    identifier: z.string().min(2).optional(),
    password: z.string().min(1),
  }).refine((value) => value.username || value.identifier, {
    message: "Username is required.",
    path: ["username"],
  }),
});
