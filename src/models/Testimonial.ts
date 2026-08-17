import mongoose, { Document, Schema } from "mongoose";

export interface ITestimonial extends Document {
  name: string;
  rating: number;
  quote: string;
  service: string;
  date: Date;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    quote: { type: String, required: true, trim: true, maxlength: 1000 },
    service: { type: String, required: true, trim: true },
    date: { type: Date, required: true, default: Date.now },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

TestimonialSchema.index({ isPublished: 1, date: -1 });

export const Testimonial = mongoose.model<ITestimonial>(
  "Testimonial",
  TestimonialSchema
);
