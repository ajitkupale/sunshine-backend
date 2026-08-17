import mongoose, { Document, Schema } from "mongoose";

interface FAQ {
  question: string;
  answer: string;
}

export interface ILocationPage extends Document {
  slug: string;
  service: string;
  serviceSlug: string;
  city: string;
  area: string;
  intro: string;
  whyChooseUs: string[];
  nearbyLandmarks: string[];
  faq: FAQ[];
  metaTitle: string;
  metaDesc: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FAQSchema = new Schema<FAQ>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const LocationPageSchema = new Schema<ILocationPage>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]+$/,
    },
    service: { type: String, required: true, trim: true },
    serviceSlug: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    intro: { type: String, required: true, trim: true },
    whyChooseUs: [{ type: String, trim: true }],
    nearbyLandmarks: [{ type: String, trim: true }],
    faq: [FAQSchema],
    metaTitle: { type: String, required: true, trim: true, maxlength: 70 },
    metaDesc: { type: String, required: true, trim: true, maxlength: 160 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

LocationPageSchema.index({ isPublished: 1 });
LocationPageSchema.index({ slug: 1 });

export const LocationPage = mongoose.model<ILocationPage>(
  "LocationPage",
  LocationPageSchema
);
