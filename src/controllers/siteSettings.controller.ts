import { Request, Response, NextFunction } from "express";
import { getOrCreateSettings } from "../models/SiteSettings";
import { createError } from "../middleware/errorHandler";

/** GET /api/settings — public */
export async function getSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await getOrCreateSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
}

/** PUT /api/settings — admin */
export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await getOrCreateSettings();

    // Deep merge: update only provided fields
    Object.assign(settings, req.body);
    settings.updatedAt = new Date();
    await settings.save();

    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
}
