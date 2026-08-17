import { Router } from "express";
import {
  getLocations,
  getAllLocations,
  getLocationBySlug,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../controllers/locations.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();

// Public
router.get("/", getLocations);
router.get("/all", verifyToken, getAllLocations);
router.get("/:slug", getLocationBySlug);

// Admin
router.post("/", verifyToken, createLocation);
router.put("/:id", verifyToken, updateLocation);
router.delete("/:id", verifyToken, deleteLocation);

export default router;
