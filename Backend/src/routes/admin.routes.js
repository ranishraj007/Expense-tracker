import { Router } from "express";
import { allUsersAnalytics } from "../controllers/analytics.controller.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.use(requireAdmin);
router.get("/analytics/all-users", allUsersAnalytics);

export default router;
