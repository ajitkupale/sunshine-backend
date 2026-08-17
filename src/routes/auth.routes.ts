import { Router } from "express";
import { login, refreshToken, getMe, changePassword } from "../controllers/auth.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.post("/login", login);
router.post("/refresh", refreshToken);
router.get("/me", verifyToken, getMe);
router.put("/change-password", verifyToken, changePassword);

export default router;
