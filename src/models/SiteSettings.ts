import mongoose, { Schema, HydratedDocument } from "mongoose";

interface Address {
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
}

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
}

interface SEOSettings {
  baseUrl: string;
  defaultOgImage: string;
}

interface HeroImages {
  main: string;
  doctor: string;
}

interface FacilityImages {
  clean: string;
  wheelchair: string;
  staff: string;
}

interface AggregateRating {
  ratingValue: number;
  reviewCount: number;
  source: string;
}

interface StatItem {
  value: string;
  label: string;
}

export interface ISiteSettings {
  _id: string;
  hospitalName: string;
  tagline: string;
  phone: string;
  email: string;
  emergencyPhone: string;
  address: Address;
  googleMapsEmbedUrl: string;
  googleMapsDirectionsUrl: string;
  socialLinks: SocialLinks;
  seo: SEOSettings;
  heroImages: HeroImages;
  facilityImages: FacilityImages;
  aggregateRating: AggregateRating;
  stats: StatItem[];
  openingHours: string;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    _id: { type: String, default: "singleton" },
    hospitalName: {
      type: String,
      required: true,
      default: "Sunshine Multi-Speciality Center",
    },
    tagline: {
      type: String,
      default: "Expert Care, Compassionate Service — 24/7",
    },
    phone: { type: String, required: true, default: "[PLACEHOLDER_PHONE]" },
    email: { type: String, default: "info@sunshinehospitalkolhapur.in" },
    emergencyPhone: { type: String, default: "[PLACEHOLDER_PHONE]" },
    address: {
      street: {
        type: String,
        default: "Opposite Dr. Yedekar Hospital, Near Nagojirao Patankar Highschool",
      },
      area: { type: String, default: "Rankala" },
      city: { type: String, default: "Kolhapur" },
      state: { type: String, default: "Maharashtra" },
      pincode: { type: String, default: "416013" },
    },
    googleMapsEmbedUrl: { type: String, default: "" },
    googleMapsDirectionsUrl: {
      type: String,
      default:
        "https://maps.google.com/?q=Sunshine+Multi+Speciality+Center+Rankala+Kolhapur",
    },
    socialLinks: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    seo: {
      baseUrl: {
        type: String,
        default: "https://sunshinehospitalkolhapur.in",
      },
      defaultOgImage: { type: String, default: "" },
    },
    heroImages: {
      main: { type: String, default: "" },
      doctor: { type: String, default: "" },
    },
    facilityImages: {
      clean: { type: String, default: "" },
      wheelchair: { type: String, default: "" },
      staff: { type: String, default: "" },
    },
    aggregateRating: {
      ratingValue: { type: Number, default: 4.8 },
      reviewCount: { type: Number, default: 200 },
      source: { type: String, default: "Google Reviews" },
    },
    stats: {
      type: [
        {
          value: { type: String, required: true },
          label: { type: String, required: true },
          _id: false,
        },
      ],
      default: [
        { value: "4.8★", label: "Patient Rating" },
        { value: "24/7", label: "Round-the-Clock Care" },
        { value: "500+", label: "Patients Treated" },
        { value: "10+", label: "Years of Experience" },
      ],
    },
    openingHours: { type: String, default: "24 Hours, 7 Days a Week" },
  },
  { timestamps: true, _id: false }
);

export const SiteSettings = mongoose.model("SiteSettings", SiteSettingsSchema);

/** Get or create the singleton settings document */
export async function getOrCreateSettings(): Promise<HydratedDocument<ISiteSettings>> {
  let settings = await SiteSettings.findById("singleton") as HydratedDocument<ISiteSettings> | null;
  if (!settings) {
    settings = await SiteSettings.create({ _id: "singleton" }) as HydratedDocument<ISiteSettings>;
  }
  return settings;
}
