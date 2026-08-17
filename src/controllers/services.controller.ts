import { Request, Response, NextFunction } from "express";
import { Service } from "../models/Service";
import { createError } from "../middleware/errorHandler";

/** GET /api/services — public */
export async function getServices(req: Request, res: Response, next: NextFunction) {
  try {
    const isAdmin = !!req.admin; // admin can see all, public only published
    const filter = isAdmin ? {} : { isPublished: true };
    const services = await Service.find(filter).sort({ sortOrder: 1, createdAt: 1 });
    res.json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
}

/** GET /api/services/:slug — public */
export async function getServiceBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const service = await Service.findOne({ slug: req.params.slug, isPublished: true });
    if (!service) return next(createError("Service not found", 404));
    res.json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
}

/** POST /api/services — admin */
export async function createService(req: Request, res: Response, next: NextFunction) {
  try {
    const count = await Service.countDocuments();
    const service = await Service.create({
      ...req.body,
      sortOrder: count,
    });
    res.status(201).json({ success: true, data: service });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(createError("A service with this slug already exists", 409));
    }
    next(error);
  }
}

/** PUT /api/services/:id — admin */
export async function updateService(req: Request, res: Response, next: NextFunction) {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!service) return next(createError("Service not found", 404));
    res.json({ success: true, data: service });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(createError("A service with this slug already exists", 409));
    }
    next(error);
  }
}

/** DELETE /api/services/:id — admin */
export async function deleteService(req: Request, res: Response, next: NextFunction) {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return next(createError("Service not found", 404));
    res.json({ success: true, message: "Service deleted" });
  } catch (error) {
    next(error);
  }
}

/** PATCH /api/services/reorder — admin */
export async function reorderServices(req: Request, res: Response, next: NextFunction) {
  try {
    // Body: [{ id: string, sortOrder: number }]
    const { items } = req.body as { items: { id: string; sortOrder: number }[] };
    if (!Array.isArray(items)) {
      return next(createError("items array is required", 400));
    }

    const bulkOps = items.map(({ id, sortOrder }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { sortOrder } },
      },
    }));

    await Service.bulkWrite(bulkOps);
    res.json({ success: true, message: "Services reordered" });
  } catch (error) {
    next(error);
  }
}
