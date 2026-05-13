import { Router } from "express";
import { dailyAnalytics, monthlyAnalytics, summaryAnalytics } from "../controllers/analytics.controller.js";

const router = Router();

router.get("/daily", dailyAnalytics);
router.get("/monthly", monthlyAnalytics);
router.get("/summary", summaryAnalytics);

export default router;
