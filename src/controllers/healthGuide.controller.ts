import { Request, Response, NextFunction } from "express";
import { HealthGuide } from "../models/HealthGuide";
import { createError } from "../middleware/errorHandler";

/** GET /api/health-guide — public */
export async function getArticles(_req: Request, res: Response, next: NextFunction) {
  try {
    const articles = await HealthGuide.find({ isPublished: true })
      .select("-__v")
      .sort({ publishedAt: -1 });
    res.json({ success: true, data: articles });
  } catch (error) {
    next(error);
  }
}

/** GET /api/health-guide/all — admin */
export async function getAllArticles(_req: Request, res: Response, next: NextFunction) {
  try {
    const articles = await HealthGuide.find().sort({ createdAt: -1 });
    res.json({ success: true, data: articles });
  } catch (error) {
    next(error);
  }
}

/** GET /api/health-guide/:slug — public */
export async function getArticleBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const article = await HealthGuide.findOne({
      slug: req.params.slug,
      isPublished: true,
    });
    if (!article) return next(createError("Article not found", 404));
    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
}

/** POST /api/health-guide — admin */
export async function createArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const article = await HealthGuide.create(req.body);
    res.status(201).json({ success: true, data: article });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(createError("An article with this slug already exists", 409));
    }
    next(error);
  }
}

/** PUT /api/health-guide/:id — admin */
export async function updateArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const article = await HealthGuide.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!article) return next(createError("Article not found", 404));
    res.json({ success: true, data: article });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(createError("An article with this slug already exists", 409));
    }
    next(error);
  }
}

/** DELETE /api/health-guide/:id — admin */
export async function deleteArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const article = await HealthGuide.findByIdAndDelete(req.params.id);
    if (!article) return next(createError("Article not found", 404));
    res.json({ success: true, message: "Article deleted" });
  } catch (error) {
    next(error);
  }
}
