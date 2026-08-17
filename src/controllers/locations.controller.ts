import { Request, Response, NextFunction } from "express";
import { LocationPage } from "../models/LocationPage";
import { createError } from "../middleware/errorHandler";

/** GET /api/locations — public */
export async function getLocations(_req: Request, res: Response, next: NextFunction) {
  try {
    const locations = await LocationPage.find({ isPublished: true }).sort({ city: 1 });
    res.json({ success: true, data: locations });
  } catch (error) {
    next(error);
  }
}

/** GET /api/locations/all — admin */
export async function getAllLocations(_req: Request, res: Response, next: NextFunction) {
  try {
    const locations = await LocationPage.find().sort({ createdAt: -1 });
    res.json({ success: true, data: locations });
  } catch (error) {
    next(error);
  }
}

/** GET /api/locations/:slug — public */
export async function getLocationBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const location = await LocationPage.findOne({
      slug: req.params.slug,
      isPublished: true,
    });
    if (!location) return next(createError("Location page not found", 404));
    res.json({ success: true, data: location });
  } catch (error) {
    next(error);
  }
}

/** POST /api/locations — admin */
export async function createLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const location = await LocationPage.create(req.body);
    res.status(201).json({ success: true, data: location });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(createError("A location page with this slug already exists", 409));
    }
    next(error);
  }
}

/** PUT /api/locations/:id — admin */
export async function updateLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const location = await LocationPage.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!location) return next(createError("Location page not found", 404));
    res.json({ success: true, data: location });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(createError("A location page with this slug already exists", 409));
    }
    next(error);
  }
}

/** DELETE /api/locations/:id — admin */
export async function deleteLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const location = await LocationPage.findByIdAndDelete(req.params.id);
    if (!location) return next(createError("Location page not found", 404));
    res.json({ success: true, message: "Location page deleted" });
  } catch (error) {
    next(error);
  }
}
