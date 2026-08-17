import { Request, Response, NextFunction } from "express";
import { Testimonial } from "../models/Testimonial";
import { createError } from "../middleware/errorHandler";

/** GET /api/testimonials — public */
export async function getTestimonials(_req: Request, res: Response, next: NextFunction) {
  try {
    const testimonials = await Testimonial.find({ isPublished: true }).sort({ date: -1 });
    res.json({ success: true, data: testimonials });
  } catch (error) {
    next(error);
  }
}

/** GET /api/testimonials/all — admin */
export async function getAllTestimonials(_req: Request, res: Response, next: NextFunction) {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json({ success: true, data: testimonials });
  } catch (error) {
    next(error);
  }
}

/** POST /api/testimonials — admin */
export async function createTestimonial(req: Request, res: Response, next: NextFunction) {
  try {
    const testimonial = await Testimonial.create(req.body);
    res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    next(error);
  }
}

/** PUT /api/testimonials/:id — admin */
export async function updateTestimonial(req: Request, res: Response, next: NextFunction) {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!testimonial) return next(createError("Testimonial not found", 404));
    res.json({ success: true, data: testimonial });
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/testimonials/:id — admin */
export async function deleteTestimonial(req: Request, res: Response, next: NextFunction) {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return next(createError("Testimonial not found", 404));
    res.json({ success: true, message: "Testimonial deleted" });
  } catch (error) {
    next(error);
  }
}
