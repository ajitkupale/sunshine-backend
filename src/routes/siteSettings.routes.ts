import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/siteSettings.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.get("/", getSettings);
router.put("/", verifyToken, updateSettings);

export default router;
