import mongoose from "mongoose";
import { env } from "./env";

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) {
    console.log("📦 Using existing MongoDB connection");
    return;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      dbName: "sunshine_cms",
    });
    isConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
}

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected. Reconnecting...");
  isConnected = false;
});
