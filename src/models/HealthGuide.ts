import mongoose, { Document, Schema } from "mongoose";

interface FAQ {
  question: string;
  answer: string;
}

export interface IHealthGuide extends Document {
  slug: string;
  term: string;
  title: string;
  intro: string;
  definition: string;
  types: string[];
  symptoms: string[];
  causes: string[];
  treatment: string[];
  prevention: string[];
  whenToSeeDoctor: string;
  faq: FAQ[];
  relatedServices: string[];
  metaTitle: string;
  metaDesc: string;
  isPublished: boolean;
  publishedAt?: Date;
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

const HealthGuideSchema = new Schema<IHealthGuide>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]+$/,
    },
    term: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    intro: { type: String, required: true, trim: true },
    definition: { type: String, required: true, trim: true },
    types: [{ type: String, trim: true }],
    symptoms: [{ type: String, trim: true }],
    causes: [{ type: String, trim: true }],
    treatment: [{ type: String, trim: true }],
    prevention: [{ type: String, trim: true }],
    whenToSeeDoctor: { type: String, required: true, trim: true },
    faq: [FAQSchema],
    relatedServices: [{ type: String, trim: true }],
    metaTitle: { type: String, required: true, trim: true, maxlength: 70 },
    metaDesc: { type: String, required: true, trim: true, maxlength: 160 },
    isPublished: { type: Boolean, default: true },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

// Set publishedAt when first published
HealthGuideSchema.pre("save", function (next) {
  if (this.isModified("isPublished") && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

HealthGuideSchema.index({ isPublished: 1, publishedAt: -1 });
HealthGuideSchema.index({ slug: 1 });

export const HealthGuide = mongoose.model<IHealthGuide>(
  "HealthGuide",
  HealthGuideSchema
);
