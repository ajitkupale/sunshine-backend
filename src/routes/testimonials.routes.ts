import { Router } from "express";
import {
  getTestimonials,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "../controllers/testimonials.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();

// Public
router.get("/", getTestimonials);

// Admin
router.get("/all", verifyToken, getAllTestimonials);
router.post("/", verifyToken, createTestimonial);
router.put("/:id", verifyToken, updateTestimonial);
router.delete("/:id", verifyToken, deleteTestimonial);

export default router;
