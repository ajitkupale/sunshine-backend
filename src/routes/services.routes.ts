import { Router } from "express";
import {
  getServices,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
  reorderServices,
} from "../controllers/services.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();

// Public
router.get("/", getServices);
router.get("/:slug", getServiceBySlug);

// Admin
router.post("/", verifyToken, createService);
router.patch("/reorder", verifyToken, reorderServices);
router.put("/:id", verifyToken, updateService);
router.delete("/:id", verifyToken, deleteService);

export default router;
