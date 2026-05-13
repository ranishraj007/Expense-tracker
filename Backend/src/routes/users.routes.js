import { Router } from "express";
import { createUser, deleteUser, getUser, listUsers, updateUser } from "../controllers/users.controller.js";
import { requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createUserSchema, idParamSchema, updateUserSchema } from "../schemas/user.schema.js";

const router = Router();

router.get("/", requireAdmin, listUsers);
router.get("/:id", validate(idParamSchema), getUser);
router.post("/", requireAdmin, validate(createUserSchema), createUser);
router.put("/:id", validate(updateUserSchema), updateUser);
router.delete("/:id", requireAdmin, validate(idParamSchema), deleteUser);

export default router;
