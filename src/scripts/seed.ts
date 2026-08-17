/**
 * Seed script: Migrates static data from the Next.js data/ files into MongoDB.
 * Run once with: npm run seed
 * Safe to re-run — uses upsert so existing data is updated, not duplicated.
 */
import "dotenv/config";
import mongoose from "mongoose";
import { env } from "../config/env";
import { Service } from "../models/Service";
import { Testimonial } from "../models/Testimonial";
import { HealthGuide } from "../models/HealthGuide";
import { LocationPage } from "../models/LocationPage";
import { getOrCreateSettings } from "../models/SiteSettings";

// ── Import static data ──────────────────────────────────────────────────────
// Adjust path if the Next.js frontend is in a different location
const FRONTEND_DATA_PATH = "../../../sunshine/data";

async function seed() {
  console.log("🌱 Starting database seed...\n");

  await mongoose.connect(env.MONGODB_URI, { dbName: "sunshine_cms" });
  console.log("✅ Connected to MongoDB\n");

  // ── Services ──────────────────────────────────────────────────────────────
  console.log("📋 Seeding services...");
  const { services } = await import(
    `${FRONTEND_DATA_PATH}/services` as string
  ).catch(() => {
    console.warn(
      "⚠️  Could not load services.ts — using inline data instead"
    );
    return { services: SERVICES_DATA };
  });

  let servicesSeeded = 0;
  for (let i = 0; i < services.length; i++) {
    const svc = services[i];
    await Service.findOneAndUpdate(
      { slug: svc.slug },
      { ...svc, sortOrder: i, isPublished: true },
      { upsert: true, new: true }
    );
    servicesSeeded++;
  }
  console.log(`   ✅ ${servicesSeeded} services seeded\n`);

  // ── Testimonials ─────────────────────────────────────────────────────────
  console.log("💬 Seeding testimonials...");
  const TESTIMONIALS_DATA = [
    { name: "Ramesh P.", rating: 5, quote: "Dr. Kakare is an excellent doctor — very humble and polite. He gave an accurate diagnosis for my diabetes that two other doctors had missed. I highly recommend him.", service: "Diabetes Management", date: new Date("2025-10-12"), isPublished: true },
    { name: "Sushma D.", rating: 5, quote: "The facility at Sunshine Hospital is exceptionally clean and hygienic. The staff is so supportive and kind. Best hospital experience I have had in Kolhapur.", service: "General Care", date: new Date("2025-11-05"), isPublished: true },
    { name: "Anil M.", rating: 5, quote: "My elderly mother has been a patient of Dr. Kakare for two years. He is incredibly respectful towards older patients — takes his time and explains everything clearly.", service: "Internal Medicine", date: new Date("2025-12-18"), isPublished: true },
    { name: "Priya K.", rating: 5, quote: "The organised system at Sunshine is impressive — minimal waiting time, proper documentation, and thorough follow-up. Very professional setup.", service: "Thyroid Treatment", date: new Date("2026-01-22"), isPublished: true },
    { name: "Vinod S.", rating: 5, quote: "I came for blood pressure management and the treatment has been excellent. Dr. Kakare's approach is scientific yet compassionate. My BP is now well controlled.", service: "Blood Pressure Management", date: new Date("2026-02-08"), isPublished: true },
    { name: "Meera T.", rating: 5, quote: "Went to the emergency at 2 AM with severe gastric pain. The 24/7 service truly works — I was attended to immediately. The staff was calm and reassuring throughout.", service: "Emergency Care", date: new Date("2026-03-14"), isPublished: true },
  ];

  // Clear and re-seed testimonials
  await Testimonial.deleteMany({});
  await Testimonial.insertMany(TESTIMONIALS_DATA);
  console.log(`   ✅ ${TESTIMONIALS_DATA.length} testimonials seeded\n`);

  // ── Health Guide ─────────────────────────────────────────────────────────
  console.log("📖 Seeding health guide articles...");
  const { healthGuideArticles } = await import(
    `${FRONTEND_DATA_PATH}/healthGuide` as string
  ).catch(() => {
    console.warn("⚠️  Could not load healthGuide.ts — skipping");
    return { healthGuideArticles: [] };
  });

  for (const article of healthGuideArticles) {
    await HealthGuide.findOneAndUpdate(
      { slug: article.slug },
      { ...article, isPublished: true, publishedAt: new Date() },
      { upsert: true, new: true }
    );
  }
  console.log(`   ✅ ${healthGuideArticles.length} articles seeded\n`);

  // ── Location Pages ────────────────────────────────────────────────────────
  console.log("📍 Seeding location pages...");
  const { locationPages } = await import(
    `${FRONTEND_DATA_PATH}/locations` as string
  ).catch(() => {
    console.warn("⚠️  Could not load locations.ts — skipping");
    return { locationPages: [] };
  });

  for (const page of locationPages) {
    await LocationPage.findOneAndUpdate(
      { slug: page.slug },
      { ...page, isPublished: true },
      { upsert: true, new: true }
    );
  }
  console.log(`   ✅ ${locationPages.length} location pages seeded\n`);

  // ── Site Settings ─────────────────────────────────────────────────────────
  console.log("⚙️  Creating default site settings...");
  await getOrCreateSettings();
  console.log("   ✅ Site settings ready\n");

  console.log("🎉 Seed complete! All data is now in MongoDB.");
  console.log(
    "   ⚠️  Remember to update phone numbers, images, and domain in Site Settings via CMS.\n"
  );

  await mongoose.disconnect();
  process.exit(0);
}

