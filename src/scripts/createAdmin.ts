/**
 * Creates the initial admin account.
 * Run once with: npm run create-admin
 */
import "dotenv/config";
import mongoose from "mongoose";
import readline from "readline";
import { env } from "../config/env";
import { Admin } from "../models/Admin";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function createAdmin() {
  await mongoose.connect(env.MONGODB_URI, { dbName: "sunshine_cms" });

  const existing = await Admin.findOne();
  if (existing) {
    console.log("ℹ️  An admin account already exists:");
    console.log(`   Email: ${existing.email}`);
    const overwrite = await ask("   Overwrite? (yes/no): ");
    if (overwrite.toLowerCase() !== "yes") {
      console.log("   Cancelled.");
      process.exit(0);
    }
    await Admin.deleteMany({});
  }

  console.log("\n👤 Create Admin Account\n");
  const name = await ask("   Full name: ");
  const email = await ask("   Email: ");
  const password = await ask("   Password (min 8 chars): ");

  if (!name || !email || !password || password.length < 8) {
    console.error("❌ Invalid input. Name, email, and password (8+ chars) are required.");
    process.exit(1);
  }

  const admin = await Admin.create({ name, email, password });
  console.log(`\n✅ Admin created successfully!`);
  console.log(`   Name:  ${admin.name}`);
  console.log(`   Email: ${admin.email}`);
  console.log(`\n   Login at: http://localhost:5173/login\n`);

  rl.close();
  await mongoose.disconnect();
  process.exit(0);
}

createAdmin().catch((error) => {
  console.error("❌ Failed to create admin:", error.message);
  process.exit(1);
});
