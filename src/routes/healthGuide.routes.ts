import { Router } from "express";
import {
  getArticles,
  getAllArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
} from "../controllers/healthGuide.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();

// Public
router.get("/", getArticles);
router.get("/all", verifyToken, getAllArticles);
router.get("/:slug", getArticleBySlug);

// Admin
router.post("/", verifyToken, createArticle);
router.put("/:id", verifyToken, updateArticle);
router.delete("/:id", verifyToken, deleteArticle);

export default router;