// ── Fallback inline services data ────────────────────────────────────────────
const SERVICES_DATA = [
  { slug: "diabetes-management", title: "Diabetes & Blood Pressure Management", shortDesc: "Expert care for Type 1, Type 2 diabetes and hypertension with personalized treatment plans.", fullDesc: "Dr. Onkar Kakare provides comprehensive diabetes and hypertension management including blood sugar monitoring, HbA1c tracking, lifestyle counselling, and medication management.", icon: "Activity", symptoms: ["High blood sugar", "Frequent urination", "Fatigue", "Elevated blood pressure", "Blurred vision", "Numbness in feet"], treatments: ["Blood glucose monitoring", "HbA1c testing", "Insulin therapy", "Antihypertensive medication", "Diet & lifestyle counselling", "Regular follow-up care"], metaTitle: "Diabetes & Blood Pressure Treatment | Sunshine Hospital Kolhapur", metaDesc: "Expert diabetes and blood pressure management at Sunshine Multi-Speciality Center, Rankala, Kolhapur." },
  { slug: "pain-management", title: "Pain Management", shortDesc: "Effective relief for chronic and acute pain conditions through tailored treatment protocols.", fullDesc: "Our pain management services address both acute and chronic pain conditions.", icon: "Shield", symptoms: ["Chronic back pain", "Joint pain", "Muscle aches", "Nerve pain", "Headaches", "Post-surgical pain"], treatments: ["Pain assessment & diagnosis", "Medication management", "Anti-inflammatory therapy", "Physiotherapy referral", "Nerve block consultation", "Lifestyle modification"], metaTitle: "Pain Management Specialist | Sunshine Hospital Kolhapur", metaDesc: "Chronic and acute pain management at Sunshine Multi-Speciality Center, Kolhapur." },
  { slug: "thyroid-treatment", title: "Thyroid Disease Treatment", shortDesc: "Diagnosis and management of hypothyroidism, hyperthyroidism, and thyroid nodules.", fullDesc: "Sunshine Hospital offers comprehensive thyroid evaluation and management.", icon: "Zap", symptoms: ["Unexplained weight gain or loss", "Fatigue and weakness", "Hair loss", "Cold or heat intolerance", "Palpitations", "Neck swelling"], treatments: ["Thyroid function tests (TSH, T3, T4)", "Ultrasound thyroid", "Thyroxine replacement therapy", "Anti-thyroid medication", "Radioiodine therapy referral", "Surgical referral if required"], metaTitle: "Thyroid Treatment in Kolhapur | Sunshine Hospital", metaDesc: "Expert thyroid disease diagnosis and treatment in Kolhapur." },
  { slug: "gastric-disorders", title: "Gastric Disorders", shortDesc: "Treatment for acidity, GERD, IBS, gastritis, and other digestive system conditions.", fullDesc: "Our gastric disorder services cover evaluation and treatment of acidity, GERD, IBS, and gastritis.", icon: "Heart", symptoms: ["Persistent acidity", "Heartburn", "Bloating and gas", "Nausea and vomiting", "Abdominal pain", "Altered bowel habits"], treatments: ["Detailed dietary assessment", "H. pylori testing", "Antacid & PPI therapy", "Endoscopy referral", "Probiotic therapy", "Lifestyle and diet counselling"], metaTitle: "Gastric Disorder Treatment | Sunshine Hospital Kolhapur", metaDesc: "Acidity, GERD, IBS, and gastritis treatment in Kolhapur." },
  { slug: "respiratory-problems", title: "Respiratory Problems", shortDesc: "Diagnosis and treatment of asthma, bronchitis, pneumonia, and other lung conditions.", fullDesc: "Sunshine Hospital provides comprehensive evaluation and management of respiratory conditions.", icon: "Wind", symptoms: ["Shortness of breath", "Persistent cough", "Wheezing", "Chest tightness", "Frequent respiratory infections", "Coughing up blood"], treatments: ["Spirometry testing", "Chest X-ray & CT referral", "Bronchodilator therapy", "Inhaled corticosteroids", "Antibiotic therapy", "Pulmonologist referral"], metaTitle: "Respiratory Treatment | Sunshine Hospital Kolhapur", metaDesc: "Expert treatment for asthma, bronchitis, pneumonia and respiratory conditions in Kolhapur." },
  { slug: "emergency-care", title: "Emergency & 24/7 Care", shortDesc: "Round-the-clock emergency services with immediate medical attention, 24 hours a day, 7 days a week.", fullDesc: "Sunshine Multi-Speciality Center operates 24/7 for all emergencies.", icon: "AlertCircle", symptoms: ["Severe chest pain", "Difficulty breathing", "High fever", "Severe abdominal pain", "Diabetic emergencies", "Acute trauma"], treatments: ["24/7 emergency triage", "IV fluid management", "Emergency medication", "Oxygen therapy", "ECG monitoring", "Specialist referral & transfer"], metaTitle: "24/7 Emergency Hospital Kolhapur | Sunshine Multi-Speciality Center", metaDesc: "24-hour emergency hospital in Rankala, Kolhapur." },
];

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
