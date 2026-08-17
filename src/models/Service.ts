import mongoose, { Document, Schema } from "mongoose";

export interface IService extends Document {
  slug: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  icon: string;
  image?: string;
  symptoms: string[];
  treatments: string[];
  metaTitle: string;
  metaDesc: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]+$/,
    },
    title: { type: String, required: true, trim: true },
    shortDesc: { type: String, required: true, trim: true },
    fullDesc: { type: String, required: true, trim: true },
    icon: { type: String, required: true, default: "Activity" },
    image: { type: String }, // S3 URL
    symptoms: [{ type: String, trim: true }],
    treatments: [{ type: String, trim: true }],
    metaTitle: { type: String, required: true, trim: true, maxlength: 70 },
    metaDesc: { type: String, required: true, trim: true, maxlength: 160 },
    isPublished: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for fast public API queries
ServiceSchema.index({ isPublished: 1, sortOrder: 1 });
ServiceSchema.index({ slug: 1 });

export const Service = mongoose.model<IService>("Service", ServiceSchema);
